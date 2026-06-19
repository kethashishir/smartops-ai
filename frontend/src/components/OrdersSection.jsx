function OrdersSection({
  sectionId,
  products,
  orders,
  newOrder,
  ordersError,
  orderSuccess,
  loadingOrders,
  creatingOrder,
  onOrderInputChange,
  onCreateOrder,
  onRefreshOrders,
  getProductName,
}) {
  return (
    <section id={sectionId} className="section">
      <div className="orders-header">
        <div>
          <h2>Orders</h2>
          <p className="section-description">
            Simulate customer orders and automatically reduce product inventory.
          </p>
        </div>

        <button onClick={onRefreshOrders} disabled={loadingOrders}>
          {loadingOrders ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {ordersError && <p className="error">{ordersError}</p>}
      {orderSuccess && <p className="success">{orderSuccess}</p>}
      {loadingOrders && <p>Loading orders...</p>}

      <div className="orders-layout">
        <form className="order-form" onSubmit={onCreateOrder}>
          <h3>Create Order</h3>

          <select
            name="product_id"
            value={newOrder.product_id}
            onChange={onOrderInputChange}
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="quantity"
            min="1"
            placeholder="Quantity"
            value={newOrder.quantity}
            onChange={onOrderInputChange}
            required
          />

          <button type="submit" disabled={creatingOrder}>
            {creatingOrder ? "Creating..." : "Create Order"}
          </button>
        </form>

        <div className="orders-list">
          <h3>Recent Orders</h3>

          {orders.length === 0 && !loadingOrders && (
            <p style={{ color: "#666", fontStyle: "italic" }}>No orders yet.</p>
          )}

          {orders.length > 0 && (
            <ul>
              {orders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <div className="order-card">
                    <strong>{getProductName(order.product_id)}</strong>
                    <p>Quantity: {order.quantity}</p>
                    <p>
                      Time:{" "}
                      {new Date(order.order_time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default OrdersSection;
