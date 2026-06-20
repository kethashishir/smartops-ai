# SmartOps AI (In Development)

SmartOps AI is a full-stack software engineering project that simulates a real retail or warehouse operations platform. The system manages products, inventory, orders, demand forecasts, and reorder recommendations through a FastAPI backend, PostgreSQL database, and React + Vite frontend dashboard.

The long-term goal is to include machine learning demand forecasting and an AI operations assistant built with LangChain and a Hugging Face model.

## Current Status

SmartOps AI currently includes a working FastAPI backend, PostgreSQL database integration, React + Vite frontend dashboard, user authentication, and protected dashboard APIs.

Implemented features include:

- Product creation and listing
- Inventory display per product
- Inventory stock updates directly from product cards
- Real-time stock status updates after inventory changes
- Low-stock and healthy-stock status labels
- Product search, filtering, and sorting
- Recommendation generation and display
- Per-product recommendation generation
- Automatic recommendation loading on page load
- Frontend loading, error, and success states
- Backend health check status in the frontend dashboard
- Organized React components and frontend API service files
- Recommendation status displayed directly on product cards
- SaaS-style dashboard layout with sidebar navigation
- Sidebar navigation with active section tracking
- Coming-soon indicators for planned Inventory and Forecasts views
- Automatic recommendation refresh after inventory stock updates
- Order creation from the React dashboard
- Recent orders display in the frontend
- Inventory and recommendation refresh after order creation
- Frontend Orders section for creating and viewing orders
- Orders summary card in the dashboard overview
- Sidebar navigation for dashboard sections
- Forecasts dashboard section for viewing predicted demand
- Forecast data display by product, date, model version, and predicted demand
- Forecasts summary card in the dashboard overview
- Sidebar navigation ordered by operations workflow
- User registration and login from the frontend
- Session restore from browser local storage
- Logout flow from the dashboard header
- Protected dashboard API routes using bearer token authentication
- Authenticated frontend API helper for dashboard requests

Baseline machine learning-style forecasting is implemented through a shared backend forecasting service. The AI assistant feature is planned but still in development.

---

## 🎯 Objective

Build a realistic operations platform where a user can:

- log in
- manage products
- track inventory
- update stock levels
- simulate incoming orders
- monitor low-stock products
- run demand forecasts
- get reorder suggestions
- ask an AI assistant operational questions in natural language

Example AI questions:

- Which items are most likely to go out of stock this week?
- What should I reorder right now?
- Why is Product A more risky than Product B?
- Which products have the highest forecasted demand?

---

## 🏗 Project Structure

```text
smartops-ai/
├── backend/            # FastAPI server & API logic
│   └── app/
├── frontend/           # React + Vite user interface
│   └── src/
│       ├── api/        # Frontend API service functions
│       ├── components/ # Reusable React components
│       ├── App.jsx
│       └── App.css
├── ml/                 # Machine learning models & training scripts
├── ai/                 # AI agents & prompt engineering
├── simulator/          # Environment simulation logic
├── docs/               # System architecture & design docs
│   └── design.md
├── .github/            # CI/CD workflows & GitHub actions
│   └── workflows/
├── .env.example        # Template for environment variables
└── README.md           # Project documentation
```

---

## 🚀 Tech Stack

- Backend: FastAPI
- Frontend: React + Vite
- Database: PostgreSQL
- ORM: SQLAlchemy
- Validation: Pydantic
- Language: Python / JavaScript

---

## Frontend Architecture

The React frontend is organized into reusable components and API service files.

- `src/components/` contains reusable UI components such as product cards, product controls, summary cards, product forms, and recommendation sections.
- `src/api/` contains frontend service functions for calling the FastAPI backend.
- `src/api/config.js` stores the backend API base URL and shared authenticated API request helper used by the frontend.
- `App.jsx` manages top-level state, data loading, and page composition.
- `App.css` contains the dashboard layout, card styling, status labels, form styling, and responsive behavior.

The dashboard supports authenticated access, session restore, logout, and updating product inventory directly from product cards. Stock status labels and low-stock counts update after inventory changes.

