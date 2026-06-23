import OrdersSection from "../components/OrdersSection.jsx";

function OrdersPage({ productState, orderState }) {
  return (
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
      deletingOrderId={orderState.deletingOrderId}
      onDeleteOrder={orderState.removeOrder}
    />
  );
}

export default OrdersPage;
