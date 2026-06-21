import { useState } from "react";
import { askAssistant, getAssistantSummary } from "../api/assistantApi.js";

function createAssistantHistoryItem(question, data) {
  return {
    id: crypto.randomUUID(),
    question,
    answer: data.answer,
    highlights: data.highlights || [],
    suggestedActions: data.suggested_actions || [],
  };
}

function useAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [actions, setActions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [stale, setStale] = useState(false);
  const [history, setHistory] = useState([]);

  function reset() {
    setQuestion("");
    setAnswer("");
    setActions([]);
    setError("");
    setHighlights([]);
    setStale(false);
    setHistory([]);
  }

  function handleQuestionChange(event) {
    setQuestion(event.target.value);
    setError("");
  }

  async function refreshSummary() {
    try {
      setLoading(true);
      setError("");
      setStale(false);

      const data = await getAssistantSummary();

      setAnswer(data.answer);
      setActions(data.suggested_actions || []);
      setHighlights(data.highlights || []);

      setHistory((currentHistory) =>
        [
          createAssistantHistoryItem("Generate Summary", data),
          ...currentHistory,
        ].slice(0, 5),
      );
    } catch (caughtError) {
      console.error("Error loading assistant summary:", caughtError.message);
      setError(caughtError.message || "Could not load assistant summary.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuestion(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const cleanedQuestion = question.trim();
      const data = await askAssistant(cleanedQuestion);

      setQuestion(cleanedQuestion);
      setAnswer(data.answer);
      setActions(data.suggested_actions || []);
      setHighlights(data.highlights || []);
      setStale(false);

      setHistory((currentHistory) =>
        [
          createAssistantHistoryItem(cleanedQuestion, data),
          ...currentHistory,
        ].slice(0, 5),
      );
    } catch (caughtError) {
      console.error("Error asking assistant:", caughtError.message);
      setError(caughtError.message || "Could not ask assistant.");
    } finally {
      setLoading(false);
    }
  }

  function markStale() {
    if (answer) {
      setStale(true);
    }
  }

  return {
    question,
    answer,
    actions,
    error,
    loading,
    highlights,
    stale,
    history,
    reset,
    handleQuestionChange,
    refreshSummary,
    submitQuestion,
    markStale,
    clear: reset,
  };
}

export default useAssistant;