The current UI has been improved with a dashboard-style layout, summary cards, grouped sections, status badges, and cleaner spacing. A more advanced SaaS-style redesign with sidebar navigation, tabs, charts, and wider dashboard modules is planned for a later phase.

Product cards display current inventory status and recommendation status so users can quickly see whether each product needs restocking.

The frontend now uses a SaaS-style dashboard shell with a fixed sidebar, dashboard header, summary cards, product management section, and recommendation section. Sidebar navigation scrolls to active dashboard sections while planned future views are marked as coming soon.

When product stock is updated from the dashboard, the frontend refreshes the related product recommendation so stock and recommendation status stay aligned.

The dashboard includes an Orders section where users can simulate customer orders. Creating an order reduces product inventory through the backend and refreshes the affected product recommendation so dashboard data stays aligned.

The dashboard now includes Products, Orders, and Recommendations sections inside a SaaS-style layout. Sidebar navigation tracks the active section and scrolls users to the selected dashboard area.

The dashboard includes a Forecasts section that displays backend forecast records used by the recommendation engine, including forecast date, model version, and predicted demand for each product.

The sidebar navigation follows the operational workflow: Dashboard, Products, Orders, Forecasts, and Recommendations. The dashboard overview includes summary metrics for products, orders, forecasts, and low-stock products.

---

## Authentication and API Security

SmartOps AI includes a working authentication flow for the dashboard.

Current authentication features include:

- User registration from the frontend
- User login from the frontend
- Password hashing on the backend
- JWT access token generation on login
- Session restore from browser local storage
- Logout from the dashboard header
- Protected dashboard APIs using bearer token authentication

The frontend stores the access token in browser local storage and sends it with dashboard API requests through a shared `apiFetch` helper.

Protected backend route groups include:

```text
/products/*
/inventory/*
/orders/*
/forecast/*
/recommendations/*
```

Public backend routes include:

```text
/health
/
/auth/register
/auth/login
```

The `/auth/me` route requires a valid bearer token and is used by the frontend to restore the current logged-in user.

---

## 🏗️ Core Features

- Product management with reorder thresholds
- Inventory tracking per product
- Inventory stock updates from the React dashboard
- Real-time stock status updates after inventory changes
- Order processing with stock validation
- Demand forecasting storage
- Automated recommendation engine for restocking
- Frontend dashboard with product search, filtering, and sorting
- Low-stock and healthy-stock visual labels
- Product creation from the React interface
- Recommendation generation and display from the frontend
- Product stock filtering by low-stock and healthy-stock status
- Product search by name, SKU, and category
- Product sorting by price and stock level
- Per-product recommendation generation from the dashboard
- Automatic recommendation loading on page load
- Backend health status indicator in the frontend
- Product-level recommendation status displayed in the dashboard
- Recommendation status refresh after inventory changes
- Frontend order creation that reduces inventory
- Recent order history display
- Dashboard order creation with inventory reduction
- Orders summary metric in the dashboard overview
- Active sidebar navigation for dashboard sections
- Read-only forecast dashboard powered by backend forecast data
- User authentication with password hashing and JWT access tokens
- Protected dashboard APIs for products, inventory, orders, forecasts, and recommendations

---

## Dashboard UI

The SmartOps AI frontend uses a dashboard-style layout designed for an operations workflow.

Current dashboard UI features include:

- Sidebar navigation for Dashboard, Products, Orders, Forecasts, and Recommendations.
- Summary metrics for products, orders, forecasts, and low-stock products.
- Product search, filtering, sorting, inventory updates, and inline recommendation labels.
- Forecast summary metrics showing forecasted products, total predicted demand, and active model version.
- Dashboard-triggered forecast generation through the backend API.
- Recommendation summary metrics showing total recommendations, restock-needed items, no-restock items, and total units recommended.
- Priority-sorted recommendations so the highest restock quantities appear first.
- Success and error feedback for forecast generation, product creation, order creation, and recommendation updates.

This gives the project a more polished SaaS-style dashboard experience while keeping the workflow connected to the backend, database, and forecasting logic.

---

## 🔁 System Workflow

