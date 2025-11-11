import cron from 'node-cron';
import { all, get } from './db.js';
import { CONFIG } from './config.js';
import { sendReminderNotification } from './messaging.js';

export const processReminderWindow = async () => {
  const reminders = await all(
    `SELECT r.id, r.client_id, r.reminder_type, r.reminder_date, r.delivery_channels
       FROM reminders r
      WHERE date(r.reminder_date) <= date('now', '+${CONFIG.reminderWindowDays} day')
        AND date(r.reminder_date) >= date('now')`
  );

  for (const reminder of reminders) {
    const client = await get('SELECT * FROM clients WHERE client_id = ?', [reminder.client_id]);
    if (client) {
      try {
        await sendReminderNotification({ client, reminder });
      } catch (error) {
        console.error('Failed to deliver reminder notification', error);
      }
    }
  }

  return reminders.length;
};

export const scheduleReminderJobs = () =>
  cron.schedule('0 8 * * *', () => {
    processReminderWindow().catch((error) => {
      console.error('Scheduled reminder processing failed', error);
    });
  });
