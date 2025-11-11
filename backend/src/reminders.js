import { listRemindersWithinWindow, findClient } from './db.js';
import { CONFIG } from './config.js';
import { sendReminderNotification } from './messaging.js';

const REMINDER_CHECK_INTERVAL_MS = 60 * 1000;

export const processReminderWindow = async () => {
  const reminders = listRemindersWithinWindow(CONFIG.reminderWindowDays);
  let processed = 0;

  for (const reminder of reminders) {
    const client = findClient(reminder.client_id);
    if (!client) {
      continue;
    }

    try {
      await sendReminderNotification({ client, reminder });
      processed += 1;
    } catch (error) {
      console.error('Failed to deliver reminder notification', error);
    }
  }

  return processed;
};

const hasRunToday = new Set();

const reminderInterval = () => {
  setInterval(() => {
    const now = new Date();
    const key = now.toISOString().slice(0, 10);

    if (now.getHours() === 8 && now.getMinutes() === 0) {
      if (hasRunToday.has(key)) {
        return;
      }

      hasRunToday.add(key);
      processReminderWindow().catch((error) => {
        console.error('Scheduled reminder processing failed', error);
      });
    } else if (hasRunToday.size > 10) {
      const oldest = [...hasRunToday].sort()[0];
      hasRunToday.delete(oldest);
    }
  }, REMINDER_CHECK_INTERVAL_MS);
};

export const scheduleReminderJobs = () => {
  reminderInterval();
};
