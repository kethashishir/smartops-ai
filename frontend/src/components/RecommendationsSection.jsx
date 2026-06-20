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
  const restockRecommendedCount = latestRecommendations.filter(
    (recommendation) => recommendation.recommended_quantity > 0,
  ).length;

  const noRestockNeededCount =
    latestRecommendations.length - restockRecommendedCount;

  const totalRecommendedQuantity = latestRecommendations.reduce(
    (total, recommendation) =>
      total + Number(recommendation.recommended_quantity),
    0,
  );

  return (
    <section id={sectionId} className="section">
      <h2>Recommendations</h2>

      <div className="recommendation-actions">
        <button
          onClick={onGenerateRecommendations}
          disabled={loadingRecommendations}
        >
          {loadingRecommendations
            ? "Generating..."
            : "Generate Recommendations"}
        </button>

        <button
          onClick={onRefreshRecommendations}
          disabled={loadingRecommendations}
        >
          Refresh Recommendations
        </button>
      </div>

      {loadingRecommendations && <p>Loading recommendations...</p>}

      {recommendationsError && <p className="error">{recommendationsError}</p>}

      {recommendationSuccess && (
        <p className="success">{recommendationSuccess}</p>
      )}

      {latestRecommendations.length > 0 && (
        <>
          <div className="recommendation-summary">
            <div>
              <span>{latestRecommendations.length}</span>
              <p>Total Recommendations</p>
            </div>

            <div>
              <span>{restockRecommendedCount}</span>
              <p>Restock Recommended</p>
            </div>

            <div>
              <span>{noRestockNeededCount}</span>
              <p>No Restock Needed</p>
            </div>

            <div>
              <span>{totalRecommendedQuantity}</span>
              <p>Total Units Recommended</p>
            </div>
          </div>

          <p className="filter-count">
            Showing {latestRecommendations.length} recommendation statuses
          </p>
        </>
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
        <ul className="recommendation-list">
          {latestRecommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <div className="recommendation-card">
                <div className="recommendation-card-header">
                  <div>
                    <h3>{getProductName(recommendation.product_id)}</h3>
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
                  </div>

                  <div className="recommendation-quantity">
                    <span>{recommendation.recommended_quantity}</span>
                    <p>units</p>
                  </div>
                </div>

                <p className="recommendation-reason">{recommendation.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecommendationsSection;
