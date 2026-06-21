import ForecastsSection from "../components/ForecastsSection.jsx";

function ForecastsPage({ productState, orderState, forecastState }) {
  return (
    <ForecastsSection
      sectionId="forecasts-section"
      productsCount={productState.products.length}
      ordersCount={orderState.orders.length}
      forecasts={forecastState.forecasts}
      forecastsError={forecastState.forecastsError}
      forecastSuccess={forecastState.forecastSuccess}
      loadingForecasts={forecastState.loadingForecasts}
      onRefreshForecasts={forecastState.refreshForecasts}
      getProductName={productState.getProductName}
    />
  );
}

export default ForecastsPage;
