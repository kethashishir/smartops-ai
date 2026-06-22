import { useEffect, useState } from "react";
import { askAssistant, getAssistantSummary } from "../api/assistantApi.js";

const ASSISTANT_STORAGE_KEY = "smartops-assistant-session";

function createAssistantHistoryItem(question, data) {
  return {
    id: crypto.randomUUID(),
    question,
    answer: data.answer,
    highlights: data.highlights || [],
    suggestedActions: data.suggested_actions || [],
  };
}

function loadStoredAssistantSession() {
  try {
    const storedSession = localStorage.getItem(ASSISTANT_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    return JSON.parse(storedSession);
  } catch (error) {
    console.error("Could not load assistant session:", error.message);
    return null;
  }
}

function useAssistant() {
  const storedSession = loadStoredAssistantSession();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(storedSession?.answer || "");
  const [actions, setActions] = useState(storedSession?.actions || []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState(storedSession?.highlights || []);
  const [stale, setStale] = useState(storedSession?.stale || false);
  const [history, setHistory] = useState(storedSession?.history || []);

  useEffect(() => {
    const session = {
      answer,
      actions,
      highlights,
      stale,
      history,
    };

    localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(session));
  }, [answer, actions, highlights, stale, history]);

  function reset() {
    setQuestion("");
    setAnswer("");
    setActions([]);
    setError("");
    setHighlights([]);
    setStale(false);
    setHistory([]);
    localStorage.removeItem(ASSISTANT_STORAGE_KEY);
  }

  function clearRuntimeState() {
    setQuestion("");
    setError("");
    setLoading(false);
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
        ].slice(0, 8),
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

    const cleanedQuestion = question.trim();

    if (!cleanedQuestion) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await askAssistant(cleanedQuestion);

      setQuestion("");
      setAnswer(data.answer);
      setActions(data.suggested_actions || []);
      setHighlights(data.highlights || []);
      setStale(false);

      setHistory((currentHistory) =>
        [
          createAssistantHistoryItem(cleanedQuestion, data),
          ...currentHistory,
        ].slice(0, 8),
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
    clearRuntimeState,
    handleQuestionChange,
    refreshSummary,
    submitQuestion,
    markStale,
    clear: reset,
  };
}

export default useAssistant;
