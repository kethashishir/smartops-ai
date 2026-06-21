import { useMemo, useState } from "react";
import {
  getRecommendations,
  generateAllRecommendations,
  generateRecommendation,
} from "../api/recommendationsApi.js";

function useRecommendations({ products, onDataChanged }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] =
    useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [recommendationSuccess, setRecommendationSuccess] = useState("");
  const [generatingProductId, setGeneratingProductId] = useState(null);

  const latestRecommendations = useMemo(
    () =>
      Object.values(
        recommendations.reduce((acc, recommendation) => {
          acc[recommendation.product_id] = recommendation;
          return acc;
        }, {}),
      ),
    [recommendations],
  );

  function reset() {
    setRecommendations([]);
    setLoadingRecommendations(false);
    setHasGeneratedRecommendations(false);
    setRecommendationsError("");
    setRecommendationSuccess("");
    setGeneratingProductId(null);
  }

  function clearFeedback() {
    setRecommendationsError("");
    setRecommendationSuccess("");
  }

  async function fetchRecommendations() {
    try {
      setRecommendationsError("");

      const data = await getRecommendations();

      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error.message);
      setRecommendationsError(
        "Could not load recommendations. Please check the backend.",
      );
    }
  }

  async function refreshAfterForecasts() {
    await generateAllRecommendations();
    await fetchRecommendations();

    if (onDataChanged) {
      onDataChanged();
    }
  }

  async function generateRecommendations() {
    try {
      setRecommendationSuccess("");
      setRecommendationsError("");
      setLoadingRecommendations(true);

      await generateAllRecommendations();
      await fetchRecommendations();

      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error("Error generating recommendations:", error.message);
      setRecommendationsError(
        "Could not generate recommendations. Some products may be missing forecast or inventory data.",
      );
    } finally {
      setLoadingRecommendations(false);
      setHasGeneratedRecommendations(true);
    }
  }

  async function generateRecommendationForProduct(productId) {
    try {
      setGeneratingProductId(productId);
      setRecommendationSuccess("");
      setRecommendationsError("");
      setLoadingRecommendations(true);

      await generateRecommendation(productId);
      await fetchRecommendations();

      const product = products.find((item) => item.id === productId);

      setRecommendationSuccess(
        `Updated recommendation for ${product?.name || "selected product"}.`,
      );

      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error(
        "Error generating recommendation for product:",
        error.message,
      );
      setRecommendationsError(
        "Could not generate recommendation. This product may be missing forecast or inventory data.",
      );
    } finally {
      setGeneratingProductId(null);
      setLoadingRecommendations(false);
      setHasGeneratedRecommendations(true);
    }
  }

  return {
    recommendations,
    loadingRecommendations,
    hasGeneratedRecommendations,
    recommendationsError,
    recommendationSuccess,
    generatingProductId,
    latestRecommendations,
    reset,
    clearFeedback,
    fetchRecommendations,
    refreshAfterForecasts,
    generateRecommendations,
    generateRecommendationForProduct,
  };
}

export default useRecommendations;
