import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import SummaryCards from "./components/SummaryCards.jsx";
import RecommendationsSection from "./components/RecommendationsSection.jsx";
import ProductsSection from "./components/ProductsSection.jsx";
import OrdersSection from "./components/OrdersSection.jsx";
import ForecastsSection from "./components/ForecastsSection.jsx";
import Sidebar from "./components/Sidebar.jsx";
import DashboardHeader from "./components/DashboardHeader.jsx";
import AuthPage from "./components/AuthPage.jsx";
import AssistantSection from "./components/AssistantSection.jsx";
import { getHealthStatus } from "./api/healthApi.js";
import useAssistant from "./hooks/useAssistant.js";
import useRecommendations from "./hooks/useRecommendations.js";
import useAuth from "./hooks/useAuth.js";
import useOrders from "./hooks/useOrders.js";
import useForecasts from "./hooks/useForecasts.js";
import useProducts from "./hooks/useProducts.js";

const sectionRoutes = {
  dashboard: {
    path: "/",
    sectionId: "dashboard-section",
  },
  assistant: {
    path: "/assistant",
    sectionId: "assistant-section",
  },
  products: {
    path: "/products",
    sectionId: "products-section",
  },
  orders: {
    path: "/orders",
    sectionId: "orders-section",
  },
  forecasts: {
    path: "/forecasts",
    sectionId: "forecasts-section",
  },
  recommendations: {
    path: "/recommendations",
    sectionId: "recommendations-section",
  },
};

