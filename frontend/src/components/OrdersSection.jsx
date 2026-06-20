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
  const recentOrders = orders.slice(0, 5);
  const totalOrderQuantity = orders.reduce(
    (total, order) => total + Number(order.quantity),
    0,
  );

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

      <div className="order-summary">
        <div>
          <span>{orders.length}</span>
          <p>Total Orders</p>
        </div>

        <div>
          <span>{totalOrderQuantity}</span>
          <p>Total Units Ordered</p>
        </div>

        <div>
          <span>{recentOrders.length}</span>
          <p>Recent Orders Shown</p>
        </div>
      </div>

      <div className="orders-layout">
        <form className="order-form" onSubmit={onCreateOrder}>
          <div>
            <h3>Create Order</h3>
            <p className="section-description">
              Choose a product and quantity to simulate demand.
            </p>
          </div>

          <label>
            Product
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
          </label>

          <label>
            Quantity
            <input
              type="number"
              name="quantity"
              min="1"
              placeholder="Quantity"
              value={newOrder.quantity}
              onChange={onOrderInputChange}
              required
            />
          </label>

          <button type="submit" disabled={creatingOrder}>
            {creatingOrder ? "Creating..." : "Create Order"}
          </button>
        </form>

        <div className="orders-list">
          <div className="orders-list-header">
            <div>
              <h3>Recent Orders</h3>
              <p className="section-description">
                Latest simulated customer demand activity.
              </p>
            </div>
          </div>

          {orders.length === 0 && !loadingOrders && (
            <p style={{ color: "#666", fontStyle: "italic" }}>No orders yet.</p>
          )}

          {orders.length > 0 && (
            <ul className="order-list">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <div className="order-card">
                    <div>
                      <strong>{getProductName(order.product_id)}</strong>
                      <p>
                        {new Date(order.order_time).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <span className="order-quantity">Qty {order.quantity}</span>
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
