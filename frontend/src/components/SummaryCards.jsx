function SummaryCards({
  productsCount,
  ordersCount,
  forecastsCount,
  lowStockProductsCount,
}) {
  const healthyProductsCount = Math.max(
    productsCount - lowStockProductsCount,
    0,
  );
  const lowStockRate =
    productsCount > 0
      ? Math.round((lowStockProductsCount / productsCount) * 100)
      : 0;
  const forecastCoverage =
    productsCount > 0 ? Math.round((forecastsCount / productsCount) * 100) : 0;

  const cards = [
    {
      label: "Total Products",
      value: productsCount,
      description: "Products tracked in this workspace",
      insight: `${healthyProductsCount} currently above reorder threshold`,
      tone: "neutral",
    },
    {
      label: "Orders",
      value: ordersCount,
      description: "Orders processed from this account",
      insight:
        ordersCount > 0
          ? "Order activity is available for forecasting"
          : "Load demo data or create orders to start demand tracking",
      tone: "neutral",
    },
    {
      label: "Forecast Coverage",
      value: `${forecastCoverage}%`,
      description: "Products with generated demand forecasts",
      insight:
        forecastCoverage >= 100
          ? "Forecasts are available for all tracked products"
          : "Generate forecasts after adding products and orders",
      tone: forecastCoverage >= 100 ? "success" : "warning",
    },
    {
      label: "Low Stock Risk",
      value: `${lowStockRate}%`,
      description: "Share of products needing attention",
      insight:
        lowStockProductsCount > 0
          ? `${lowStockProductsCount} product(s) should be reviewed`
          : "No low-stock products detected",
      tone: lowStockProductsCount > 0 ? "danger" : "success",
    },
  ];

  return (
    <section className="summary" aria-label="Operations snapshot">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`summary-card summary-card-${card.tone}`}
        >
          <div className="summary-card-header">
            <div>
              <h3>{card.label}</h3>
              <span>{card.description}</span>
            </div>
          </div>

          <p>{card.value}</p>

          <small>{card.insight}</small>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
