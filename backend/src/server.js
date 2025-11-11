import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { z } from 'zod';

import { init, run, all, get } from './db.js';
import { CONFIG } from './config.js';
import { sendIntakeConfirmation } from './messaging.js';
import { requestSignature } from './signatures.js';
import { createTrelloCard } from './workflow.js';
import { backupDatabase } from './backups.js';
import { processReminderWindow, scheduleReminderJobs } from './reminders.js';

const app = express();

await init();

const allowedOrigins = CONFIG.allowedOrigins
  ? CONFIG.allowedOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(helmet());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!allowedOrigins.length) {
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Admin-Token, X-Requested-With'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', publicLimiter);

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/admin', adminLimiter);

const requireAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token !== CONFIG.adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};

const intakeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length ? value : null)),
  subject: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length ? value : null)),
  message: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length ? value : null)),
  sourcePage: z
    .string()
    .trim()
    .min(1)
    .optional()
    .default('Website contact form'),
  reminderOptIn: z.boolean().optional().default(false),
  whatsappOptIn: z.boolean().optional().default(false),
  visaExpiryDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length ? value : null))
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: 'Visa expiry date must be a valid ISO date'
    }),
  reminderChannels: z
    .array(z.enum(['email', 'sms', 'whatsapp']))
    .optional()
    .default(['email'])
    .transform((channels) => (channels.length ? channels : ['email'])),
  reminderType: z.string().trim().optional().default('Visa expiry')
});

const signatureSchema = z.object({
  clientId: z.string().trim().min(1),
  signerName: z.string().trim().min(1),
  signerEmail: z.string().trim().email(),
  documentType: z.string().trim().optional().default('Visa Agreement')
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/intake', async (req, res, next) => {
  try {
    const parsed = intakeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors
      });
    }

    const payload = parsed.data;
    const clientId = `KURO-${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

    await run(
      `INSERT INTO clients (client_id, name, email, phone, subject, message, source_page, reminder_opt_in, whatsapp_opt_in, visa_expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        payload.name,
        payload.email,
        payload.phone,
        payload.subject,
        payload.message,
        payload.sourcePage,
        payload.reminderOptIn ? 1 : 0,
        payload.whatsappOptIn ? 1 : 0,
        payload.visaExpiryDate
      ]
    );

    if (payload.reminderOptIn && payload.visaExpiryDate) {
      await run(
        `INSERT INTO reminders (client_id, reminder_type, reminder_date, delivery_channels)
         VALUES (?, ?, ?, ?)`,
        [clientId, payload.reminderType, payload.visaExpiryDate, payload.reminderChannels.join(',')]
      );
    }

    sendIntakeConfirmation({
      to: payload.email,
      name: payload.name,
      clientId,
      reminderOptIn: payload.reminderOptIn,
      visaExpiryDate: payload.visaExpiryDate || undefined
    }).catch((error) => {
      console.error('Failed to send intake confirmation', error);
    });

    createTrelloCard({
      name: payload.name,
      clientId,
      email: payload.email,
      phone: payload.phone,
      reminderDate: payload.visaExpiryDate
    }).catch((error) => {
      console.error('Unable to create Trello card', error);
    });

    res.status(201).json({
      status: 'success',
      message: 'Thanks for reaching out! We will contact you shortly.',
      clientId
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/clients', requireAdmin, async (_req, res, next) => {
  try {
    const clients = await all('SELECT * FROM clients ORDER BY created_at DESC');
    res.json({ clients });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/clients/:clientId', requireAdmin, async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const client = await get('SELECT * FROM clients WHERE client_id = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Not found' });
    }
    const reminders = await all('SELECT * FROM reminders WHERE client_id = ? ORDER BY reminder_date', [clientId]);
    const documents = await all('SELECT * FROM signed_documents WHERE client_id = ?', [clientId]);
    res.json({ client, reminders, documents });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/export.csv', requireAdmin, async (_req, res, next) => {
  try {
    const clients = await all('SELECT * FROM clients ORDER BY created_at DESC');
    const header = 'client_id,name,email,phone,subject,message,source_page,reminder_opt_in,whatsapp_opt_in,visa_expiry_date,created_at\n';
    const rows = clients
      .map((c) =>
        [
          c.client_id,
          c.name,
          c.email,
          c.phone || '',
          (c.subject || '').replace(/\n/g, ' '),
          (c.message || '').replace(/\n/g, ' '),
          c.source_page || '',
          c.reminder_opt_in,
          c.whatsapp_opt_in,
          c.visa_expiry_date || '',
          c.created_at
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`clients-${Date.now()}.csv`);
    res.send(`${header}${rows}`);
  } catch (error) {
    next(error);
  }
});

app.post('/api/signatures/envelopes', async (req, res, next) => {
  try {
    const parsed = signatureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors
      });
    }

    const { clientId, signerName, signerEmail, documentType } = parsed.data;
    const client = await get('SELECT * FROM clients WHERE client_id = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const response = await requestSignature({ clientId, signerName, signerEmail, documentType });

    if (response.status === 'disabled') {
      return res.status(503).json(response);
    }

    await run(
      `INSERT INTO signed_documents (client_id, envelope_id, document_type, status)
       VALUES (?, ?, ?, ?)`,
      [clientId, response.envelopeId, documentType, 'sent']
    );

    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/reminders/run', requireAdmin, async (_req, res, next) => {
  try {
    const processed = await processReminderWindow();
    res.json({ status: 'queued', processed });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Unable to process your request right now.' });
});

processReminderWindow().catch((error) => {
  console.error('Initial reminder sweep failed', error);
});

scheduleReminderJobs();

cron.schedule('0 3 * * 1', () => {
  backupDatabase().catch((error) => {
    console.error('Backup failed', error);
  });
});

app.listen(CONFIG.port, () => {
  console.log(`Kuro backend listening on port ${CONFIG.port}`);
});
