import { useState } from "react";
import {
  createOrder as createOrderApi,
  deleteOrder as deleteOrderApi,
  getOrders,
} from "../api/ordersApi.js";

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
  const [deletingOrderId, setDeletingOrderId] = useState(null);
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
    setDeletingOrderId(null);
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

  async function removeOrder(orderId) {
    const order = orders.find((item) => item.id === orderId);
    const productName = order?.product_name || "this product";

    const confirmed = window.confirm(
      `Delete this order for ${productName}? Inventory will be restored.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      setOrdersError("");
      setOrderSuccess("");

      const result = await deleteOrderApi(orderId);

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

      setOrderSuccess(
        `Order deleted. Restored ${result.restored_quantity} unit(s) to inventory.`,
      );

      if (markAssistantStale) {
        markAssistantStale();
      }

      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error) {
      console.error("Error deleting order:", error.message);
      setOrdersError(error.message || "Could not delete order.");
    } finally {
      setDeletingOrderId(null);
    }
  }

  return {
    orders,
    loadingOrders,
    ordersError,
    orderSuccess,
    creatingOrder,
    deletingOrderId,
    newOrder,
    reset,
    clearFeedback,
    handleOrderInputChange,
    fetchOrders,
    createOrder,
    removeOrder,
  };
}

export default useOrders;
