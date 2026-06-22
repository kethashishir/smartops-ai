function AssistantSection({
  sectionId,
  assistantQuestion,
  assistantAnswer,
  assistantHighlights,
  assistantActions,
  assistantHistory,
  assistantStale,
  assistantError,
  loadingAssistant,
  onQuestionChange,
  onAskAssistant,
  onRefreshSummary,
  onClearAssistant,
}) {
  const exampleQuestions = [
    "Which products are low stock?",
    "Which products are healthy?",
    "What should I restock?",
    "What changed recently?",
    "Do I need to generate forecasts?",
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

  const hasAssistantResponse = Boolean(assistantAnswer);

  return (
    <section id={sectionId} className="section assistant-section">
      <div className="assistant-chat-shell">
        <aside className="assistant-sidebar-card">
          <p className="eyebrow">SmartOps Copilot</p>
          <h2>Operations chat</h2>
          <p>
            Ask questions about inventory health, restock priorities, forecast
            freshness, recent orders, and demand planning.
          </p>

          <button
            className="secondary-action"
            onClick={onRefreshSummary}
            disabled={loadingAssistant}
          >
            {loadingAssistant ? "Loading..." : "Generate Summary"}
          </button>

          {hasAssistantResponse && (
            <button
              className="assistant-clear-button"
              type="button"
              onClick={onClearAssistant}
            >
              Clear Chat
            </button>
          )}
        </aside>

        <div className="assistant-chat-panel">
          {assistantError && <p className="error">{assistantError}</p>}

          {assistantStale && (
            <p className="assistant-stale-note">
              Operational data changed. Ask again or generate a new summary for
              updated guidance.
            </p>
          )}

          <div className="assistant-chat-window">
            <div className="assistant-message assistant-message-system">
              <div className="assistant-avatar">S</div>
              <div className="assistant-bubble">
                <span>SmartOps Copilot</span>
                <p>
                  I can help interpret your products, inventory, orders,
                  forecasts, recommendations, risk scores, and volatility
                  signals.
                </p>
              </div>
            </div>

            {assistantHistory.slice(1).map((item) => (
              <div className="assistant-thread" key={item.id}>
                <div className="assistant-message assistant-message-user">
                  <div className="assistant-avatar assistant-avatar-user">
                    U
                  </div>
                  <div className="assistant-bubble">
                    <span>You</span>
                    <p>{item.question}</p>
                  </div>
                </div>

                <div className="assistant-message assistant-message-system">
                  <div className="assistant-avatar">S</div>
                  <div className="assistant-bubble">
                    <span>SmartOps Copilot</span>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}

            {hasAssistantResponse ? (
              <div className="assistant-message assistant-message-system">
                <div className="assistant-avatar">S</div>
                <div className="assistant-bubble assistant-bubble-active">
                  <span>SmartOps Copilot</span>
                  <p className="assistant-answer-text">{assistantAnswer}</p>

                  {assistantHighlights.length > 0 && (
                    <div className="assistant-highlights">
                      <h4>Key details</h4>

                      <div className="assistant-highlight-grid">
                        {assistantHighlights.map((highlight) => (
                          <div
                            className="assistant-highlight-card"
                            key={highlight}
                          >
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
                </div>
              </div>
            ) : (
              <div className="assistant-empty-chat">
                <h3>Ready when you are.</h3>
                <p>
                  Choose a suggested question or type your own operations
                  question below.
                </p>
              </div>
            )}
          </div>

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

          <form
            className="assistant-prompt assistant-chat-input"
            onSubmit={onAskAssistant}
          >
            <input
              type="text"
              placeholder="Ask SmartOps Copilot about inventory, forecasts, or recommendations..."
              value={assistantQuestion}
              onChange={onQuestionChange}
            />

            <button
              type="submit"
              disabled={loadingAssistant || !assistantQuestion.trim()}
            >
              {loadingAssistant ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AssistantSection;
