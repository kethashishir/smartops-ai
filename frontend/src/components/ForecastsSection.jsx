function ForecastsSection({
  sectionId,
  forecasts,
  forecastsError,
  loadingForecasts,
  onRefreshForecasts,
  getProductName,
}) {
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
          {loadingForecasts ? "Refreshing..." : "Refresh Forecasts"}
        </button>
      </div>

      {forecastsError && <p className="error">{forecastsError}</p>}
      {loadingForecasts && <p>Loading forecasts...</p>}

      {forecasts.length === 0 && !loadingForecasts && !forecastsError && (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          No forecast data available yet.
        </p>
      )}

      {forecasts.length > 0 && (
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
      )}
    </section>
  );
}

export default ForecastsSection;
