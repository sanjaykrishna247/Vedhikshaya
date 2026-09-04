# Vedikshaya API

FastAPI + MySQL auth service for the Vedikshaya app (signup/login, JWT sessions).

## Setup

1. Create a MySQL database:
   ```sql
   CREATE DATABASE vedikshaya CHARACTER SET utf8mb4;
   ```

2. Copy `.env.example` to `.env` and fill in your MySQL credentials and a JWT secret:
   ```bash
   cp .env.example .env
   ```

3. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   pip install -r requirements.txt
   ```

4. Run the API (tables are created automatically on startup):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

5. (Optional) Seed a demo account for quick testing:
   ```bash
   python -m app.seed
   ```
   Creates `demo@vedikshaya.com` / `demo1234`. The login page shows these
   credentials with a one-click autofill button.

## Endpoints

- `POST /auth/signup` — `{ name, email, password }` → `{ access_token, user }`
- `POST /auth/login` — `{ email, password }` → `{ access_token, user }`
- `GET /auth/me` — `Authorization: Bearer <token>` → current user
- `GET /health` — health check

## Frontend

Set `VITE_API_BASE=http://localhost:8000` in the frontend's `.env` if it differs
from the default.
