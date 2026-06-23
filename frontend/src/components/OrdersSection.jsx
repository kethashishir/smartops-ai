function OrdersSection({
  sectionId,
  products,
  inventoryByProductId,
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
  deletingOrderId,
  onDeleteOrder,
}) {
  const recentOrders = orders.slice(0, 5);
  const totalOrderQuantity = orders.reduce(
    (total, order) => total + Number(order.quantity),
    0,
  );

  const hasProducts = products.length > 0;
  const stockedProducts = products.filter((product) => {
    const currentStock = inventoryByProductId[product.id];

    return (
      currentStock !== undefined && currentStock !== "N/A" && currentStock > 0
    );
  });
  const hasStockedProducts = stockedProducts.length > 0;
  const hasOrders = orders.length > 0;
  const selectedProductStock = newOrder.product_id
    ? inventoryByProductId[Number(newOrder.product_id)]
    : null;

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
              Choose a stocked product and quantity to simulate demand.
            </p>
          </div>

          {!hasProducts && (
            <p className="empty-state">
              Add a product first before creating customer orders.
            </p>
          )}

          {hasProducts && !hasStockedProducts && (
            <p className="empty-state">
              Products exist, but none have available stock yet. Update product
              inventory before creating an order.
            </p>
          )}

          <label>
            Product
            <select
              name="product_id"
              value={newOrder.product_id}
              onChange={onOrderInputChange}
              required
              disabled={!hasStockedProducts}
            >
              <option value="">Select product</option>
              {products.map((product) => {
                const currentStock = inventoryByProductId[product.id];
                const isOutOfStock =
                  currentStock === undefined ||
                  currentStock === "N/A" ||
                  currentStock <= 0;

                return (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={isOutOfStock}
                  >
                    {product.name} -{" "}
                    {currentStock === undefined || currentStock === "N/A"
                      ? "stock unavailable"
                      : `${currentStock} in stock`}
                  </option>
                );
              })}
            </select>
          </label>

          {newOrder.product_id && selectedProductStock !== null && (
            <p className="form-helper">
              Available stock for selected product: {selectedProductStock}
            </p>
          )}

          <label>
            Quantity
            <input
              type="number"
              name="quantity"
              min="1"
              max={
                selectedProductStock &&
                selectedProductStock !== "N/A" &&
                selectedProductStock > 0
                  ? selectedProductStock
                  : undefined
              }
              placeholder="Quantity"
              value={newOrder.quantity}
              onChange={onOrderInputChange}
              required
              disabled={!hasStockedProducts}
            />
          </label>

          <button type="submit" disabled={creatingOrder || !hasStockedProducts}>
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

          {!hasOrders && !loadingOrders && !ordersError && (
            <p className="empty-state">
              No orders yet. Create an order after adding products and updating
              inventory to start generating demand history.
            </p>
          )}

          {hasOrders && (
            <ul className="order-list">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <div className="order-card">
                    <div>
                      <strong>
                        {order.product_name || getProductName(order.product_id)}
                      </strong>
                      <p>
                        {new Date(order.order_time).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="order-card-actions">
                      <span className="order-quantity">Qty {order.quantity}</span>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => onDeleteOrder(order.id)}
                        disabled={deletingOrderId === order.id}
                      >
                        {deletingOrderId === order.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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
