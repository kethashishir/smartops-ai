function RecommendationsSection({
  sectionId,
  loadingRecommendations,
  recommendationsError,
  recommendationSuccess,
  recommendations,
  latestRecommendations,
  hasGeneratedRecommendations,
  productsError,
  onGenerateRecommendations,
  onRefreshRecommendations,
  getProductName,
}) {
  return (
    <section id={sectionId} className="section">
      <h2>Recommendations</h2>

      <button
        onClick={onGenerateRecommendations}
        disabled={loadingRecommendations}
      >
        {loadingRecommendations ? "Generating..." : "Generate Recommendations"}
      </button>

      <button
        onClick={onRefreshRecommendations}
        disabled={loadingRecommendations}
      >
        Refresh Recommendations
      </button>

      {loadingRecommendations && <p>Loading recommendations...</p>}

      {recommendationsError && <p className="error">{recommendationsError}</p>}

      {recommendationSuccess && (
        <p className="success">{recommendationSuccess}</p>
      )}

      {recommendations.length > 0 && (
        <p className="filter-count">
          Showing {latestRecommendations.length} recommendation statuses
        </p>
      )}

      {hasGeneratedRecommendations &&
        recommendations.length === 0 &&
        !loadingRecommendations &&
        !recommendationsError &&
        !productsError && (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No recommendations generated yet.
          </p>
        )}

      {recommendations.length > 0 && (
        <ul>
          {latestRecommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <div className="card">
                <h2>Product: {getProductName(recommendation.product_id)}</h2>
                <p
                  className={
                    recommendation.recommended_quantity > 0
                      ? "recommendation-label"
                      : "no-restock-label"
                  }
                >
                  {recommendation.recommended_quantity > 0
                    ? "Restock Recommended"
                    : "No Restock Needed"}
                </p>
                <p>
                  Recommended Quantity: {recommendation.recommended_quantity}
                </p>
                <p>Reason: {recommendation.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecommendationsSection;
