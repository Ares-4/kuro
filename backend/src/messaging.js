import net from 'net';
import tls from 'tls';
import { CONFIG } from './config.js';

const emailConfigured = Boolean(CONFIG.email.host && CONFIG.email.user && CONFIG.email.pass);
const twilioConfigured = Boolean(CONFIG.twilio.accountSid && CONFIG.twilio.authToken);

const readResponse = (socket) =>
  new Promise((resolve, reject) => {
    let buffer = '';

    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1];
      if (lastLine && /^\d{3} /.test(lastLine)) {
        socket.off('data', onData);
        resolve(buffer);
      }
    };

    socket.once('error', reject);
    socket.on('data', onData);
  });

const sendCommand = async (socket, command) => {
  if (command) {
    socket.write(`${command}\r\n`);
  }
  const response = await readResponse(socket);
  const statusCode = Number(response.slice(0, 3));
  if (statusCode >= 400) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
  return response;
};

const upgradeToTls = (socket, host) =>
  new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () => {
      secureSocket.removeListener('error', reject);
      resolve(secureSocket);
    });

    secureSocket.once('error', reject);
  });

const sendSmtpMail = async ({ to, subject, html }) => {
  const { host, port, user, pass, from, secure } = CONFIG.email;
  const hostname = 'kuro-backend.local';

  let socket = secure
    ? await new Promise((resolve, reject) => {
        const tlsSocket = tls.connect(port, host, { servername: host }, () => {
          tlsSocket.removeListener('error', reject);
          resolve(tlsSocket);
        });
        tlsSocket.once('error', reject);
      })
    : await new Promise((resolve, reject) => {
        const plainSocket = net.createConnection(port, host, () => {
          plainSocket.removeListener('error', reject);
          resolve(plainSocket);
        });
        plainSocket.once('error', reject);
      });

  await readResponse(socket); // greeting
  await sendCommand(socket, `EHLO ${hostname}`);

  if (!secure) {
    await sendCommand(socket, 'STARTTLS');
    socket = await upgradeToTls(socket, host);
    await sendCommand(socket, `EHLO ${hostname}`);
  }

  await sendCommand(socket, 'AUTH LOGIN');
  await sendCommand(socket, Buffer.from(user).toString('base64'));
  await sendCommand(socket, Buffer.from(pass).toString('base64'));
  await sendCommand(socket, `MAIL FROM:<${from}>`);
  await sendCommand(socket, `RCPT TO:<${to}>`);
  await sendCommand(socket, 'DATA');

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
    '.',
    ''
  ].join('\r\n');

  socket.write(`${message}`);
  const dataResponse = await readResponse(socket);
  const statusCode = Number(dataResponse.slice(0, 3));
  if (statusCode >= 400) {
    throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`);
  }

  await sendCommand(socket, 'QUIT');
  socket.end();
};

const sendTwilioMessage = async (payload) => {
  if (!twilioConfigured) {
    return;
  }

  const url = new URL(
    `/2010-04-01/Accounts/${CONFIG.twilio.accountSid}/Messages.json`,
    'https://api.twilio.com'
  );

  const body = new URLSearchParams(payload);
  const auth = Buffer.from(`${CONFIG.twilio.accountSid}:${CONFIG.twilio.authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio API error: ${response.status} ${text}`);
  }
};

export const sendIntakeConfirmation = async ({ to, name, clientId, reminderOptIn, visaExpiryDate }) => {
  if (!emailConfigured) {
    console.info('Skipping email confirmation; SMTP is not configured.');
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

  await sendSmtpMail({
    to,
    subject: 'We received your enquiry',
    html
  });
};

const ensureChannelsArray = (channels) => {
  if (!Array.isArray(channels)) {
    if (typeof channels === 'string') {
      try {
        const parsed = JSON.parse(channels);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (_) {
        return channels.split(',').map((value) => value.trim()).filter(Boolean);
      }
    }
    return [];
  }

  return channels;
};

export const sendReminderNotification = async ({ client, reminder }) => {
  const channels = ensureChannelsArray(reminder.delivery_channels);
  const tasks = [];

  if (emailConfigured && channels.includes('email')) {
    const html = `
      <p>Hi ${client.name},</p>
      <p>This is a friendly reminder that <strong>${reminder.reminder_type}</strong> is scheduled for ${
        reminder.reminder_date
      }.</p>
      <p>Your Client ID is <strong>${client.client_id}</strong>.</p>
      <p>- Kuro Educational Consultancy</p>
    `;

    tasks.push(
      sendSmtpMail({
        to: client.email,
        subject: `Reminder: ${reminder.reminder_type} for ${client.name}`,
        html
      })
    );
  }

  if (twilioConfigured && channels.includes('sms') && client.phone) {
    tasks.push(
      sendTwilioMessage({
        To: client.phone,
        MessagingServiceSid: CONFIG.twilio.messagingServiceSid,
        Body: `Reminder: ${reminder.reminder_type} is scheduled for ${reminder.reminder_date}. Client ID: ${client.client_id}`
      })
    );
  }

  if (
    twilioConfigured &&
    CONFIG.twilio.whatsappFrom &&
    client.whatsapp_opt_in &&
    channels.includes('whatsapp') &&
    client.phone
  ) {
    tasks.push(
      sendTwilioMessage({
        To: `whatsapp:${client.phone}`,
        From: `whatsapp:${CONFIG.twilio.whatsappFrom}`,
        Body: `Kuro Educational Consultancy reminder: ${reminder.reminder_type} on ${reminder.reminder_date}. Client ID ${client.client_id}`
      })
    );
  }

  if (!tasks.length) {
    return;
  }

  await Promise.allSettled(tasks);
};
