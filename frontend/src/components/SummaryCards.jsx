function SummaryCards({
  productsCount,
  ordersCount,
  forecastsCount,
  lowStockProductsCount,
}) {
  const cards = [
    {
      label: "Total Products",
      value: productsCount,
      description: "Products tracked",
    },
    {
      label: "Orders",
      value: ordersCount,
      description: "Orders processed",
    },
    {
      label: "Forecasts",
      value: forecastsCount,
      description: "Latest demand forecasts",
    },
    {
      label: "Low Stock Products",
      value: lowStockProductsCount,
      description: "Items needing attention",
    },
  ];

  return (
    <section className="summary">
      {cards.map((card) => (
        <div key={card.label} className="summary-card">
          <div>
            <h3>{card.label}</h3>
            <span>{card.description}</span>
          </div>

          <p>{card.value}</p>
        </div>
      ))}
    </section>
  );
}

export default SummaryCards;
