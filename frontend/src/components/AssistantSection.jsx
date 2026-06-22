import { useEffect, useMemo, useRef } from "react";

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
  const chatWindowRef = useRef(null);

  const exampleQuestions = [
    "Which products are low stock?",
    "Which products are healthy?",
    "What should I restock?",
    "What changed recently?",
    "Do I need to generate forecasts?",
    "Which product has the highest forecasted demand?",
    "Give me an operations summary.",
  ];

  const orderedHistory = useMemo(
    () => [...assistantHistory].reverse(),
    [assistantHistory],
  );

  const latestMessageId = assistantHistory[0]?.id;
  const hasAssistantResponse = Boolean(assistantAnswer);
  const hasMessages = assistantHistory.length > 0;

  useEffect(() => {
    if (!assistantHistory.length && !loadingAssistant) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });

      document.querySelector(".main-shell")?.scrollTo({
        top: document.querySelector(".main-shell")?.scrollHeight || 0,
        behavior: "smooth",
      });
    });
  }, [assistantHistory, assistantAnswer, loadingAssistant]);

  function handleExampleClick(question) {
    onQuestionChange({
      target: {
        value: question,
      },
    });
  }

  return (
    <section id={sectionId} className="section assistant-section">
      <div className="assistant-chat-centered">
        <div className="assistant-chat-card">
          <div className="assistant-chat-toolbar">
            <div>
              <p className="eyebrow">SmartOps Copilot</p>
              <h2>Operations chat</h2>
            </div>

            <div className="assistant-chat-toolbar-actions">
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
            </div>
          </div>

          {assistantError && <p className="error">{assistantError}</p>}

          {assistantStale && (
            <p className="assistant-stale-note">
              Operational data changed. Ask again or generate a new summary for
              updated guidance.
            </p>
          )}

          <div className="assistant-chat-window" ref={chatWindowRef}>
            <div className="assistant-message assistant-message-system">
              <div className="assistant-avatar">S</div>
              <div className="assistant-bubble">
                <span>SmartOps Copilot</span>
                <p>
                  Ask me about low stock, restock priorities, forecast
                  freshness, recent orders, demand risk, and volatility.
                </p>
              </div>
            </div>

            {!hasMessages && (
              <div className="assistant-empty-chat">
                <h3>Ready when you are.</h3>
                <p>
                  Choose a suggested question or type your own operations
                  question below.
                </p>
              </div>
            )}

            {orderedHistory.map((item) => {
              const isLatestMessage = item.id === latestMessageId;

              return (
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
                    <div
                      className={
                        isLatestMessage
                          ? "assistant-bubble assistant-bubble-active"
                          : "assistant-bubble"
                      }
                    >
                      <span>SmartOps Copilot</span>
                      <p>{item.answer}</p>

                      {isLatestMessage && assistantHighlights.length > 0 && (
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

                      {isLatestMessage && assistantActions.length > 0 && (
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
                </div>
              );
            })}

            {loadingAssistant && (
              <div className="assistant-message assistant-message-system">
                <div className="assistant-avatar">S</div>
                <div className="assistant-bubble">
                  <span>SmartOps Copilot</span>
                  <p>Thinking...</p>
                </div>
              </div>
            )}
          </div>

          <div className="assistant-chat-footer">
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
                placeholder="Ask SmartOps Copilot..."
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
      </div>
    </section>
  );
}

export default AssistantSection;
