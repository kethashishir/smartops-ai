import { useEffect, useState } from "react";
import "./App.css";
import SummaryCards from "./components/SummaryCards.jsx";
import RecommendationsSection from "./components/RecommendationsSection.jsx";
import ProductsSection from "./components/ProductsSection.jsx";
import {
  getProducts,
  createProduct as createProductApi,
} from "./api/productsApi.js";
import {
  getInventoryForProduct,
  updateInventoryForProduct,
} from "./api/inventoryApi.js";
import {
  getRecommendations,
  generateAllRecommendations,
  generateRecommendation,
} from "./api/recommendationsApi.js";
import { getHealthStatus } from "./api/healthApi.js";

function App() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] =
    useState(false);
  const [productsError, setProductsError] = useState("");
  const [recommendationsError, setRecommendationsError] = useState("");
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
  const [recommendationSuccess, setRecommendationSuccess] = useState("");
  const [generatingProductId, setGeneratingProductId] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [stockUpdates, setStockUpdates] = useState({});
  const [updatingStockProductId, setUpdatingStockProductId] = useState(null);
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
      console.log("Fetching products...");
      const data = await getProducts();
      console.log("Products fetched:", data);
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
      setUpdatingStockProductId(productId);

      const updatedInventory = await updateInventoryForProduct(
        productId,
        stockUpdates[productId],
      );

      setInventoryByProductId({
        ...inventoryByProductId,
        [productId]: updatedInventory.current_stock,
      });

      setProductSuccess("Inventory updated successfully.");

      setStockUpdates({
        ...stockUpdates,
        [productId]: "",
      });
    } catch (error) {
      console.error("Error updating inventory:", error.message);
      setProductsError("Could not update inventory. Please check the backend.");
    } finally {
      setUpdatingStockProductId(null);
    }
  }

  useEffect(() => {
    checkBackendHealth();
    fetchProducts();
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      setRecommendationsError("");
      console.log("Fetching recommendations...");
      const data = await getRecommendations();
      console.log("Recommendations fetched:", data);
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error.message);
      setRecommendationsError(
        "Could not load recommendations. Please check the backend.",
      );
    }
  }

  async function generateRecommendations() {
    try {
      setRecommendationSuccess("");
      setRecommendationsError("");
      setLoadingRecommendations(true);
      console.log("Generating recommendations...");

      const data = await generateAllRecommendations();
      console.log("New recommendations generated:", data);

      await fetchRecommendations();
    } catch (error) {
      console.error("Error generating recommendations:", error.message);
      setRecommendationsError(
        "Could not generate recommendations. Some products may be missing forecast or inventory data.",
      );
    } finally {
      setLoadingRecommendations(false);
      setHasGeneratedRecommendations(true);
    }
  }

  async function generateRecommendationForProduct(productId) {
    try {
      setGeneratingProductId(productId);
      setRecommendationSuccess("");
      setRecommendationsError("");
      setLoadingRecommendations(true);

      await generateRecommendation(productId);

      await fetchRecommendations();
      setRecommendationSuccess("Recommendation updated successfully.");
    } catch (error) {
      console.error(
        "Error generating recommendation for product:",
        error.message,
      );
      setRecommendationsError(
        "Could not generate recommendation. This product may be missing forecast or inventory data.",
      );
    } finally {
      setGeneratingProductId(null);
      setLoadingRecommendations(false);
      setHasGeneratedRecommendations(true);
    }
  }

  const latestRecommendations = Object.values(
    recommendations.reduce((acc, recommendation) => {
      acc[recommendation.product_id] = recommendation;
      return acc;
    }, {}),
  );

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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>SmartOps AI</h1>
          <p className="subtitle">
            Operations dashboard for inventory, stock health, and reorder
            recommendations.
          </p>
        </div>

        <p className={`backend-status ${backendStatus}`}>
          Backend{" "}
          {backendStatus === "checking"
            ? "Checking..."
            : backendStatus === "connected"
              ? "Connected"
              : "Offline"}
        </p>
      </header>

      <main className="dashboard-content">
        <SummaryCards
          productsCount={products.length}
          recommendationsCount={latestRecommendations.length}
          lowStockProductsCount={lowStockProductsCount}
        />
        <ProductsSection
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
          generatingProductId={generatingProductId}
          onGenerateRecommendation={generateRecommendationForProduct}
          stockUpdates={stockUpdates}
          updatingStockProductId={updatingStockProductId}
          onStockInputChange={handleStockInputChange}
          onUpdateStock={updateProductStock}
        />
        <RecommendationsSection
          loadingRecommendations={loadingRecommendations}
          recommendationsError={recommendationsError}
          recommendationSuccess={recommendationSuccess}
          recommendations={recommendations}
          latestRecommendations={latestRecommendations}
          hasGeneratedRecommendations={hasGeneratedRecommendations}
          productsError={productsError}
          onGenerateRecommendations={generateRecommendations}
          onRefreshRecommendations={fetchRecommendations}
          getProductName={getProductName}
        />
      </main>
    </div>
  );
}

export default App;
