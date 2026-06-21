function AssistantSection({
  sectionId,
  assistantQuestion,
  assistantAnswer,
  assistantHighlights,
  assistantActions,
  assistantError,
  loadingAssistant,
  onQuestionChange,
  onAskAssistant,
  onRefreshSummary,
}) {
  const exampleQuestions = [
    "Which products are low stock?",
    "What should I restock?",
    "Which product has the highest forecasted demand?",
    "Give me an operations summary.",
  ];

  function handleExampleClick(question) {
    onQuestionChange({
      target: {
        value: question,
      },
    });
  }

  return (
    <section id={sectionId} className="section assistant-section">
      <div className="assistant-top">
        <div>
          <p className="eyebrow">SmartOps Copilot</p>
          <h2>Ask your operations assistant</h2>
          <p className="section-description">
            Get quick answers from your products, inventory, orders, forecasts,
            and recommendations.
          </p>
        </div>

        <button
          className="secondary-action"
          onClick={onRefreshSummary}
          disabled={loadingAssistant}
        >
          {loadingAssistant ? "Loading..." : "Generate Summary"}
        </button>
      </div>

      {assistantError && <p className="error">{assistantError}</p>}

      <form className="assistant-prompt" onSubmit={onAskAssistant}>
        <input
          type="text"
          placeholder="Ask something like: What should I restock?"
          value={assistantQuestion}
          onChange={onQuestionChange}
        />

        <button
          type="submit"
          disabled={loadingAssistant || !assistantQuestion.trim()}
        >
          {loadingAssistant ? "Thinking..." : "Ask"}
        </button>
      </form>

      <div className="assistant-examples">
        {exampleQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => handleExampleClick(question)}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="assistant-response-card">
        {assistantAnswer ? (
          <>
            <div className="assistant-response-header">
              <span>Answer</span>
              <small>Based on your current workspace data</small>
            </div>

            <p className="assistant-answer-text">{assistantAnswer}</p>

            {assistantHighlights.length > 0 && (
              <div className="assistant-highlights">
                <h4>Key details</h4>

                <div className="assistant-highlight-grid">
                  {assistantHighlights.map((highlight) => (
                    <div className="assistant-highlight-card" key={highlight}>
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assistantActions.length > 0 && (
              <div className="assistant-actions">
                <h4>Suggested next steps</h4>

                <ul>
                  {assistantActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="assistant-empty">
            <h3>Ready when you are.</h3>
            <p>
              Ask a question or generate a summary to get operational guidance.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AssistantSection;
