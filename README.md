# Vedikshaya

Smart pod-based Ayurvedic Kwatha (Kadha) maker — landing site, brew monitoring
dashboard, and companion app (login, pod scan, AI symptom-to-Kashaya chatbot,
brew history).

## Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. Set `VITE_API_BASE` in a `.env` file if the
backend isn't running at the default `http://localhost:8000`.

## Backend

FastAPI + MySQL auth service — see [`backend/README.md`](backend/README.md)
for setup. In short:

```bash
cd backend
cp .env.example .env   # fill in your MySQL credentials + a JWT secret
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## App structure

- `src/` — landing page (`components/`) and the logged-in app (`pages/`):
  `auth/` (login, signup), `home/` (post-login hub), `scan/` (camera pod
  scan), `chatbot/` (AI symptom → Kashaya recommendations, mock data),
  `history/` (brew log), `dashboard/` (live brew monitoring)
- `src/auth/` — `AuthContext` (JWT session, talks to the FastAPI backend) and
  `ProtectedRoute`
- `backend/` — FastAPI + MySQL signup/login service
