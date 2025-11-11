import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: process.env.DOTENV_PATH || path.join(__dirname, '..', '.env') });

export const CONFIG = {
  port: process.env.PORT || 4000,
  adminToken: process.env.ADMIN_TOKEN || 'change-me-admin-token',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '',
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'support@kuroeduconsultancy.com',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || ''
  },
  docusign: {
    integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || '',
    userId: process.env.DOCUSIGN_USER_ID || '',
    authServer: process.env.DOCUSIGN_AUTH_SERVER || 'account.docusign.com',
    privateKey: process.env.DOCUSIGN_PRIVATE_KEY || '',
    templateId: process.env.DOCUSIGN_TEMPLATE_ID || '',
    basePath: process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi'
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    backupBucket: process.env.AWS_BACKUP_BUCKET || ''
  },
  trello: {
    apiKey: process.env.TRELLO_API_KEY || '',
    token: process.env.TRELLO_TOKEN || '',
    listId: process.env.TRELLO_LIST_ID || ''
  },
  reminderWindowDays: Number(process.env.REMINDER_WINDOW_DAYS || 14)
};
