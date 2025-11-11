import { CONFIG } from './config.js';

const trelloConfigured = Boolean(CONFIG.trello.apiKey && CONFIG.trello.token && CONFIG.trello.listId);

export const createTrelloCard = async ({ name, clientId, email, phone, reminderDate, handler = 'Unassigned' }) => {
  if (!trelloConfigured) {
    return null;
  }

  const description = [`Client ID: ${clientId}`, `Email: ${email}`, `Handler: ${handler}`];
  if (phone) {
    description.push(`Phone: ${phone}`);
  }
  if (reminderDate) {
    description.push(`Visa expiry: ${reminderDate}`);
  }

  const url = new URL('https://api.trello.com/1/cards');
  url.searchParams.set('idList', CONFIG.trello.listId);
  url.searchParams.set('key', CONFIG.trello.apiKey);
  url.searchParams.set('token', CONFIG.trello.token);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${name} — ${clientId}`,
      desc: description.join('\n'),
      due: reminderDate || null
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create Trello card: ${response.status} ${text}`);
  }

  return response.json();
};
