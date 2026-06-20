# SmartOps AI Deployment Notes

SmartOps AI is currently prepared for separate frontend and backend deployment.

## Backend

Backend directory:

```text
backend/
```

Production start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
ALLOWED_ORIGINS=https://your-frontend-domain.com
SECRET_KEY=replace-with-a-secure-random-secret
```

Local development command:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

## Authentication Notes

SmartOps AI uses bearer token authentication for dashboard APIs.

Protected backend route groups include:

```text
/products/*
/inventory/*
/orders/*
/forecast/*
/recommendations/*
```

The frontend must send the JWT access token returned from `/auth/login` in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

The `SECRET_KEY` environment variable should be set to a secure random value in production. Do not reuse the local development secret for deployment.

## Multi-User Data Isolation Notes

Operational dashboard data is scoped by authenticated user.

User-owned and user-scoped data includes:

```text
Products
Inventory access through product ownership
Orders
Forecasts
Recommendations
```

Products are the ownership root for inventory. A user must own a product before they can view or update that product's inventory. Forecast and recommendation generation only uses the authenticated user's operational data.

This project currently uses direct SQLAlchemy model creation and small local database update scripts during development. Before production deployment, this should be replaced with a proper migration workflow such as Alembic.

## Frontend

Frontend directory:

```text
frontend/
```

Build command:

```bash
npm run build
```

Required environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Local development command:

```bash
cd frontend
npm install
npm run dev
```

## Deployment Architecture

Recommended deployment architecture:

```text
Frontend: Vercel or Netlify
Backend: Render, Railway, Fly.io, or similar
Database: Hosted PostgreSQL
```

The frontend should call the deployed backend using `VITE_API_BASE_URL`.

The backend should allow the deployed frontend URL using `ALLOWED_ORIGINS`.
