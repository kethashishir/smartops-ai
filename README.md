# SmartOps AI

[![SmartOps AI CI](https://github.com/kethashishir/smartops-ai/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kethashishir/smartops-ai/actions/workflows/ci.yml)

## Live Deployment

- Frontend: https://smartops-ai-tau.vercel.app
- Backend API: https://smartops-ai-api.onrender.com
- Backend Health Check: https://smartops-ai-api.onrender.com/health

Deployment note: the frontend includes `frontend/vercel.json` so Vercel serves `index.html` for React Router routes such as `/assistant`, `/products`, `/orders`, `/forecasts`, and `/recommendations`. This prevents 404 errors when users refresh or directly open nested frontend routes.

SmartOps AI is a full-stack operations management platform that simulates a real retail, warehouse, or inventory-driven business workflow. It lets authenticated users manage products, track inventory, create orders, generate demand forecasts, receive reorder recommendations, and ask an operations assistant questions about their workspace data.

The project is built as a realistic software engineering portfolio project using a FastAPI backend, PostgreSQL database, React + Vite frontend, JWT authentication, user-scoped data isolation, and a routed SaaS-style dashboard.

---

## Project Status

SmartOps AI is currently deployed and functional.

Current production-ready milestones:

- Live React frontend deployed on Vercel
- Live FastAPI backend deployed on Render
- Managed PostgreSQL database deployed on Render
- JWT authentication working in production
- User-scoped products, inventory, orders, forecasts, recommendations, and assistant responses
- Alembic migrations running during backend startup
- GitHub Actions CI running backend tests, frontend build, and migration checks
- Frontend auto-deploys from `main`
- Backend deployment connected to the production database

Current verification:

```text
Frontend production build: passed
Backend tests: 64 passed
Production smoke test: passed
Demo data loading: working
Phase 4 risk scoring: implemented
Phase 4 volatility analysis: implemented
Phase 4 ML forecasting pipeline: implemented
```

---

## Objective

SmartOps AI is designed to model a real operations workflow where a user can:

- Register and log in
- Create and manage products
- Track product inventory
- Update stock levels
- Simulate customer orders
- Automatically reduce inventory after orders
- Monitor low-stock and healthy-stock products
- Generate demand forecasts from order history
- Generate reorder recommendations from forecasts and inventory
- Ask an assistant operational questions about the workspace

Example assistant questions:

```text
Which products are low stock?
Which products are healthy?
What should I restock?
What changed recently?
Do I need to generate forecasts?
Which product has the highest forecasted demand?
Give me an operations summary.
```

## Demo Walkthrough

A reviewer can test SmartOps AI using the live deployment:

1. Open the frontend deployment.
2. Register a new account or log in.
3. Go to the Products page.
4. Click **Load Demo Data** to populate the workspace with sample products, inventory, orders, forecasts, and recommendations.
5. Review the Products page to see stock levels, low-stock products, and recommendation labels.
6. Visit the Orders page to review generated order history.
7. Visit the Forecasts page to inspect forecasted demand by product.
8. Visit the Recommendations page to review suggested reorder quantities.
9. Open the Assistant page and ask operational questions such as:

```text
Give me an operations summary.
Which products are low stock?
What should I restock?
Which product has the highest forecasted demand?
Do I need to generate forecasts?
```

The demo data is scoped to the logged-in user, so each account receives its own isolated demo workspace.

---

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Alembic
- JWT authentication
- Pytest

### Frontend

- React
- Vite
- React Router
- JavaScript
- CSS
- Fetch API

### Development / Tooling

- Git / GitHub
- Python virtual environment
- npm
- Alembic migrations
- Frontend production build checks
- Backend regression tests

---

## Project Structure

```text
smartops-ai/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── routes.js
│   ├── package.json
│   └── package-lock.json
│
├── docs/
├── ml/
├── ai/
├── simulator/
├── .env.example
└── README.md
```

---

## Core Features

### Authentication

SmartOps AI includes a working authentication system.

Current authentication features include:

- User registration
- User login
- Password hashing
- JWT access token generation
- Session restore from browser local storage
- Logout from the dashboard header
- Protected backend dashboard routes
- Shared frontend authenticated API helper
- Expired-session handling in the frontend

Public backend routes include:

```text
/
/health
/auth/register
/auth/login
```

Protected backend route groups include:

```text
/auth/me
/products/*
/inventory/*
/orders/*
/forecast/*
/recommendations/*
/assistant/*
```

---

## Multi-User Data Isolation

SmartOps AI supports user-scoped operational workspaces.

Each authenticated user only sees and manages their own data.

Current ownership rules include:

- Products are owned by the authenticated user who created them.
- Inventory access is restricted through product ownership.
- Orders are scoped to the authenticated user.
- Forecast generation only uses the authenticated user's products and orders.
- Forecast results are scoped to the authenticated user.
- Recommendations are scoped to the authenticated user.
- Assistant answers are scoped to the authenticated user's workspace data.
- Empty states are returned cleanly instead of exposing another user's data.

Regression tests verify that one user cannot access or mutate another user's products, inventory, orders, forecasts, recommendations, or assistant-related operational data.

---

## Products and Inventory

The Products page supports:

- Product creation
- Product listing
- Product search
- Product filtering
- Product sorting
- Low-stock detection
- Healthy-stock detection
- Inventory display per product
- Stock updates from product cards
- Inline recommendation labels
- Per-product recommendation generation

Inventory is connected directly to product ownership, so users can only update stock for products they own.

---

## Orders

The Orders page supports:

- Creating customer orders
- Viewing recent order history
- Product-aware order creation
- Stock validation before order creation
- Automatic inventory reduction after an order
- Order success and error feedback
- Product names displayed with order records

Order creation connects to the broader workflow by reducing inventory and signaling that forecasts should be regenerated.

---

## Forecasts

The Forecasts page supports:

- Viewing forecast records
- Generating forecasts from order history
- Forecast summary metrics
- Forecasted demand by product
- Forecast model version display
- Forecast date display
- Human-readable forecast explanations
- Demand volatility labels and scores
- Automatic recommendation refresh after forecast generation

The forecasting approach now uses a zero-cost trend-aware forecasting service. It estimates demand from product/order history, reorder thresholds, order activity, and average order size. Forecast responses include human-readable explanations so users can understand why the predicted demand was produced.

The forecast layer also includes demand volatility analysis. Volatility scoring compares order quantities to classify product demand as stable, moderate, high, or limited-history demand.

Phase 4 work focuses on zero-cost advanced AI/ML features, including ML-assisted forecasting, demand risk scoring, demand volatility analysis, and smarter assistant explanations without requiring a paid LLM dependency.

---

## Recommendations

The Recommendations page supports:

- Generating recommendations for all eligible products
- Generating recommendations for individual products
- Viewing recommended reorder quantities
- Viewing recommendation reasons
- Priority-sorted recommendations
- Recommendation summary metrics
- Demand risk scoring for recommendation decisions
- Risk labels such as low, medium, high, and critical
- Risk score display based on stock pressure and forecasted demand
- No-restock and restock-needed states
- Automatic refresh after inventory updates and forecast generation

Recommendations are based on current inventory levels, reorder thresholds, forecasted demand, and demand risk scoring. The risk scoring layer classifies each recommendation as low, medium, high, or critical risk using stock pressure, predicted demand, and recommended reorder quantity.

---

## SmartOps Assistant v1

SmartOps Assistant v1 is a rule-based operational assistant that answers natural language questions using the authenticated user's current workspace data.

The assistant currently supports:

- Operations summary
- Low-stock inventory questions
- Healthy inventory questions
- Restock recommendation questions
- Recent order activity questions
- Highest forecasted demand questions
- Forecast freshness questions
- Fallback guidance for unsupported questions

Assistant response features include:

- Structured answer text
- Key highlight cards
- Suggested next steps
- Recent question history
- Clear response control
- Stale-answer warning after operational data changes
- Data-isolated backend responses
- Protected assistant API routes

Example questions:

```text
Which products are low stock?
Which products are healthy?
What should I restock?
What changed recently?
Do I need to generate forecasts?
Which product has the highest forecasted demand?
Give me an operations summary.
```

The assistant is currently rule-based. Future work may add a true LLM/RAG assistant using LangChain or another AI orchestration layer.

---

## Frontend Architecture

The frontend uses a routed SaaS-style dashboard architecture.

Current frontend organization:

```text
frontend/src/
├── api/
├── components/
├── hooks/
├── pages/
├── App.jsx
├── App.css
├── main.jsx
└── routes.js
```

### API Layer

`src/api/` contains service files for backend API calls:

- Auth API
- Products API
- Inventory API
- Orders API
- Forecasts API
- Recommendations API
- Assistant API
- Health API
- Shared API config and authenticated fetch helper

### Hooks

`src/hooks/` contains state and workflow logic:

```text
useAssistant.js
useAuth.js
useForecasts.js
useOrders.js
useProducts.js
useRecommendations.js
```

These hooks keep `App.jsx` focused on application shell, routing, authentication gating, and page composition.

### Pages

`src/pages/` contains route-level page components:

```text
DashboardPage.jsx
AssistantPage.jsx
ProductsPage.jsx
OrdersPage.jsx
ForecastsPage.jsx
RecommendationsPage.jsx
```

### Components

`src/components/` contains reusable UI sections and layout components such as:

- Sidebar
- Dashboard header
- Auth page
- Summary cards
- Products section
- Orders section
- Forecasts section
- Recommendations section
- Assistant section

---

## Routing

The frontend uses React Router.

Current routes:

```text
/                    Dashboard summary + assistant
/assistant           SmartOps Assistant
/products            Products and inventory
/orders              Orders
/forecasts           Forecasts
/recommendations     Recommendations
```

Unknown routes redirect to:

```text
/
```

The sidebar uses router links and route-specific active states.

The dashboard header updates per route with contextual titles and descriptions.

---

## Dashboard UI

The SmartOps AI frontend uses a SaaS-style dashboard layout.

Current UI features include:

- Fixed sidebar navigation
- Route-specific dashboard header
- Backend connection status indicator
- User badge and logout button
- Dashboard summary cards
- Products page with inventory controls
- Orders page with order form and order history
- Forecasts page with forecast summaries and forecast cards
- Recommendations page with priority restock recommendations
- Assistant page with structured operational answers
- Success, error, loading, and empty states
- Responsive layout styling

The UI has been improved from a single long page into a routed dashboard with separate page-level views.

A more advanced visual redesign with charts, richer cards, and a more polished enterprise SaaS layout may be added later.

---

## Backend Architecture

The backend is organized around FastAPI routers, SQLAlchemy models, Pydantic schemas, and service functions.

Current backend responsibilities include:

- Authentication
- User management
- Product CRUD behavior
- Inventory access and stock updates
- Order creation and stock validation
- Forecast generation
- Recommendation generation
- Assistant responses
- Health checks
- Protected route enforcement
- Data isolation

Database schema changes are managed through Alembic migrations.

Automatic table creation is disabled by default for production safety.

---

## Database and Migrations

SmartOps AI uses Alembic for database migrations.

Important migration notes:

- Alembic is configured for schema migrations.
- A baseline revision was stamped.
- Ownership-related schema changes are handled through migrations.
- Production startup should run migrations before launching the app.
- Automatic table creation is disabled by default.

Recommended production startup pattern:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Environment Variables

The backend expects environment variables such as:

```text
DATABASE_URL=postgresql://...
SECRET_KEY=change-me
ALLOWED_ORIGINS=http://localhost:5173
AUTO_CREATE_TABLES=false
```

For local development, use a `.env` file based on `.env.example`.

---

## Running Locally

### Backend

From the backend directory:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### Frontend

From the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Verification Commands

### Backend tests

```bash
cd backend
pytest
```

Expected current result:

```text
28 passed
```

### Frontend production build

```bash
cd frontend
npm run build
```

Expected current result:

```text
build passed
```

### Full local verification

```bash
cd frontend
npm run build

cd ../backend
pytest
```

---

## Current Test Coverage

Backend tests currently cover:

- Health route
- Product routes
- Authentication
- Protected routes
- Order logic
- Forecast service logic
- Assistant routes
- Cross-user data isolation
- User-owned products
- Ownership-protected inventory
- User-scoped orders
- User-scoped forecasts
- User-scoped recommendations
- Assistant data isolation

---

## Recent Major Improvements

Recent completed milestones include:

- Added frontend authentication flow
- Added JWT-protected backend APIs
- Added multi-user data isolation
- Added user-owned products
- Added ownership-protected inventory access
- Added user-scoped orders, forecasts, and recommendations
- Added Alembic migrations
- Disabled automatic table creation by default
- Added clean empty states for new users
- Added stock-aware order creation
- Added forecast and recommendation workflow guidance
- Added product names to orders, forecasts, and recommendations
- Added SmartOps Assistant v1
- Added assistant structured highlights and suggested actions
- Added assistant stale-answer warning
- Added assistant recent question history
- Added assistant intents for recent activity, healthy inventory, and forecast freshness
- Extracted frontend workflow logic into custom hooks
- Added React Router
- Converted the dashboard from one long page into routed pages
- Added route-specific dashboard headers
- Added reusable page components

---

## Future Work

Potential future improvements include:

- True LLM-powered assistant
- LangChain or RAG integration
- ML-based demand forecasting model
- Charts and analytics visualizations
- More advanced dashboard redesign
- Separate admin/settings pages
- Better role-based access control
- Dockerized local development
- Cloud deployment
- CI/CD pipeline
- More frontend tests
- More advanced recommendation logic
- Multi-warehouse support

---

## Project Purpose

SmartOps AI is built to demonstrate practical full-stack engineering skills:

- Backend API design
- Frontend application architecture
- Authentication
- Database modeling
- Multi-user data isolation
- Business workflow modeling
- Forecasting and recommendation logic
- Assistant-style operational UX
- Testing and regression coverage
- Production-minded migration setup
- React routing and component architecture

The project is intentionally built like a realistic SaaS operations tool rather than a simple CRUD demo.
