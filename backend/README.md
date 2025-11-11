# Kuro CRM Backend

This Express service powers the CRM intake, automated reminders, WhatsApp notifications, and DocuSign e-signature handoff for Kuro Educational Consultancy.

## Getting started

```bash
cd backend
npm install
npm run migrate
npm start
```

Environment variables can be supplied through a `.env` file. See `src/config.js` for the full list, including optional integrations for SendGrid, Twilio (SMS & WhatsApp), DocuSign, AWS S3 backups, and Trello.

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `4000`). |
| `ADMIN_TOKEN` | Shared secret for admin endpoints. |
| `ALLOWED_ORIGINS` | Optional comma-separated list used by CORS. |
| `SENDGRID_*` | API key and sender email for outbound mail. |
| `TWILIO_*` | Credentials for SMS/WhatsApp reminders. |
| `DOCUSIGN_*` | Credentials for envelope creation. |
| `AWS_*` | Optional bucket credentials for automated backups. |
| `TRELLO_*` | Optional Kanban automation keys. |
| `REMINDER_WINDOW_DAYS` | Number of days ahead to queue reminders (default `14`). |

The service persists client data to `data/clients.sqlite`. The file is created automatically on first run and is excluded from version control.

## API

- `GET /api/health` — Basic readiness probe.
- `POST /api/intake` — Accepts website form submissions, returns `{ clientId }`, and queues confirmation messages/automation.
- `POST /api/signatures/envelopes` — Generates a DocuSign envelope and returns a signing URL.
- `POST /api/admin/reminders/run` — Triggers reminder processing on demand (requires admin token).
- `GET /api/admin/clients` — Requires the `x-admin-token` header; returns the latest clients.
- `GET /api/admin/clients/:clientId` — Detail view for a single client with reminders and signed document metadata.
- `GET /api/admin/export.csv` — CSV export of all clients.

Automated visa reminders run daily at 08:00 server time, while weekly backups to S3 execute every Monday at 03:00 when AWS credentials are configured.
