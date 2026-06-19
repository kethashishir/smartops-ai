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
```

Local development command:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

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
