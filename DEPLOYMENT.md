# SmartOps AI Deployment Guide

This document describes the deployment-ready configuration for SmartOps AI.

SmartOps AI has two deployable services:

```text
backend/   FastAPI API service
frontend/  React + Vite static frontend
```

---

## Backend Service

### Runtime

The backend is a FastAPI application.

Recommended backend service root:

```text
backend/
```

### Install Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
./start.sh
```

The startup script runs database migrations before starting the API:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
```

### Required Environment Variables

```text
DATABASE_URL=postgresql://...
SECRET_KEY=replace-with-a-secure-random-value
ALLOWED_ORIGINS=https://your-frontend-domain.com
AUTO_CREATE_TABLES=false
```

### Notes

- `DATABASE_URL` should point to the production PostgreSQL database.
- `SECRET_KEY` must be a strong production secret.
- `ALLOWED_ORIGINS` should include the deployed frontend URL.
- `AUTO_CREATE_TABLES` should stay `false` in production.
- Alembic migrations should be used to manage schema changes.

---

## Frontend Service

### Runtime

The frontend is a React + Vite application.

Recommended frontend service root:

```text
frontend/
```

### Install Command

```bash
npm install
```

### Build Command

```bash
npm run build
```

### Publish Directory

```text
dist/
```

### Required Environment Variables

```text
VITE_API_BASE_URL=https://your-backend-api-domain.com
```

### Notes

- `VITE_API_BASE_URL` must point to the deployed FastAPI backend.
- The backend `ALLOWED_ORIGINS` value must include the deployed frontend URL.
- After changing frontend environment variables, rebuild the frontend.

---

## Local Verification Before Deploy

Run backend tests:

```bash
cd backend
source .venv/bin/activate
pytest
```

Run frontend production build:

```bash
cd frontend
npm run build
```

Expected current result:

```text
Backend tests: 28 passed
Frontend build: passed
```

---

## Deployment Order

Recommended deployment order:

```text
1. Provision PostgreSQL database
2. Deploy backend service
3. Set backend environment variables
4. Run backend startup command
5. Confirm /health returns healthy
6. Deploy frontend service
7. Set VITE_API_BASE_URL to backend URL
8. Confirm frontend can register/login and call dashboard APIs
```

---

## Backend Health Check

After backend deployment, verify:

```text
GET /health
```

Expected response:

```json
{
  "status": "healthy"
}
```

---

## Common Deployment Issues

### CORS error in browser

Check:

```text
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Do not leave this as only localhost in production.

### Frontend calls localhost after deploy

Check:

```text
VITE_API_BASE_URL=https://your-backend-api-domain.com
```

Then rebuild and redeploy the frontend.

### Database tables missing

Check that the backend startup command runs:

```bash
alembic upgrade head
```

### Login/session issues

Check:

```text
SECRET_KEY
DATABASE_URL
ALLOWED_ORIGINS
VITE_API_BASE_URL
```

The frontend and backend URLs must match the deployed services.
