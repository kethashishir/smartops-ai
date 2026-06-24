# SmartOps AI

[![SmartOps AI CI](https://github.com/kethashishir/smartops-ai/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kethashishir/smartops-ai/actions/workflows/ci.yml)

## Live Deployment

- Frontend: https://smartops-ai-tau.vercel.app
- Backend API: https://smartops-ai-api.onrender.com
- Backend Health Check: https://smartops-ai-api.onrender.com/health

Deployment note: the frontend includes `frontend/vercel.json` so Vercel serves `index.html` for React Router routes such as `/assistant`, `/products`, `/orders`, `/forecasts`, and `/recommendations`. This prevents 404 errors when users refresh or directly open nested frontend routes.

SmartOps AI is a full-stack operations management platform that simulates a real retail, warehouse, or inventory-driven business workflow. It lets authenticated users manage products, track inventory, create orders, generate demand forecasts, receive reorder recommendations, and ask an operations assistant questions about their workspace data.

The project is built as a realistic software engineering portfolio project using a FastAPI backend, PostgreSQL database, React + Vite frontend, JWT authentication, user-scoped data isolation, and a routed SaaS-style dashboard.

Production AI/ML code is located inside `backend/app/ml/` so it can be imported directly by the deployed FastAPI backend. Older top-level prototype AI/ML folders were removed after the production ML forecasting pipeline was added.

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
Backend pytest suite: passed
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

## Interview Demo Script

A concise demo flow for reviewers or interviewers:

1. Register or log in to show authentication and session handling.
2. Load demo data from the Products page to create a complete isolated workspace.
3. Review product inventory, low-stock labels, and recommendation status.
4. Create an order and show inventory decreasing automatically.
5. Generate forecasts and show the ml-regression-v1 model version.
6. Review forecast explanations, volatility labels, and predicted demand.
7. Generate or refresh recommendations and review risk levels.
8. Ask the assistant questions about low stock, restock decisions, risk, volatility, and forecast freshness.
9. Refresh nested routes such as /assistant or /forecasts to show production SPA routing works.

This demo highlights full-stack development, authentication, production deployment, user-scoped data isolation, workflow automation, and explainable AI/ML decision support.

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

## Architecture Overview

SmartOps AI is organized as a production-style full-stack application:

React + Vite frontend -> Authenticated API requests -> FastAPI backend -> PostgreSQL database -> forecasting, recommendations, risk scoring, volatility analysis, and assistant services

Key architecture decisions:

- The frontend is a routed SaaS-style dashboard with separate pages for Dashboard, Assistant, Products, Orders, Forecasts, and Recommendations.
- The backend uses FastAPI routers, Pydantic schemas, SQLAlchemy models, and Alembic migrations.
- JWT authentication protects all user workspace data.
- Products, inventory, orders, forecasts, recommendations, and assistant responses are scoped to the authenticated user.
- Forecasting and AI/ML logic run inside the backend so production responses are data-grounded and testable.
- The frontend is deployed on Vercel and the backend/PostgreSQL stack is deployed on Render.
- GitHub Actions runs backend tests, frontend production build checks, and migration checks.

## AI/ML and Decision Intelligence

SmartOps AI does not depend on a paid LLM API. Instead, it uses a zero-cost, explainable AI/ML decision-support approach:

- ml-regression-v1 predicts demand from product and order-history features.
- Forecast explanations describe the model inputs behind predicted demand.
- Demand volatility scoring classifies product demand as stable, moderate, high, or insufficient-history.
- Recommendation risk scoring classifies restock decisions as low, medium, high, or critical.
- The assistant answers operational questions using authenticated workspace data, forecasts, recommendations, risk scores, and volatility analysis.

This makes the AI/ML layer reliable for demos because answers are grounded in the database rather than generated from an external chatbot.

## Resume-Ready Summary

SmartOps AI can be summarized on a resume as:

Built and deployed a full-stack AI-powered operations dashboard using React, FastAPI, PostgreSQL, SQLAlchemy, Alembic, and JWT authentication. Implemented user-scoped inventory, order, forecasting, recommendation, and assistant workflows with an explainable ML forecasting pipeline, demand risk scoring, volatility analysis, CI testing, and production deployment on Vercel and Render.

Example resume bullets:

- Built a production-style full-stack operations platform with React, FastAPI, PostgreSQL, SQLAlchemy, Alembic, and JWT authentication.
- Implemented user-scoped product, inventory, order, forecast, recommendation, and assistant workflows with protected API routes.
- Developed an explainable ML forecasting pipeline using product/order-history features, saved model artifacts, and backend prediction integration.
- Added demand risk scoring, volatility analysis, and a data-grounded operations assistant for AI-assisted restock decisions.
- Deployed the frontend to Vercel and backend/PostgreSQL services to Render with GitHub Actions CI for tests, builds, and migration checks.

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
- Confirm-password validation during registration
- Password visibility controls on login and registration forms
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
- Product editing
- Safe product deletion when no order history exists
- Product deletion protection when order history exists
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
- Deleting orders with inventory restoration
- Product-aware order creation
- Stock validation before order creation
- Automatic inventory reduction after an order
- Order success and error feedback
- Product names displayed with order records

Order creation connects to the broader workflow by reducing inventory and signaling that forecasts should be regenerated. Order deletion restores inventory so users can correct mistakes without leaving stock counts inconsistent.

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

The forecasting approach now uses a zero-cost ML-assisted forecasting pipeline. The production forecast service uses `ml-regression-v1`, an explainable weighted-regression model that predicts demand from product and order-history features such as reorder threshold, total ordered units, order count, average order size, recent order quantity, demand volatility, and trend multiplier.

The ML code lives in `backend/app/ml/`. The training script `backend/app/ml/train_forecast_model.py` builds feature rows from the database and saves a model artifact at `backend/app/ml/forecast_model.json`. The current artifact was generated with 969 training rows and reports a mean absolute error of 2.56.

The forecast service integrates the ML prediction layer while keeping the earlier trend-aware formula as a fallback. Forecast responses include human-readable explanations so users can understand why the predicted demand was produced.

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
- Demand risk questions
- Demand volatility questions
- Risk and volatility explanations
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

The assistant is currently rule-based and data-grounded. It uses authenticated workspace data, forecast outputs, recommendation data, risk scores, and volatility analysis instead of relying on a paid LLM dependency. Optional LLM/RAG support may be added later as an enhancement.

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
Backend pytest suite passed
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
- Product update and safe-delete behavior
- Authentication
- Protected routes
- Order logic
- Order deletion and inventory restoration
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
- Added confirm-password validation and password visibility controls
- Added product edit and safe-delete workflows
- Added order deletion with inventory restoration
- Added ML-assisted forecasting, demand risk scoring, and volatility analysis

---

## Future Work

Potential future improvements include:

- Optional LLM-powered assistant
- Optional LangChain or RAG integration
- Advanced ML model tuning and richer evaluation metrics
- Charts and analytics visualizations
- More advanced dashboard redesign
- Separate admin/settings pages
- Better role-based access control
- Dockerized local development
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
