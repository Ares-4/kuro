import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';

import {
  init,
  createClient,
  listClients,
  findClient,
  addReminder,
  listRemindersForClient,
  addSignedDocument,
  listSignedDocuments,
  exportCsv
} from './db.js';
import { CONFIG } from './config.js';
import { sendIntakeConfirmation } from './messaging.js';
import { requestSignature } from './signatures.js';
import { createTrelloCard } from './workflow.js';
import { backupDatabase } from './backups.js';
import { processReminderWindow, scheduleReminderJobs } from './reminders.js';

const JSON_LIMIT = 1 * 1024 * 1024; // 1MB
const allowedOrigins = CONFIG.allowedOrigins
  ? CONFIG.allowedOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const createRateLimiter = ({ windowMs, limit }) => {
  const hits = new Map();

  return (req) => {
    const ip = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.reset < now) {
      hits.set(ip, { count: 1, reset: now + windowMs });
      return false;
    }

    if (entry.count >= limit) {
      return true;
    }

    entry.count += 1;
    return false;
  };
};

const publicLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 100 });
const adminLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
};

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > JSON_LIMIT) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    req.on('error', reject);
  });

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedReminderChannels = new Set(['email', 'sms', 'whatsapp']);

const parseReminderChannels = (value) => {
  if (Array.isArray(value)) {
    const filtered = value.filter((channel) => allowedReminderChannels.has(channel));
    return filtered.length ? filtered : ['email'];
  }

  if (typeof value === 'string') {
    return parseReminderChannels(value.split(',').map((item) => item.trim()).filter(Boolean));
  }

  return ['email'];
};

const validateIntake = (payload) => {
  const errors = {};
  const data = {};

  const name = (payload.name || '').toString().trim();
  if (!name) {
    errors.name = ['Name is required'];
  } else {
    data.name = name;
  }

  const email = (payload.email || '').toString().trim();
  if (!email || !emailRegex.test(email)) {
    errors.email = ['Valid email is required'];
  } else {
    data.email = email;
  }

  const phone = (payload.phone || '').toString().trim();
  data.phone = phone.length ? phone : null;

  const subject = (payload.subject || '').toString().trim();
  data.subject = subject.length ? subject : null;

  const message = (payload.message || '').toString().trim();
  data.message = message.length ? message : null;

  const sourcePage = (payload.sourcePage || '').toString().trim();
  data.sourcePage = sourcePage.length ? sourcePage : 'Website contact form';

  data.reminderOptIn = normalizeBoolean(payload.reminderOptIn, false);
  data.whatsappOptIn = normalizeBoolean(payload.whatsappOptIn, false);

  const visaExpiryDate = (payload.visaExpiryDate || '').toString().trim();
  if (visaExpiryDate.length) {
    const timestamp = Date.parse(visaExpiryDate);
    if (Number.isNaN(timestamp)) {
      errors.visaExpiryDate = ['Visa expiry date must be a valid ISO date'];
    } else {
      data.visaExpiryDate = new Date(timestamp).toISOString().split('T')[0];
    }
  } else {
    data.visaExpiryDate = null;
  }

  data.reminderChannels = parseReminderChannels(payload.reminderChannels);

  const reminderType = (payload.reminderType || '').toString().trim();
  data.reminderType = reminderType.length ? reminderType : 'Visa expiry';

  return { valid: Object.keys(errors).length === 0, data, errors };
};

const validateSignatureRequest = (payload) => {
  const errors = {};
  const data = {};

  const clientId = (payload.clientId || '').toString().trim();
  if (!clientId) {
    errors.clientId = ['Client ID is required'];
  } else {
    data.clientId = clientId;
  }

  const signerName = (payload.signerName || '').toString().trim();
  if (!signerName) {
    errors.signerName = ['Signer name is required'];
  } else {
    data.signerName = signerName;
  }

  const signerEmail = (payload.signerEmail || '').toString().trim();
  if (!signerEmail || !emailRegex.test(signerEmail)) {
    errors.signerEmail = ['Valid signer email is required'];
  } else {
    data.signerEmail = signerEmail;
  }

  const documentType = (payload.documentType || '').toString().trim();
  data.documentType = documentType.length ? documentType : 'Visa Agreement';

  return { valid: Object.keys(errors).length === 0, data, errors };
};

const hasValidAdminToken = (req) => {
  const token = req.headers['x-admin-token'];
  return token === CONFIG.adminToken;
};

const applySecurityHeaders = (res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
};

const applyCors = (req, res) => {
  const origin = req.headers.origin;

  if (!allowedOrigins.length) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Admin-Token, X-Requested-With'
  );
};

