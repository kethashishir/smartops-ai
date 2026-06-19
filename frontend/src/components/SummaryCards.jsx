function SummaryCards({
  productsCount,
  ordersCount,
  forecastsCount,
  lowStockProductsCount,
}) {
  return (
    <section className="summary">
      <div className="summary-card">
        <h3>Total Products</h3>
        <p>{productsCount}</p>
      </div>

      <div className="summary-card">
        <h3>Orders</h3>
        <p>{ordersCount}</p>
      </div>

      <div className="summary-card">
        <h3>Forecasts</h3>
        <p>{forecastsCount}</p>
      </div>

      <div className="summary-card">
        <h3>Low Stock Products</h3>
        <p>{lowStockProductsCount}</p>
      </div>
    </section>
  );
}

export default SummaryCards;
