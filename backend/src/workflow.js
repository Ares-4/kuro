import fetch from 'node-fetch';
import { CONFIG } from './config.js';

const trelloConfigured = CONFIG.trello.apiKey && CONFIG.trello.token && CONFIG.trello.listId;

export const createTrelloCard = async ({ name, clientId, email, phone, reminderDate, handler = 'Unassigned' }) => {
  if (!trelloConfigured) {
    return null;
  }

  const description = [`Client ID: ${clientId}`, `Email: ${email}`, `Phone: ${phone || 'N/A'}`];
  if (reminderDate) {
    description.push(`Visa expiry: ${reminderDate}`);
  }

  const response = await fetch(`https://api.trello.com/1/cards?idList=${CONFIG.trello.listId}&key=${CONFIG.trello.apiKey}&token=${CONFIG.trello.token}`, {
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
