import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_ENV_PATH = path.join(__dirname, '..', '.env');

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\n/g, '\n');

    if (key) {
      env[key] = value;
    }
  }

  return env;
};

const envFilePath = process.env.DOTENV_PATH || DEFAULT_ENV_PATH;
const fileEnv = parseEnvFile(envFilePath);
const mergedEnv = { ...fileEnv, ...process.env };

const getBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const CONFIG = {
  port: Number(mergedEnv.PORT || 4000),
  adminToken: mergedEnv.ADMIN_TOKEN || 'change-me-admin-token',
  allowedOrigins: mergedEnv.ALLOWED_ORIGINS || '',
  email: {
    host: mergedEnv.SMTP_HOST || '',
    port: Number(mergedEnv.SMTP_PORT || 587),
    user: mergedEnv.SMTP_USER || '',
    pass: mergedEnv.SMTP_PASS || '',
    from: mergedEnv.EMAIL_FROM || 'support@kuroeduconsultancy.com',
    secure: getBoolean(mergedEnv.SMTP_SECURE, false)
  },
  twilio: {
    accountSid: mergedEnv.TWILIO_ACCOUNT_SID || '',
    authToken: mergedEnv.TWILIO_AUTH_TOKEN || '',
    messagingServiceSid: mergedEnv.TWILIO_MESSAGING_SERVICE_SID || '',
    whatsappFrom: mergedEnv.TWILIO_WHATSAPP_FROM || ''
  },
  docusign: {
    integrationKey: mergedEnv.DOCUSIGN_INTEGRATION_KEY || '',
    userId: mergedEnv.DOCUSIGN_USER_ID || '',
    authServer: mergedEnv.DOCUSIGN_AUTH_SERVER || 'account.docusign.com',
    privateKey: mergedEnv.DOCUSIGN_PRIVATE_KEY || '',
    templateId: mergedEnv.DOCUSIGN_TEMPLATE_ID || '',
    basePath: mergedEnv.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi'
  },
  reminderWindowDays: Number(mergedEnv.REMINDER_WINDOW_DAYS || 14),
  trello: {
    apiKey: mergedEnv.TRELLO_API_KEY || '',
    token: mergedEnv.TRELLO_TOKEN || '',
    listId: mergedEnv.TRELLO_LIST_ID || ''
  }
};

export const RAW_ENV = mergedEnv;
