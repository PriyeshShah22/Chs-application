# Smart Society Management System

A complete Smart Society Management platform consisting of:

1. **FastAPI backend** (Python 3.11+) — JWT auth, SQLAlchemy + Alembic, AI assistant,
   OCR plumbing, SMTP/Telegram notifiers, scheduled jobs, PDF bills, Excel reports.
2. **React + TypeScript web dashboard** (Vite, Material UI, TanStack Query, Zustand) —
   charts, tables, dark/light theme, role-aware pages.
3. **Flutter mobile app** (Riverpod, GoRouter, Dio, Material 3) — dark/light, push
   navigation, splash + onboarding flow, profile, complaints, bills, visitors,
   notices, AI chat.
4. **Postgres** in production, **SQLite** for first-run development (no install
   required).

Everything runs locally on Windows. **No Docker, no containers.**

---

## Feature highlights

- Multi-society, role-based access (`admin`, `committee`, `resident`, `security`).
- JWT access tokens (30 min) + refresh tokens (7 days), bcrypt password hashing.
- Complaint lifecycle: create → AI classify → assign → status / priority → comments.
- Maintenance bills: monthly auto-generation, late fee sweep, partial/full payment,
  PDF download per bill, society-wide Excel exports.
- Visitor flow: register → approve/reject (host) → check-in/out (security) with QR
  tokens and audit log entries.
- Notices / announcements with pin + audience targeting.
- AI assistant with intent classification and permission-aware data retrieval
  (e.g. residents only see their own bills; committee sees aggregated defaulter
  lists).
- Background scheduled jobs (APScheduler) for monthly billing and overdue sweeps.
- Health endpoint, Swagger UI at `/docs`, full request validation via Pydantic v2.

---

## Demo accounts (after running the seed script)

| Email | Password | Roles |
|---|---|---|
| admin@greenpark.com | Admin@12345 | admin (superuser) |
| committee@greenpark.com | Committee@123 | committee |
| security@greenpark.com | Security@123 | security |
| resident@greenpark.com | Resident@123 | resident + committee |
| ravi@greenpark.com | Ravi@12345 | resident |

---

## Repo layout

```
smart-society/
├── backend/             FastAPI service
├── frontend-web/        React + Vite dashboard
├── mobile/              Flutter app
├── docs/                Architecture, API, schema, Windows setup, testing
└── scripts/             Helper shell scripts
```

See [`docs/WINDOWS_SETUP.md`](docs/WINDOWS_SETUP.md) for detailed installation
instructions or [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system design.

---

## Quick start (development — no Postgres required)

```bash
# Backend
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env      # macOS/Linux: cp .env.example .env
python scripts/seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Web dashboard (new terminal)
cd frontend-web
npm install
copy .env.example .env
npm run dev                # http://localhost:5173

# Mobile (Flutter SDK required)
cd mobile
flutter pub get
flutter run
```

Swagger UI is at `http://localhost:8000/docs`.

---

## License

MIT
