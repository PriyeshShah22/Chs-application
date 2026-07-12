# Panchayat AI Society Platform

An accessible housing-society platform built for residents who may be more comfortable speaking than completing digital forms. It includes a FastAPI backend, React web app, and Flutter mobile project.

## Main capabilities

- Hindi and Marathi voice requests translated by Sarvam and handled by a permission-aware OpenAI assistant.
- Agent actions for complaints, dues, and administrator announcements, with confirmation before changes.
- Complaint workflow: Submitted, In Progress, Rejected, Resolved, and resident withdrawal, with a full history.
- One itemized maintenance bill per resident per month with secure Razorpay UPI checkout.
- Visitor approval, gate check-in and check-out, notices, resident directory, roles, reports, and audit logs.
- Manual screens remain available as a fallback for every important AI-assisted service.

## Windows quick start

Install Python 3.11 or newer and a current Node.js LTS release. Then double-click `start.bat`, or run it from a terminal at the repository root:

```bat
start.bat
```

The startup script:

1. Validates Python and Node.js.
2. Creates the local Python environment when missing.
3. Synchronizes Python and web dependencies after every pull.
4. Creates ignored local environment files from the examples when missing.
5. Applies database migrations and adds only missing development seed records.
6. Starts the API at `http://localhost:8000` and the web app at `http://localhost:5173`.

Each developer keeps their own ignored `backend/.env`, `frontend-web/.env`, and SQLite database. Do not send or commit API keys or local databases.

## Development accounts

After the seed script runs:

| Email | Password | Roles |
|---|---|---|
| `admin@greenpark.com` | `Admin@12345` | Admin / superuser |
| `committee@greenpark.com` | `Committee@123` | Committee |
| `security@greenpark.com` | `Security@123` | Security |
| `resident@greenpark.com` | `Resident@123` | Resident and committee |
| `ravi@greenpark.com` | `Ravi@12345` | Resident |

## Manual setup

Backend commands run from `backend`:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.venv\Scripts\python.exe scripts\migrate.py
.venv\Scripts\python.exe scripts\seed.py
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Web commands run from `frontend-web` in a second terminal:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Swagger API documentation is available at `http://localhost:8000/docs`.

## Repository layout

- `backend/` — FastAPI, SQLAlchemy, Alembic, AI and payment services.
- `frontend-web/` — React, TypeScript, Vite, Material UI, TanStack Query.
- `mobile/` — Flutter client project.
- `docs/` — architecture, setup, and testing notes.

## License

MIT
