# Kuro CRM Backend

This lightweight Node.js service powers the CRM intake, automated reminders, WhatsApp notifications, and DocuSign e-signature handoff for Kuro Educational Consultancy without requiring any external npm dependencies.

## Getting started

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm start
```

The `.env.example` file documents every configurable integration. Update the placeholder values before starting the server. Environment variables can also be supplied through the shell or a different dotenv path via `DOTENV_PATH`.

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `4000`). |
| `ADMIN_TOKEN` | Shared secret for admin endpoints. |
| `ALLOWED_ORIGINS` | Optional comma-separated list used by CORS. |
| `SMTP_*`, `EMAIL_FROM` | SMTP host credentials and default sender for outbound mail. |
| `TWILIO_*` | Credentials for SMS/WhatsApp reminders. |
| `DOCUSIGN_*` | Credentials for envelope creation. |
| `TRELLO_*` | Optional Kanban automation keys. |
| `REMINDER_WINDOW_DAYS` | Number of days ahead to queue reminders (default `14`). |

**Note:** Optional features such as Twilio messaging, DocuSign signing, and Trello automation stay dormant until their corresponding environment variables are set. The service still runs locally without those accounts.

The service persists client data to `data/clients.json` and writes rolling backups to `backups/`. Both directories are created automatically on first run and are excluded from version control.

## API

- `GET /api/health` — Basic readiness probe.
- `POST /api/intake` — Accepts website form submissions, returns `{ clientId }`, and queues confirmation messages/automation.
- `POST /api/signatures/envelopes` — Generates a DocuSign envelope and returns a signing URL.
- `POST /api/admin/reminders/run` — Triggers reminder processing on demand (requires admin token).
- `GET /api/admin/clients` — Requires the `x-admin-token` header; returns the latest clients.
- `GET /api/admin/clients/:clientId` — Detail view for a single client with reminders and signed document metadata.
- `GET /api/admin/export.csv` — CSV export of all clients.

Automated visa reminders run daily at 08:00 server time, while file-based backups execute every Monday at 03:00.
