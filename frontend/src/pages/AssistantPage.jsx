import AssistantSection from "../components/AssistantSection.jsx";

function AssistantPage({ assistant }) {
  return (
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
  );
}

export default AssistantPage;