const scheduleBackups = () => {
  const runTracker = new Set();

  setInterval(() => {
    const now = new Date();
    const key = now.toISOString().slice(0, 10);

    if (now.getDay() === 1 && now.getHours() === 3 && now.getMinutes() === 0) {
      if (runTracker.has(key)) {
        return;
      }
      runTracker.add(key);
      backupDatabase().catch((error) => {
        console.error('Backup failed', error);
      });
    } else if (runTracker.size > 10) {
      const [oldest] = [...runTracker].sort();
      runTracker.delete(oldest);
    }
  }, 60 * 1000);
};

const logRequest = (req, res, startTime) => {
  const duration = Date.now() - startTime;
  console.info(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
};

await init();

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  applySecurityHeaders(res);
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith('/api/admin')) {
      if (adminLimiter(req)) {
        sendJson(res, 429, { error: 'Too many requests' });
        return;
      }
      if (!hasValidAdminToken(req)) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
    } else if (url.pathname.startsWith('/api/')) {
      if (publicLimiter(req)) {
        sendJson(res, 429, { error: 'Too many requests' });
        return;
      }
    }

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/intake') {
      const body = await parseJsonBody(req);
      const { valid, data, errors } = validateIntake(body);
      if (!valid) {
        sendJson(res, 400, { error: 'Validation failed', details: errors });
        return;
      }

      const clientId = `KURO-${crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
      const createdAt = new Date().toISOString();

      await createClient({
        client_id: clientId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        source_page: data.sourcePage,
        reminder_opt_in: data.reminderOptIn,
        whatsapp_opt_in: data.whatsappOptIn,
        visa_expiry_date: data.visaExpiryDate,
        created_at: createdAt
      });

      if (data.reminderOptIn && data.visaExpiryDate) {
        await addReminder({
          id: crypto.randomUUID(),
          client_id: clientId,
          reminder_type: data.reminderType,
          reminder_date: data.visaExpiryDate,
          delivery_channels: data.reminderChannels,
          created_at: createdAt
        });
      }

      sendIntakeConfirmation({
        to: data.email,
        name: data.name,
        clientId,
        reminderOptIn: data.reminderOptIn,
        visaExpiryDate: data.visaExpiryDate || undefined
      }).catch((error) => {
        console.error('Failed to send intake confirmation', error);
      });

      createTrelloCard({
        name: data.name,
        clientId,
        email: data.email,
        phone: data.phone,
        reminderDate: data.visaExpiryDate
      }).catch((error) => {
        console.error('Unable to create Trello card', error);
      });

      sendJson(res, 201, {
        status: 'success',
        message: 'Thanks for reaching out! We will contact you shortly.',
        clientId
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/clients') {
      const clients = listClients();
      sendJson(res, 200, { clients });
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/admin/clients/')) {
      const clientId = decodeURIComponent(url.pathname.replace('/api/admin/clients/', ''));
      const client = findClient(clientId);
      if (!client) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }

      const reminders = listRemindersForClient(clientId);
      const documents = listSignedDocuments(clientId);
      sendJson(res, 200, { client, reminders, documents });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/export.csv') {
      const csv = exportCsv();
      const filename = `clients-${Date.now()}.csv`;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(csv);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/signatures/envelopes') {
      const body = await parseJsonBody(req);
      const { valid, data, errors } = validateSignatureRequest(body);
      if (!valid) {
        sendJson(res, 400, { error: 'Validation failed', details: errors });
        return;
      }

      const client = findClient(data.clientId);
      if (!client) {
        sendJson(res, 404, { error: 'Client not found' });
        return;
      }

      try {
        const response = await requestSignature({
          clientId: data.clientId,
          signerName: data.signerName,
          signerEmail: data.signerEmail,
          documentType: data.documentType
        });

        if (response.status === 'disabled') {
          sendJson(res, 503, response);
          return;
        }

        await addSignedDocument({
          client_id: data.clientId,
          envelope_id: response.envelopeId,
          document_type: data.documentType,
          status: 'sent',
          document_url: '',
          created_at: new Date().toISOString()
        });

        sendJson(res, 200, response);
      } catch (error) {
        console.error('Failed to request signature', error);
        sendJson(res, 502, { error: 'Unable to initiate the signing session.' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/reminders/run') {
      const processed = await processReminderWindow();
      sendJson(res, 200, { status: 'queued', processed });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Unhandled error', error);
    if (!res.headersSent) {
      const status =
        error.message === 'Payload too large'
          ? 413
          : error.message === 'Invalid JSON payload'
            ? 400
            : 500;
      const message =
        status === 500 ? 'Unable to process your request right now.' : error.message;
      sendJson(res, status, { error: message });
    } else {
      res.end();
    }
  } finally {
    logRequest(req, res, startTime);
  }
});

server.listen(CONFIG.port, () => {
  console.log(`Kuro backend listening on port ${CONFIG.port}`);
});

processReminderWindow().catch((error) => {
  console.error('Initial reminder sweep failed', error);
});

scheduleReminderJobs();
scheduleBackups();
