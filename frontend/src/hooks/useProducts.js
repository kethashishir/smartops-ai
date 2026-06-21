import { useMemo, useState } from "react";
import {
  getProducts,
  createProduct as createProductApi,
} from "../api/productsApi.js";
import {
  getInventoryForProduct,
  updateInventoryForProduct,
} from "../api/inventoryApi.js";
import { generateRecommendation } from "../api/recommendationsApi.js";

const emptyProductForm = {
  name: "",
  sku: "",
  category: "",
  unit_price: "",
  reorder_threshold: "",
};

function useProducts({
  clearRecommendationFeedback,
  refreshRecommendations,
  markAssistantStale,
}) {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyProductForm);
  const [productSuccess, setProductSuccess] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [inventoryByProductId, setInventoryByProductId] = useState({});
  const [productFilter, setProductFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [productSearch, setProductSearch] = useState("");
  const [stockUpdates, setStockUpdates] = useState({});
  const [updatingStockProductId, setUpdatingStockProductId] = useState(null);

  function reset() {
    setProducts([]);
    setProductsError("");
    setLoadingProducts(false);
    setNewProduct(emptyProductForm);
    setProductSuccess("");
    setCreatingProduct(false);
    setInventoryByProductId({});
    setProductFilter("all");
    setSortOption("default");
    setProductSearch("");
    setStockUpdates({});
    setUpdatingStockProductId(null);
  }

  function getProductName(productId) {
    const product = products.find((item) => item.id === productId);
    return product ? product.name : `Product ${productId}`;
  }

  function isLowStock(product) {
    const currentStock = inventoryByProductId[product.id];

    if (currentStock === undefined || currentStock === "N/A") {
      return false;
    }

    return currentStock <= product.reorder_threshold;
  }

  const lowStockProductsCount = useMemo(
    () => products.filter((product) => isLowStock(product)).length,
    [products, inventoryByProductId],
  );

  const searchedProducts = useMemo(() => {
    const searchText = productSearch.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchText) ||
        product.sku.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText),
    );
  }, [products, productSearch]);

  const filteredProducts = useMemo(
    () =>
      searchedProducts.filter((product) => {
        if (productFilter === "low") {
          return isLowStock(product);
        }

        if (productFilter === "healthy") {
          return !isLowStock(product);
        }

        return true;
      }),
    [searchedProducts, productFilter, inventoryByProductId],
  );

  const sortedProducts = useMemo(
    () =>
      [...filteredProducts].sort((a, b) => {
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
      }),
    [filteredProducts, sortOption, inventoryByProductId],
  );

  function handleProductInputChange(event) {
    setProductSuccess("");

    const { name, value } = event.target;

    setNewProduct((currentProduct) => ({
      ...currentProduct,
      [name]: value,
    }));
  }

  function handleStockInputChange(productId, value) {
    setStockUpdates((currentUpdates) => ({
      ...currentUpdates,
      [productId]: value,
    }));
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

      setNewProduct(emptyProductForm);

      await fetchProducts();
      setProductSuccess("Product created successfully.");

      if (markAssistantStale) {
        markAssistantStale();
      }
    } catch (error) {
      console.error("Error creating product:", error.message);
      setProductsError(
        "Could not create product. Please check the form and backend.",
      );
    } finally {
      setCreatingProduct(false);
    }
  }

  async function updateProductStock(productId) {
    try {
      setProductsError("");

      if (clearRecommendationFeedback) {
        clearRecommendationFeedback();
      }

      setUpdatingStockProductId(productId);

      const updatedInventory = await updateInventoryForProduct(
        productId,
        stockUpdates[productId],
      );

      setInventoryByProductId((currentInventory) => ({
        ...currentInventory,
        [productId]: updatedInventory.current_stock,
      }));

      await generateRecommendation(productId);

      if (refreshRecommendations) {
        await refreshRecommendations();
      }

      const product = products.find((item) => item.id === productId);

      setProductSuccess(
        `Inventory updated and recommendation refreshed for ${
          product?.name || "selected product"
        }.`,
      );

      if (markAssistantStale) {
        markAssistantStale();
      }

      setStockUpdates((currentUpdates) => ({
        ...currentUpdates,
        [productId]: "",
      }));
    } catch (error) {
      console.error("Error updating inventory:", error.message);
      setProductsError(
        "Could not update inventory or refresh recommendation. Please check the backend.",
      );
    } finally {
      setUpdatingStockProductId(null);
    }
  }

  return {
    products,
    productsError,
    loadingProducts,
    newProduct,
    productSuccess,
    creatingProduct,
    inventoryByProductId,
    productFilter,
    setProductFilter,
    sortOption,
    setSortOption,
    productSearch,
    setProductSearch,
    stockUpdates,
    updatingStockProductId,
    lowStockProductsCount,
    filteredProducts,
    sortedProducts,
    reset,
    getProductName,
    isLowStock,
    handleProductInputChange,
    handleStockInputChange,
    fetchProducts,
    createProduct,
    updateProductStock,
  };
}

export default useProducts;
