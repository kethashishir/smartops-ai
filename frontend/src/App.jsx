import { useEffect, useState } from "react";
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
import {
  getProducts,
  createProduct as createProductApi,
} from "./api/productsApi.js";
import {
  getInventoryForProduct,
  updateInventoryForProduct,
} from "./api/inventoryApi.js";
import { getHealthStatus } from "./api/healthApi.js";
import useAssistant from "./hooks/useAssistant.js";
import useRecommendations from "./hooks/useRecommendations.js";
import useAuth from "./hooks/useAuth.js";
import useOrders from "./hooks/useOrders.js";
import useForecasts from "./hooks/useForecasts.js";

function App() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    unit_price: "",
    reorder_threshold: "",
  });
  const [productSuccess, setProductSuccess] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [inventoryByProductId, setInventoryByProductId] = useState({});
  const [productFilter, setProductFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [productSearch, setProductSearch] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stockUpdates, setStockUpdates] = useState({});
  const [updatingStockProductId, setUpdatingStockProductId] = useState(null);
  const assistant = useAssistant();
  const recommendationState = useRecommendations({
    products,
    onDataChanged: assistant.markStale,
  });
  const forecastState = useForecasts({
    getProductName,
    refreshRecommendationsAfterForecasts:
      recommendationState.refreshAfterForecasts,
    markAssistantStale: assistant.markStale,
  });
  const auth = useAuth({
    onSessionReset: resetDashboardState,
  });
  const currentUser = auth.currentUser;
  const orderState = useOrders({
    products,
    fetchProducts,
    clearRecommendationFeedback: recommendationState.clearFeedback,
    markAssistantStale: assistant.markStale,
    clearForecastSuccess: () => forecastState.clearSuccess(),
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
    setProducts([]);
    setInventoryByProductId({});

    setProductSuccess("");

    setProductsError("");

    setProductSearch("");
    setProductFilter("all");
    setSortOption("default");
    setStockUpdates({});

    forecastState.reset();
    orderState.reset();
    recommendationState.reset();
    assistant.reset();
  }

  function handleProductInputChange(event) {
    setProductSuccess("");
    const { name, value } = event.target;

    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  }

  function handleStockInputChange(productId, value) {
    setStockUpdates({
      ...stockUpdates,
      [productId]: value,
    });
  }

  function scrollToSection(sectionId, activeName) {
    setActiveSection(activeName);

    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  async function createProduct(event) {
    event.preventDefault();

    try {
      setCreatingProduct(true);
      setProductsError("");

      await createProductApi({
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unit_price: Number(newProduct.unit_price),
        reorder_threshold: Number(newProduct.reorder_threshold),
      });

      setNewProduct({
        name: "",
        sku: "",
        category: "",
        unit_price: "",
        reorder_threshold: "",
      });

      await fetchProducts();
      setProductSuccess("Product created successfully.");
      assistant.markStale();
    } catch (error) {
      console.error("Error creating product:", error.message);
      setProductsError(
        "Could not create product. Please check the form and backend.",
      );
    } finally {
      setCreatingProduct(false);
    }
  }

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      setProductsError("");
      const data = await getProducts();
      setProducts(data);
      await fetchInventoryForProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setProductsError(
        "Could not load products. Please make sure the backend is running.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchInventoryForProducts(productsList) {
    const inventoryMap = {};

    for (const product of productsList) {
      try {
        const inventory = await getInventoryForProduct(product.id);
        inventoryMap[product.id] = inventory.current_stock;
      } catch (error) {
        console.error(
          `Error fetching inventory for product ${product.id}:`,
          error.message,
        );
        inventoryMap[product.id] = "N/A";
      }
    }

    setInventoryByProductId(inventoryMap);
  }

  async function checkBackendHealth() {
    try {
      await getHealthStatus();
      setBackendStatus("connected");
    } catch (error) {
      console.error("Error checking backend health:", error.message);
      setBackendStatus("offline");
    }
  }

  async function updateProductStock(productId) {
    try {
      setProductsError("");
      recommendationState.clearFeedback();
      setUpdatingStockProductId(productId);

      const updatedInventory = await updateInventoryForProduct(
        productId,
        stockUpdates[productId],
      );

      setInventoryByProductId({
        ...inventoryByProductId,
        [productId]: updatedInventory.current_stock,
      });

      await generateRecommendation(productId);
      await recommendationState.fetchRecommendations();

      const product = products.find((product) => product.id === productId);

      setProductSuccess(
        `Inventory updated and recommendation refreshed for ${
          product?.name || "selected product"
        }.`,
      );

      assistant.markStale();

      setStockUpdates({
        ...stockUpdates,
        [productId]: "",
      });
    } catch (error) {
      console.error("Error updating inventory:", error.message);
      setProductsError(
        "Could not update inventory or refresh recommendation. Please check the backend.",
      );
    } finally {
      setUpdatingStockProductId(null);
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
    fetchProducts();
    recommendationState.fetchRecommendations();
    orderState.fetchOrders();
    forecastState.fetchForecasts();
  }, [currentUser?.id]);

  function getProductName(productId) {
    const product = products.find((product) => product.id === productId);
    return product ? product.name : `Product ${productId}`;
  }

  const lowStockProductsCount = products.filter((product) => {
    const currentStock = inventoryByProductId[product.id];

    if (currentStock === undefined || currentStock === "N/A") {
      return false;
    }

    return currentStock <= product.reorder_threshold;
  }).length;

  function isLowStock(product) {
    const currentStock = inventoryByProductId[product.id];

    if (currentStock === undefined || currentStock === "N/A") {
      return false;
    }

    return currentStock <= product.reorder_threshold;
  }

  const searchedProducts = products.filter((product) => {
    const searchText = productSearch.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText)
    );
  });

  const filteredProducts = searchedProducts.filter((product) => {
    if (productFilter === "low") {
      return isLowStock(product);
    }

    if (productFilter === "healthy") {
      return !isLowStock(product);
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-low") {
      return a.unit_price - b.unit_price;
    }

    if (sortOption === "price-high") {
      return b.unit_price - a.unit_price;
    }

    if (sortOption === "stock-low") {
      const stockA = inventoryByProductId[a.id] ?? Number.MAX_VALUE;
      const stockB = inventoryByProductId[b.id] ?? Number.MAX_VALUE;

      return stockA - stockB;
    }

    return 0;
  });

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
          <section>
            <SummaryCards
              productsCount={products.length}
              ordersCount={orderState.orders.length}
              forecastsCount={forecastState.forecasts.length}
              lowStockProductsCount={lowStockProductsCount}
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
            productSuccess={productSuccess}
            productsError={productsError}
            loadingProducts={loadingProducts}
            newProduct={newProduct}
            onInputChange={handleProductInputChange}
            onCreateProduct={createProduct}
            creatingProduct={creatingProduct}
            onRefreshProducts={fetchProducts}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            productFilter={productFilter}
            setProductFilter={setProductFilter}
            filteredProducts={filteredProducts}
            products={products}
            sortOption={sortOption}
            setSortOption={setSortOption}
            sortedProducts={sortedProducts}
            isLowStock={isLowStock}
            inventoryByProductId={inventoryByProductId}
            generatingProductId={recommendationState.generatingProductId}
            latestRecommendations={recommendationState.latestRecommendations}
            onGenerateRecommendation={
              recommendationState.generateRecommendationForProduct
            }
            stockUpdates={stockUpdates}
            updatingStockProductId={updatingStockProductId}
            onStockInputChange={handleStockInputChange}
            onUpdateStock={updateProductStock}
          />

          <OrdersSection
            sectionId="orders-section"
            products={products}
            inventoryByProductId={inventoryByProductId}
            orders={orderState.orders}
            newOrder={orderState.newOrder}
            ordersError={orderState.ordersError}
            orderSuccess={orderState.orderSuccess}
            loadingOrders={orderState.loadingOrders}
            creatingOrder={orderState.creatingOrder}
            onOrderInputChange={orderState.handleOrderInputChange}
            onCreateOrder={orderState.createOrder}
            onRefreshOrders={orderState.fetchOrders}
            getProductName={getProductName}
          />

          <ForecastsSection
            sectionId="forecasts-section"
            productsCount={products.length}
            ordersCount={orderState.orders.length}
            forecasts={forecastState.forecasts}
            forecastsError={forecastState.forecastsError}
            forecastSuccess={forecastState.forecastSuccess}
            loadingForecasts={forecastState.loadingForecasts}
            onRefreshForecasts={forecastState.refreshForecasts}
            getProductName={getProductName}
          />

          <RecommendationsSection
            sectionId="recommendations-section"
            productsCount={products.length}
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
            productsError={productsError}
            onGenerateRecommendations={
              recommendationState.generateRecommendations
            }
            onRefreshRecommendations={recommendationState.fetchRecommendations}
            getProductName={getProductName}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
