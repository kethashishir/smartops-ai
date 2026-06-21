import { useState } from "react";
import { getForecasts, generateForecasts } from "../api/forecastsApi.js";

function useForecasts({
  getProductName,
  refreshRecommendationsAfterForecasts,
  markAssistantStale,
}) {
  const [forecasts, setForecasts] = useState([]);
  const [loadingForecasts, setLoadingForecasts] = useState(false);
  const [forecastsError, setForecastsError] = useState("");
  const [forecastSuccess, setForecastSuccess] = useState("");

  function reset() {
    setForecasts([]);
    setLoadingForecasts(false);
    setForecastsError("");
    setForecastSuccess("");
  }

  function clearSuccess() {
    setForecastSuccess("");
  }

  async function fetchForecasts() {
    try {
      setLoadingForecasts(true);
      setForecastsError("");

      const data = await getForecasts();

      const sortedForecasts = [...data].sort((a, b) =>
        getProductName(a.product_id).localeCompare(
          getProductName(b.product_id),
        ),
      );

      setForecasts(sortedForecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error.message);
      setForecastsError(error.message || "Could not load forecasts.");
    } finally {
      setLoadingForecasts(false);
    }
  }

  async function refreshForecasts() {
    try {
      setLoadingForecasts(true);
      setForecastsError("");
      setForecastSuccess("");

      await generateForecasts();

      const data = await getForecasts();

      const sortedForecasts = [...data].sort(
        (a, b) => new Date(b.forecast_date) - new Date(a.forecast_date),
      );

      setForecasts(sortedForecasts);

      if (refreshRecommendationsAfterForecasts) {
        await refreshRecommendationsAfterForecasts();
      }

      setForecastSuccess("Forecasts and recommendations updated successfully.");

      if (markAssistantStale) {
        markAssistantStale();
      }
    } catch (error) {
      setForecastSuccess("");
      console.error("Error refreshing forecasts:", error.message);
      setForecastsError(error.message || "Could not refresh forecasts.");
    } finally {
      setLoadingForecasts(false);
    }
  }

  return {
    forecasts,
    loadingForecasts,
    forecastsError,
    forecastSuccess,
    reset,
    clearSuccess,
    fetchForecasts,
    refreshForecasts,
  };
}

export default useForecasts;
