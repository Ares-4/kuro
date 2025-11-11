import sendgrid from '@sendgrid/mail';
import twilio from 'twilio';
import { CONFIG } from './config.js';

const emailConfigured = Boolean(CONFIG.sendgridApiKey);
if (emailConfigured) {
  sendgrid.setApiKey(CONFIG.sendgridApiKey);
}

let smsClient = null;
const smsConfigured = CONFIG.twilio.accountSid && CONFIG.twilio.authToken;
if (smsConfigured) {
  smsClient = twilio(CONFIG.twilio.accountSid, CONFIG.twilio.authToken);
}

export const sendIntakeConfirmation = async ({
  to,
  name,
  clientId,
  reminderOptIn,
  visaExpiryDate
}) => {
  if (!emailConfigured) {
    return;
  }

  const html = `
    <p>Hi ${name},</p>
    <p>Thank you for contacting Kuro Educational Consultancy. Your Client ID is <strong>${clientId}</strong>.</p>
    <p>We'll use this ID to reference your visa or travel case. ${
      reminderOptIn
        ? `You opted in for automated reminders. We'll notify you ahead of your visa expiry${
            visaExpiryDate ? ` on ${visaExpiryDate}` : ''
          }.`
        : 'You can enable reminders at any time by replying to this email.'
    }</p>
    <p>If you need immediate assistance, reply to this message or WhatsApp us at +263 71 234 5678.</p>
    <p>Warm regards,<br/>Kuro Educational Consultancy</p>
  `;

  await sendgrid.send({
    to,
    from: CONFIG.sendgridFromEmail,
    subject: 'We received your enquiry',
    html
  });
};

export const sendReminderNotification = async ({ client, reminder }) => {
  const promises = [];

  if (emailConfigured && reminder.delivery_channels.includes('email')) {
    promises.push(
      sendgrid.send({
        to: client.email,
        from: CONFIG.sendgridFromEmail,
        subject: `Reminder: ${reminder.reminder_type} for ${client.name}`,
        html: `<p>Hi ${client.name},</p>
          <p>This is a friendly reminder that <strong>${reminder.reminder_type}</strong> is scheduled for ${reminder.reminder_date}.</p>
          <p>Your Client ID is <strong>${client.client_id}</strong>.</p>
          <p>- Kuro Educational Consultancy</p>`
      })
    );
  }

  if (smsConfigured && reminder.delivery_channels.includes('sms')) {
    promises.push(
      smsClient.messages.create({
        to: client.phone,
        messagingServiceSid: CONFIG.twilio.messagingServiceSid,
        body: `Reminder: ${reminder.reminder_type} is scheduled for ${reminder.reminder_date}. Client ID: ${client.client_id}`
      })
    );
  }

  if (
    smsConfigured &&
    CONFIG.twilio.whatsappFrom &&
    client.whatsapp_opt_in &&
    reminder.delivery_channels.includes('whatsapp')
  ) {
    promises.push(
      smsClient.messages.create({
        from: `whatsapp:${CONFIG.twilio.whatsappFrom}`,
        to: `whatsapp:${client.phone}`,
        body: `Kuro Educational Consultancy reminder: ${reminder.reminder_type} on ${reminder.reminder_date}. Client ID ${client.client_id}`
      })
    );
  }

  await Promise.allSettled(promises);
};