const pathToSection = Object.entries(sectionRoutes).reduce(
  (acc, [sectionName, route]) => ({
    ...acc,
    [route.path]: sectionName,
  }),
  {},
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState("checking");
  const [activeSection, setActiveSection] = useState("dashboard");
  const assistant = useAssistant();

  const productState = useProducts({
    clearRecommendationFeedback: () => recommendationState.clearFeedback(),
    refreshRecommendations: () => recommendationState.fetchRecommendations(),
    markAssistantStale: assistant.markStale,
  });

  const recommendationState = useRecommendations({
    products: productState.products,
    onDataChanged: assistant.markStale,
  });

  const forecastState = useForecasts({
    getProductName: productState.getProductName,
    refreshRecommendationsAfterForecasts:
      recommendationState.refreshAfterForecasts,
    markAssistantStale: assistant.markStale,
  });

  const auth = useAuth({
    onSessionReset: resetDashboardState,
  });

  const currentUser = auth.currentUser;

  const orderState = useOrders({
    products: productState.products,
    fetchProducts: productState.fetchProducts,
    clearRecommendationFeedback: recommendationState.clearFeedback,
    markAssistantStale: assistant.markStale,
    clearForecastSuccess: forecastState.clearSuccess,
    onOrderCreated: () => {
      setActiveSection("orders");

      setTimeout(() => {
        document.getElementById("orders-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    },
  });

  function resetDashboardState() {
    productState.reset();
    forecastState.reset();
    orderState.reset();
    recommendationState.reset();
    assistant.reset();
  }

  function scrollToSection(sectionName) {
    const route = sectionRoutes[sectionName] || sectionRoutes.dashboard;

    setActiveSection(sectionName);

    if (location.pathname !== route.path) {
      navigate(route.path);
    }

    setTimeout(() => {
      document.getElementById(route.sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  useEffect(() => {
    const sectionName = pathToSection[location.pathname] || "dashboard";
    const section = sectionRoutes[sectionName];

    setActiveSection(sectionName);

    if (!currentUser) {
      return;
    }

    setTimeout(() => {
      document.getElementById(section.sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [location.pathname, currentUser]);

  async function checkBackendHealth() {
    try {
      await getHealthStatus();
      setBackendStatus("connected");
    } catch (error) {
      console.error("Error checking backend health:", error.message);
      setBackendStatus("offline");
    }
  }

  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      resetDashboardState();
      return;
    }

    resetDashboardState();
    productState.fetchProducts();
    recommendationState.fetchRecommendations();
    orderState.fetchOrders();
    forecastState.fetchForecasts();
  }, [currentUser?.id]);

  if (auth.checkingAuth) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Loading SmartOps AI...</h2>
          <p className="auth-description">Checking your session.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthPage
        authMode={auth.authMode}
        setAuthMode={auth.setAuthMode}
        authForm={auth.authForm}
        authError={auth.authError}
        authSuccess={auth.authSuccess}
        loadingAuth={auth.loadingAuth}
        onAuthInputChange={auth.handleAuthInputChange}
        onSubmitAuth={auth.handleSubmitAuth}
      />
    );
  }

  if (!pathToSection[location.pathname]) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onNavigate={scrollToSection} />

      <div className="main-shell">
        <DashboardHeader
          backendStatus={backendStatus}
          currentUser={currentUser}
          onLogout={auth.handleLogout}
        />

        <main className="dashboard-content">
          <section id="dashboard-section">
            <SummaryCards
              productsCount={productState.products.length}
              ordersCount={orderState.orders.length}
              forecastsCount={forecastState.forecasts.length}
              lowStockProductsCount={productState.lowStockProductsCount}
            />
          </section>

          <AssistantSection
            sectionId="assistant-section"
            assistantQuestion={assistant.question}
            assistantAnswer={assistant.answer}
            assistantHighlights={assistant.highlights}
            assistantActions={assistant.actions}
            assistantHistory={assistant.history}
            assistantStale={assistant.stale}
            assistantError={assistant.error}
            loadingAssistant={assistant.loading}
            onQuestionChange={assistant.handleQuestionChange}
            onAskAssistant={assistant.submitQuestion}
            onRefreshSummary={assistant.refreshSummary}
            onClearAssistant={assistant.clear}
          />

          <ProductsSection
            sectionId="products-section"
            productSuccess={productState.productSuccess}
            productsError={productState.productsError}
            loadingProducts={productState.loadingProducts}
            newProduct={productState.newProduct}
            onInputChange={productState.handleProductInputChange}
            onCreateProduct={productState.createProduct}
            creatingProduct={productState.creatingProduct}
            onRefreshProducts={productState.fetchProducts}
            productSearch={productState.productSearch}
            setProductSearch={productState.setProductSearch}
            productFilter={productState.productFilter}
            setProductFilter={productState.setProductFilter}
            filteredProducts={productState.filteredProducts}
            products={productState.products}
            sortOption={productState.sortOption}
            setSortOption={productState.setSortOption}
            sortedProducts={productState.sortedProducts}
            isLowStock={productState.isLowStock}
            inventoryByProductId={productState.inventoryByProductId}
            generatingProductId={recommendationState.generatingProductId}
            latestRecommendations={recommendationState.latestRecommendations}
            onGenerateRecommendation={
              recommendationState.generateRecommendationForProduct
            }
            stockUpdates={productState.stockUpdates}
            updatingStockProductId={productState.updatingStockProductId}
            onStockInputChange={productState.handleStockInputChange}
            onUpdateStock={productState.updateProductStock}
          />

          <OrdersSection
            sectionId="orders-section"
            products={productState.products}
            inventoryByProductId={productState.inventoryByProductId}
            orders={orderState.orders}
            newOrder={orderState.newOrder}
            ordersError={orderState.ordersError}
            orderSuccess={orderState.orderSuccess}
            loadingOrders={orderState.loadingOrders}
            creatingOrder={orderState.creatingOrder}
            onOrderInputChange={orderState.handleOrderInputChange}
            onCreateOrder={orderState.createOrder}
            onRefreshOrders={orderState.fetchOrders}
            getProductName={productState.getProductName}
          />

          <ForecastsSection
            sectionId="forecasts-section"
            productsCount={productState.products.length}
            ordersCount={orderState.orders.length}
            forecasts={forecastState.forecasts}
            forecastsError={forecastState.forecastsError}
            forecastSuccess={forecastState.forecastSuccess}
            loadingForecasts={forecastState.loadingForecasts}
            onRefreshForecasts={forecastState.refreshForecasts}
            getProductName={productState.getProductName}
          />

          <RecommendationsSection
            sectionId="recommendations-section"
            productsCount={productState.products.length}
            ordersCount={orderState.orders.length}
            forecastsCount={forecastState.forecasts.length}
            loadingRecommendations={recommendationState.loadingRecommendations}
            recommendationsError={recommendationState.recommendationsError}
            recommendationSuccess={recommendationState.recommendationSuccess}
            recommendations={recommendationState.recommendations}
            latestRecommendations={recommendationState.latestRecommendations}
            hasGeneratedRecommendations={
              recommendationState.hasGeneratedRecommendations
            }
            productsError={productState.productsError}
            onGenerateRecommendations={
              recommendationState.generateRecommendations
            }
            onRefreshRecommendations={recommendationState.fetchRecommendations}
            getProductName={productState.getProductName}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
