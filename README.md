# SmartOps AI (In Development)

SmartOps AI is a full-stack software engineering project that simulates a real
retail or warehouse operations platform. The system manages products, inventory,
and orders, predicts future demand using machine learning, and includes an AI
operations assistant built with LangChain and a Hugging Face model.

## 🎯 Objective

Build a realistic operations platform where a user can:
- log in
- manage products
- track inventory
- simulate incoming orders
- monitor stock levels
- run demand forecasts
- get reorder suggestions
- ask an AI assistant operational questions in natural language

Example AI questions:
- Which items are most likely to go out of stock this week?
- What should I reorder right now?
- Why is Product A more risky than Product B?
- Which products have the highest forecasted demand?

## 🏗 Project Structure

```text
smartops-ai/
├── backend/            # FastAPI server & API logic
│   └── app/
├── frontend/           # React/Next.js user interface
│   └── src/
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
- Database: PostgreSQL  
- ORM: SQLAlchemy  
- Validation: Pydantic  
- Language: Python  

---

## 🏗️ Core Features

- Product management with reorder thresholds  
- Inventory tracking per product  
- Order processing with stock validation  
- Demand forecasting storage  
- Automated recommendation engine for restocking  

---

## 🔁 System Workflow

Products → Inventory → Orders → Forecast → Recommendations

---

## 📘 Flow Explanation

### 1. Products
- Each product has a reorder threshold

### 2. Inventory
- Tracks current stock per product

### 3. Orders
- Reduce inventory when purchases occur
- Prevent orders if stock is insufficient

### 4. Forecast
- Stores predicted future demand for each product

### 5. Recommendations
- Suggests reorder quantity based on:
  - current inventory
  - reorder threshold
  - predicted demand

---

## 🧮 Recommendation Logic

For each product:

If current_stock <= reorder_threshold:

recommended_quantity = predicted_demand - current_stock

If result is negative → set to 0

Each recommendation includes an explanation for transparency.

---

## 📌 Example

| Metric            | Value |
|------------------|------|
| Current Stock     | 20   |
| Reorder Threshold | 30   |
| Forecast Demand   | 120  |

Recommended Quantity = 100

---

## 📡 API Endpoints

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

```bash
git clone https://github.com/kethashishir/smartops-ai
cd smartops-ai/backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload

```
Open in browser:
http://127.0.0.1:8000/docs