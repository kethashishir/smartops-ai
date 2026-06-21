function AssistantSection({
  sectionId,
  assistantQuestion,
  assistantAnswer,
  assistantActions,
  assistantError,
  loadingAssistant,
  onQuestionChange,
  onAskAssistant,
  onRefreshSummary,
}) {
  return (
    <section id={sectionId} className="section">
      <div className="assistant-header">
        <div>
          <h2>SmartOps Assistant</h2>
          <p className="section-description">
            Ask operational questions based on your products, inventory, orders,
            forecasts, and recommendations.
          </p>
        </div>

        <button onClick={onRefreshSummary} disabled={loadingAssistant}>
          {loadingAssistant ? "Refreshing..." : "Refresh Summary"}
        </button>
      </div>

      {assistantError && <p className="error">{assistantError}</p>}
      {loadingAssistant && <p>Assistant is thinking...</p>}

      <form className="assistant-form" onSubmit={onAskAssistant}>
        <label>
          Ask a question
          <input
            type="text"
            placeholder="Example: What should I restock?"
            value={assistantQuestion}
            onChange={onQuestionChange}
          />
        </label>

        <button
          type="submit"
          disabled={loadingAssistant || !assistantQuestion.trim()}
        >
          Ask Assistant
        </button>
      </form>

      <div className="assistant-card">
        <h3>Assistant Answer</h3>

        {assistantAnswer ? (
          <p>{assistantAnswer}</p>
        ) : (
          <p className="empty-state">
            Ask a question or refresh the summary to get operational guidance.
          </p>
        )}

        {assistantActions.length > 0 && (
          <div className="assistant-actions">
            <h4>Suggested actions</h4>
            <ul>
              {assistantActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="assistant-examples">
        <h4>Try asking</h4>
        <ul>
          <li>Which products are low stock?</li>
          <li>What should I restock?</li>
          <li>Which product has the highest forecasted demand?</li>
          <li>Give me an operations summary.</li>
        </ul>
      </div>
    </section>
  );
}

export default AssistantSection;
