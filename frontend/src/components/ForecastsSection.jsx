function ForecastsSection({
  sectionId,
  productsCount,
  ordersCount,
  forecasts,
  forecastsError,
  forecastSuccess,
  loadingForecasts,
  onRefreshForecasts,
  getProductName,
}) {
  const totalPredictedDemand = forecasts.reduce(
    (total, forecast) => total + Number(forecast.predicted_demand),
    0,
  );

  const modelVersions = [
    ...new Set(forecasts.map((forecast) => forecast.model_version)),
  ];

  const hasProducts = productsCount > 0;
  const hasOrders = ordersCount > 0;
  const hasForecasts = forecasts.length > 0;
  const canGenerateForecasts = hasProducts && !loadingForecasts;

  return (
    <section id={sectionId} className="section">
      <div className="forecasts-header">
        <div>
          <h2>Forecasts</h2>
          <p className="section-description">
            View predicted demand data used by the recommendation engine.
          </p>
        </div>

        <button onClick={onRefreshForecasts} disabled={!canGenerateForecasts}>
          {loadingForecasts ? "Generating..." : "Generate Forecasts"}
        </button>
      </div>

      {forecastsError && <p className="error">{forecastsError}</p>}
      {forecastSuccess && <p className="success">{forecastSuccess}</p>}
      {loadingForecasts && <p>Loading forecasts...</p>}

      {!hasProducts && !loadingForecasts && !forecastsError && (
        <p className="empty-state">
          Add products first before generating forecasts. Forecasts are created
          for your product catalog.
        </p>
      )}

      {hasProducts && !hasOrders && !hasForecasts && !loadingForecasts && (
        <p className="empty-state">
          Products are ready. Create orders next to build demand history, then
          generate forecasts for stronger demand estimates.
        </p>
      )}

      {hasProducts && hasOrders && !hasForecasts && !loadingForecasts && (
        <p className="empty-state">
          No forecasts yet. Generate forecasts now to estimate future demand
          from your products and order history.
        </p>
      )}

      {hasForecasts && (
        <>
          <div className="forecast-summary">
            <div>
              <span>{forecasts.length}</span>
              <p>Forecasted Products</p>
            </div>

            <div>
              <span>{totalPredictedDemand.toFixed(2)}</span>
              <p>Total Predicted Demand</p>
            </div>

            <div>
              <span>{modelVersions.join(", ")}</span>
              <p>Model Version</p>
            </div>
          </div>

          <div className="forecast-grid">
            {forecasts.map((forecast) => (
              <div key={forecast.id} className="forecast-card">
                <div>
                  <h3>
                    {forecast.product_name ||
                      getProductName(forecast.product_id)}
                  </h3>
                  <p>Forecast Date: {forecast.forecast_date}</p>
                  <p>Model: {forecast.model_version}</p>

                  {forecast.volatility_level && (
                    <p
                      className={`volatility-badge volatility-badge-${forecast.volatility_level
                        .replaceAll(" ", "-")
                        .toLowerCase()}`}
                    >
                      {forecast.volatility_level} volatility
                      {forecast.volatility_score !== null &&
                        forecast.volatility_score !== undefined &&
                        ` · ${forecast.volatility_score}`}
                    </p>
                  )}

                  {forecast.explanation && (
                    <p className="forecast-explanation">
                      {forecast.explanation}
                    </p>
                  )}
                </div>

                <div className="forecast-demand">
                  <span>{forecast.predicted_demand}</span>
                  <p>Predicted Demand</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default ForecastsSection;
