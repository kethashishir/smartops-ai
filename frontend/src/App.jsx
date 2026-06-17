import { useEffect, useState } from "react";
import "./App.css";

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

  function handleProductInputChange(event) {
    setProductSuccess("");
    const { name, value } = event.target;

    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  }

  async function createProduct(event) {
    event.preventDefault();

    try {
      setCreatingProduct(true);
      setProductsError("");

      const response = await fetch("http://127.0.0.1:8000/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name,
          sku: newProduct.sku,
          category: newProduct.category,
          unit_price: Number(newProduct.unit_price),
          reorder_threshold: Number(newProduct.reorder_threshold),
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

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
      const response = await fetch("http://127.0.0.1:8000/products/");
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
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
        const response = await fetch(
          `http://127.0.0.1:8000/inventory/${product.id}`,
        );

        if (!response.ok) {
          inventoryMap[product.id] = "N/A";
          continue;
        }

        const inventory = await response.json();
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

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchRecommendations() {
    try {
      setRecommendationsError("");
      console.log("Fetching recommendations...");
      const response = await fetch("http://127.0.0.1:8000/recommendations/");
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
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
      setRecommendationsError("");
      setLoadingRecommendations(true);
      console.log("Generating recommendations...");

      const response = await fetch(
        "http://127.0.0.1:8000/recommendations/generate_all",
        {
          method: "POST",
        },
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      console.log("New recommendations generated:", data);

      await fetchRecommendations();
    } catch (error) {
      console.error("Error generating recommendations:", error.message);
      setRecommendationsError(
        "Could not generate recommendations. Please check the backend.",
      );
    } finally {
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
  const filteredProducts = products.filter((product) => {
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
    <div className="page">
      <h1>SmartOps Frontend</h1>
      <p className="subtitle">
        Backend-connected dashboard for product inventory and reorder
        recommendations.
      </p>
      <section className="summary">
        <div className="summary-card">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>

        <div className="summary-card">
          <h3>Active Recommendations</h3>
          <p>{latestRecommendations.length}</p>
        </div>
        <div className="summary-card">
          <h3>Low Stock Products</h3>
          <p>{lowStockProductsCount}</p>
        </div>
      </section>
      <section className="section">
        {productSuccess && <p className="success">{productSuccess}</p>}
        {productsError && <p className="error">{productsError}</p>}
        {loadingProducts && <p>Loading products...</p>}
        <h3>Create New Product</h3>
        <form className="product-form" onSubmit={createProduct}>
          <input
            type="text"
            name="name"
            placeholder="Product name"
            value={newProduct.name}
            onChange={handleProductInputChange}
            required
          />

          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={newProduct.sku}
            onChange={handleProductInputChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newProduct.category}
            onChange={handleProductInputChange}
            required
          />

          <input
            type="number"
            name="unit_price"
            placeholder="Unit price"
            value={newProduct.unit_price}
            onChange={handleProductInputChange}
            step="0.01"
            min="0"
            required
          />

          <input
            type="number"
            name="reorder_threshold"
            placeholder="Reorder threshold"
            value={newProduct.reorder_threshold}
            onChange={handleProductInputChange}
            min="0"
            required
          />
          <button type="submit" disabled={creatingProduct}>
            {creatingProduct ? "Creating..." : "Create Product"}
          </button>
        </form>
        <button onClick={fetchProducts} disabled={loadingProducts}>
          {loadingProducts ? "Refreshing..." : "Refresh Products"}
        </button>
        <h2>Products</h2>
        <div className="filter-buttons">
          <button
            className={productFilter === "all" ? "active-filter" : ""}
            onClick={() => setProductFilter("all")}
          >
            All
          </button>

          <button
            className={productFilter === "low" ? "active-filter" : ""}
            onClick={() => setProductFilter("low")}
          >
            Low Stock
          </button>

          <button
            className={productFilter === "healthy" ? "active-filter" : ""}
            onClick={() => setProductFilter("healthy")}
          >
            Healthy
          </button>
        </div>
        <p className="filter-count">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <div className="sort-control">
          <label htmlFor="sort-products">Sort Products: </label>

          <select
            id="sort-products"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock-low">Stock: Low to High</option>
          </select>
        </div>
        {filteredProducts.length === 0 &&
          !loadingProducts &&
          !productsError && (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No products match this filter.
            </p>
          )}
        {!loadingProducts && !productsError && filteredProducts.length > 0 && (
          <ul>
            {sortedProducts.map((product) => (
              <li key={product.id}>
                <div
                  className={`card ${isLowStock(product) ? "low-stock-card" : ""}`}
                >
                  <h2>{product.name}</h2>
                  {isLowStock(product) ? (
                    <p className="low-stock-label">Low Stock</p>
                  ) : (
                    <p className="healthy-stock-label">Healthy Stock</p>
                  )}
                  <p>SKU: {product.sku}</p>
                  <p>Category: {product.category}</p>
                  <p>Price: ${product.unit_price.toFixed(2)}</p>
                  <p>Reorder Threshold: {product.reorder_threshold}</p>
                  <p>
                    Current Stock:{" "}
                    {inventoryByProductId[product.id] ?? "Loading..."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="section">
        <h2>Recommendations</h2>

        <button
          onClick={generateRecommendations}
          disabled={loadingRecommendations}
        >
          {loadingRecommendations
            ? "Generating..."
            : "Generate Recommendations"}
        </button>
        <button
          onClick={fetchRecommendations}
          disabled={loadingRecommendations}
        >
          Refresh Recommendations
        </button>
        {loadingRecommendations && <p>Loading recommendations...</p>}
        {recommendationsError && (
          <p className="error">{recommendationsError}</p>
        )}
        {hasGeneratedRecommendations &&
          recommendations.length === 0 &&
          !loadingRecommendations &&
          !recommendationsError &&
          !productsError && (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No recommendations generated yet.
            </p>
          )}
        {recommendations.length > 0 && (
          <ul>
            {latestRecommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <div className="card">
                  <h2>Product: {getProductName(recommendation.product_id)}</h2>
                  <p>
                    Recommended Quantity: {recommendation.recommended_quantity}
                  </p>
                  <p>Reason: {recommendation.reason}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