Products → Inventory → Orders → Forecast → Recommendations

---

## 📘 Flow Explanation

### 1. Products

- Each product has product details such as name, SKU, category, unit price, and reorder threshold.
- Products can be created from the frontend dashboard.
- Products are used as the base entity for inventory, orders, forecasts, and recommendations.

### 2. Inventory

- Tracks current stock per product.
- Inventory stock can be viewed from the frontend dashboard.
- Inventory stock can be updated directly from product cards.
- Stock updates immediately affect low-stock and healthy-stock labels.

### 3. Orders

- Orders reduce inventory when purchases occur.
- Orders are validated to prevent purchases when stock is insufficient.

### 4. Forecast

- Stores predicted future demand for each product.
- Forecast records are used by the recommendation engine.

### 5. Recommendations

- Suggests reorder quantity based on:
  - current inventory
  - reorder threshold
  - predicted demand

- Recommendations can be generated for all qualifying products.
- Recommendations can also be generated for a single product from the product card.
- Existing recommendation records are updated instead of creating duplicate recommendation rows.

---

## Forecasting and Recommendations Workflow

SmartOps AI includes a baseline forecasting workflow that connects the ML pipeline, backend API, PostgreSQL database, and React dashboard.

The current workflow is:

1. Products and historical orders are stored in PostgreSQL.
2. The backend baseline forecasting service calculates predicted demand using product reorder thresholds and total order quantity.
3. Forecasts are stored in the database with model version `baseline-v1`.
4. The dashboard can generate forecasts from the Forecasts section.
5. The backend returns one latest forecast per product through `/forecast/latest`.
6. Recommendations are regenerated after forecast generation so restock advice stays synchronized with the latest forecast data.

Current forecast generation endpoint:

```http
POST /forecast/generate
```

Latest forecast endpoint:

```http
GET /forecast/latest
```

These forecast endpoints are protected and require a valid bearer token from an authenticated dashboard user.

Current baseline formula:

```text
baseline = max(total_order_quantity, reorder_threshold)
predicted_demand = baseline * 1.15
```

This gives the app a complete end-to-end flow from operational data to demand forecasting to restock recommendations.

## 🧮 Recommendation Logic

For each product:

```text
If current_stock <= reorder_threshold:

recommended_quantity = predicted_demand - current_stock

If recommended_quantity is negative, set it to 0.
```

Each recommendation includes an explanation for transparency.

---

## 📌 Example

| Metric            | Value |
| ----------------- | ----- |
| Current Stock     | 20    |
| Reorder Threshold | 30    |
| Forecast Demand   | 120   |

Recommended Quantity = 100

---

## 📡 API Endpoints

### Health

- GET /health

### Products

- POST /products/
- GET /products/
- PATCH /products/{product_id}

### Inventory

- GET /inventory/{product_id}
- PATCH /inventory/{product_id}

### Orders

- POST /orders/
- GET /orders/

### Forecast

- POST /forecast/
- GET /forecast/

### Recommendations

- POST /recommendations/
- GET /recommendations/
- POST /recommendations/generate/{product_id}
- POST /recommendations/generate_all

---

## ⚙️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/kethashishir/smartops-ai
cd smartops-ai
```

### 2. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open backend API docs:

```text
http://127.0.0.1:8000/docs
```

Check backend health:

```text
http://127.0.0.1:8000/health
```

### 3. Run the frontend

Open a second terminal:

```bash
cd smartops-ai/frontend
npm install
npm run dev
```

Open frontend app:

```text
http://localhost:5173
```

---

## Planned Improvements

Planned future work includes:

- Authentication and login flow
- Machine learning model for demand forecasting
- AI operations assistant using LangChain and a Hugging Face model
- Charts for stock levels, demand forecasts, and recommendation trends
- More professional SaaS-style dashboard redesign with sidebar navigation and tabs
- Deployment setup
- Automated tests
- Database migrations with Alembic
- Screenshots and demo video for portfolio presentation
---

## Current Verification Status

Latest verified project checks:

```text
Backend tests: 15 passed
Frontend production build: passed
Protected dashboard API browser sanity check: passed
```
