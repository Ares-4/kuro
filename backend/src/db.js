import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'clients.json');

const defaultState = {
  clients: [],
  reminders: [],
  signedDocuments: []
};

let state = { ...defaultState };
let writeInFlight = Promise.resolve();

const ensureDataDir = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
};

const loadState = async () => {
  try {
    const content = await fs.promises.readFile(dbPath, 'utf8');
    const parsed = JSON.parse(content);
    state = { ...defaultState, ...parsed };
  } catch (error) {
    if (error.code === 'ENOENT') {
      state = { ...defaultState };
      await persist();
    } else {
      throw error;
    }
  }
};

export const persist = async () => {
  writeInFlight = writeInFlight.then(() =>
    fs.promises.writeFile(dbPath, JSON.stringify(state, null, 2), 'utf8')
  );
  return writeInFlight;
};

export const init = async () => {
  await ensureDataDir();
  await loadState();
};

const sortByCreatedAtDesc = (a, b) => new Date(b.created_at) - new Date(a.created_at);

export const createClient = async (client) => {
  state.clients.push(client);
  await persist();
};

export const listClients = () => [...state.clients].sort(sortByCreatedAtDesc);

export const findClient = (clientId) => state.clients.find((client) => client.client_id === clientId) || null;

export const addReminder = async (reminder) => {
  state.reminders.push(reminder);
  await persist();
};

export const listRemindersForClient = (clientId) =>
  state.reminders
    .filter((reminder) => reminder.client_id === clientId)
    .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));

export const listRemindersWithinWindow = (windowDays) => {
  const now = new Date();
  const future = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  return state.reminders.filter((reminder) => {
    const reminderDate = reminder.reminder_date ? new Date(reminder.reminder_date) : null;
    if (!reminderDate) {
      return false;
    }

    return reminderDate >= startOfDay(now) && reminderDate <= startOfDay(future);
  });
};

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const addSignedDocument = async (document) => {
  state.signedDocuments.push(document);
  await persist();
};

export const listSignedDocuments = (clientId) =>
  state.signedDocuments
    .filter((document) => document.client_id === clientId)
    .sort(sortByCreatedAtDesc);

export const exportCsv = () => {
  const header = 'client_id,name,email,phone,subject,message,source_page,reminder_opt_in,whatsapp_opt_in,visa_expiry_date,created_at';
  const rows = state.clients.map((client) =>
    [
      client.client_id,
      client.name,
      client.email,
      client.phone || '',
      (client.subject || '').replace(/\n/g, ' '),
      (client.message || '').replace(/\n/g, ' '),
      client.source_page || '',
      client.reminder_opt_in ? 1 : 0,
      client.whatsapp_opt_in ? 1 : 0,
      client.visa_expiry_date || '',
      client.created_at
    ]
      .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );

  return [header, ...rows].join('\n');
};

export const recordSignedDocumentStatus = async ({ clientId, envelopeId, status, documentUrl, documentType }) => {
  const existing = state.signedDocuments.find(
    (doc) => doc.client_id === clientId && doc.envelope_id === envelopeId
  );

  if (existing) {
    existing.status = status;
    existing.document_url = documentUrl;
    existing.document_type = documentType || existing.document_type;
    existing.updated_at = new Date().toISOString();
  } else {
    state.signedDocuments.push({
      client_id: clientId,
      envelope_id: envelopeId,
      status,
      document_url: documentUrl || '',
      document_type: documentType || 'Visa Agreement',
      created_at: new Date().toISOString()
    });
  }

  await persist();
};

export const getState = () => state;
