function ForecastsSection({
  sectionId,
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

  const hasForecasts = forecasts.length > 0;

  return (
    <section id={sectionId} className="section">
      <div className="forecasts-header">
        <div>
          <h2>Forecasts</h2>
          <p className="section-description">
            View predicted demand data used by the recommendation engine.
          </p>
        </div>

        <button onClick={onRefreshForecasts} disabled={loadingForecasts}>
          {loadingForecasts ? "Generating..." : "Generate Forecasts"}
        </button>
      </div>

      {forecastsError && <p className="error">{forecastsError}</p>}
      {forecastSuccess && <p className="success">{forecastSuccess}</p>}
      {loadingForecasts && <p>Loading forecasts...</p>}

      {!hasForecasts && !loadingForecasts && !forecastsError && (
        <p className="empty-state">
          No forecasts yet. Generate forecasts after creating products and
          orders so SmartOps AI can estimate future demand.
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
                  <h3>{getProductName(forecast.product_id)}</h3>
                  <p>Forecast Date: {forecast.forecast_date}</p>
                  <p>Model: {forecast.model_version}</p>
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
