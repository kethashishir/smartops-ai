import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import DashboardPage from "./pages/DashboardPage.jsx";
import AssistantPage from "./pages/AssistantPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ForecastsPage from "./pages/ForecastsPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import DashboardHeader from "./components/DashboardHeader.jsx";
import AuthPage from "./components/AuthPage.jsx";
import { getHealthStatus } from "./api/healthApi.js";
import useAssistant from "./hooks/useAssistant.js";
import useRecommendations from "./hooks/useRecommendations.js";
import useAuth from "./hooks/useAuth.js";
import useOrders from "./hooks/useOrders.js";
import useForecasts from "./hooks/useForecasts.js";
import useProducts from "./hooks/useProducts.js";
import { pathToSection, sectionRoutes } from "./routes.js";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState("checking");
  const activeSection = pathToSection[location.pathname] || "dashboard";
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

  const currentRoute = sectionRoutes[activeSection] || sectionRoutes.dashboard;

  const orderState = useOrders({
    products: productState.products,
    fetchProducts: productState.fetchProducts,
    clearRecommendationFeedback: recommendationState.clearFeedback,
    markAssistantStale: assistant.markStale,
    clearForecastSuccess: forecastState.clearSuccess,
    onOrderCreated: () => {
      navigate("/orders");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      document.querySelector(".main-shell")?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  });

  function resetDashboardState() {
    productState.reset();
    forecastState.reset();
    orderState.reset();
    recommendationState.reset();
    assistant.reset();
  }

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      document.querySelector(".main-shell")?.scrollTo({
        top: 0,
        behavior: "smooth",
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
    function handleApiConnected() {
      setBackendStatus("connected");
    }

    window.addEventListener("smartops:api-connected", handleApiConnected);

    return () => {
      window.removeEventListener("smartops:api-connected", handleApiConnected);
    };
  }, []);

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

  function renderDashboardPage() {
    return (
      <DashboardPage
        productsCount={productState.products.length}
        ordersCount={orderState.orders.length}
        forecastsCount={forecastState.forecasts.length}
        forecasts={forecastState.forecasts}
        recommendationsCount={recommendationState.recommendations.length}
        latestRecommendations={recommendationState.latestRecommendations}
        lowStockProductsCount={productState.lowStockProductsCount}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-shell">
        <DashboardHeader
          backendStatus={backendStatus}
          currentUser={currentUser}
          eyebrow={currentRoute.eyebrow}
          title={currentRoute.title}
          description={currentRoute.description}
          onLogout={auth.handleLogout}
        />

        <main className="dashboard-content">
          <Routes>
            <Route path="/" element={renderDashboardPage()} />
            <Route
              path="/assistant"
              element={<AssistantPage assistant={assistant} />}
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  productState={productState}
                  recommendationState={recommendationState}
                />
              }
            />
            <Route
              path="/orders"
              element={
                <OrdersPage
                  productState={productState}
                  orderState={orderState}
                />
              }
            />
            <Route
              path="/forecasts"
              element={
                <ForecastsPage
                  productState={productState}
                  orderState={orderState}
                  forecastState={forecastState}
                />
              }
            />
            <Route
              path="/recommendations"
              element={
                <RecommendationsPage
                  productState={productState}
                  orderState={orderState}
                  forecastState={forecastState}
                  recommendationState={recommendationState}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
