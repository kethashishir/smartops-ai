import SummaryCards from "../components/SummaryCards.jsx";
import AssistantSection from "../components/AssistantSection.jsx";

function DashboardPage({
  productsCount,
  ordersCount,
  forecastsCount,
  recommendationsCount,
  lowStockProductsCount,
  assistant,
}) {
  const healthyProductsCount = Math.max(
    productsCount - lowStockProductsCount,
    0,
  );
  const forecastCoverage =
    productsCount > 0 ? Math.round((forecastsCount / productsCount) * 100) : 0;
  const recommendationCoverage =
    productsCount > 0
      ? Math.round((recommendationsCount / productsCount) * 100)
      : 0;

  return (
    <>
      <section id="dashboard-section" className="dashboard-overview">
        <SummaryCards
          productsCount={productsCount}
          ordersCount={ordersCount}
          forecastsCount={forecastsCount}
          lowStockProductsCount={lowStockProductsCount}
        />

        <section className="analytics-grid" aria-label="Operations analytics">
          <article className="analytics-panel">
            <div>
              <span className="analytics-label">Inventory Health</span>
              <h2>{healthyProductsCount} healthy products</h2>
              <p>
                {lowStockProductsCount > 0
                  ? `${lowStockProductsCount} products are below reorder threshold and need review.`
                  : "All tracked products are currently above their reorder thresholds."}
              </p>
            </div>

            <div className="analytics-bars">
              <div>
                <span>Healthy</span>
                <strong>{healthyProductsCount}</strong>
              </div>
              <div>
                <span>Low Stock</span>
                <strong>{lowStockProductsCount}</strong>
              </div>
            </div>
          </article>

          <article className="analytics-panel">
            <div>
              <span className="analytics-label">AI Readiness</span>
              <h2>{recommendationCoverage}% recommendation coverage</h2>
              <p>
                Forecast and recommendation coverage show how much of the
                workspace is ready for AI-assisted restock decisions.
              </p>
            </div>

            <div className="readiness-list">
              <div>
                <span>Forecast coverage</span>
                <strong>{forecastCoverage}%</strong>
              </div>
              <div>
                <span>Recommendation coverage</span>
                <strong>{recommendationCoverage}%</strong>
              </div>
              <div>
                <span>Orders available</span>
                <strong>{ordersCount}</strong>
              </div>
            </div>
          </article>
        </section>
      </section>

      <AssistantSection
        sectionId="assistant-section"
        assistantQuestion={assistant.question}
        assistantAnswer={assistant.answer}
        assistantHighlights={assistant.highlights}
        assistantActions={assistant.actions}
        assistantHistory={assistant.history}
        assistantStale={assistant.stale}
        assistantError={assistant.error}
        loadingAssistant={assistant.loading}
        onQuestionChange={assistant.handleQuestionChange}
        onAskAssistant={assistant.submitQuestion}
        onRefreshSummary={assistant.refreshSummary}
        onClearAssistant={assistant.clear}
      />
    </>
  );
}

export default DashboardPage;
