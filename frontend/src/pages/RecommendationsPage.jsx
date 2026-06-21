import RecommendationsSection from "../components/RecommendationsSection.jsx";

function RecommendationsPage({
  productState,
  orderState,
  forecastState,
  recommendationState,
}) {
  return (
    <RecommendationsSection
      sectionId="recommendations-section"
      productsCount={productState.products.length}
      ordersCount={orderState.orders.length}
      forecastsCount={forecastState.forecasts.length}
      loadingRecommendations={recommendationState.loadingRecommendations}
      recommendationsError={recommendationState.recommendationsError}
      recommendationSuccess={recommendationState.recommendationSuccess}
      recommendations={recommendationState.recommendations}
      latestRecommendations={recommendationState.latestRecommendations}
      hasGeneratedRecommendations={
        recommendationState.hasGeneratedRecommendations
      }
      productsError={productState.productsError}
      onGenerateRecommendations={recommendationState.generateRecommendations}
      onRefreshRecommendations={recommendationState.fetchRecommendations}
      getProductName={productState.getProductName}
    />
  );
}

export default RecommendationsPage;
