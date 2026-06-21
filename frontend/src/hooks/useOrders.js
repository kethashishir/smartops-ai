import { useState } from "react";
import { getOrders, createOrder as createOrderApi } from "../api/ordersApi.js";

function useOrders({
  products,
  fetchProducts,
  clearRecommendationFeedback,
  markAssistantStale,
  clearForecastSuccess,
  onOrderCreated,
}) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    product_id: "",
    quantity: "",
    source: "dashboard",
  });

  function reset() {
    setOrders([]);
    setLoadingOrders(false);
    setOrdersError("");
    setOrderSuccess("");
    setCreatingOrder(false);
    setNewOrder({
      product_id: "",
      quantity: "",
      source: "dashboard",
    });
  }

  function clearFeedback() {
    setOrdersError("");
    setOrderSuccess("");
  }

  function handleOrderInputChange(event) {
    clearFeedback();

    const { name, value } = event.target;

    setNewOrder((currentOrder) => ({
      ...currentOrder,
      [name]: value,
    }));
  }

  async function fetchOrders() {
    try {
      setLoadingOrders(true);
      setOrdersError("");

      const data = await getOrders();

      const sortedOrders = [...data].sort(
        (a, b) => new Date(b.order_time) - new Date(a.order_time),
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      setOrdersError("Could not load orders. Please check the backend.");
    } finally {
      setLoadingOrders(false);
    }
  }

  async function createOrder(event) {
    event.preventDefault();

    try {
      setCreatingOrder(true);
      setOrdersError("");
      setOrderSuccess("");

      if (clearRecommendationFeedback) {
        clearRecommendationFeedback();
      }

      await createOrderApi(newOrder);

      await fetchOrders();

      if (fetchProducts) {
        await fetchProducts();
      }

      if (clearForecastSuccess) {
        clearForecastSuccess();
      }

      if (clearRecommendationFeedback) {
        clearRecommendationFeedback();
      }

      const product = products.find(
        (item) => item.id === Number(newOrder.product_id),
      );

      setOrderSuccess(
        `Order created for ${product?.name || "selected product"}. Inventory updated. Generate forecasts next to refresh demand planning and recommendations.`,
      );

      if (markAssistantStale) {
        markAssistantStale();
      }

      if (onOrderCreated) {
        onOrderCreated();
      }

      setNewOrder({
        product_id: "",
        quantity: "",
        source: "dashboard",
      });
    } catch (error) {
      console.error("Error creating order:", error.message);
      setOrdersError(error.message || "Could not create order.");
    } finally {
      setCreatingOrder(false);
    }
  }

  return {
    orders,
    loadingOrders,
    ordersError,
    orderSuccess,
    creatingOrder,
    newOrder,
    reset,
    clearFeedback,
    handleOrderInputChange,
    fetchOrders,
    createOrder,
  };
}

export default useOrders;
