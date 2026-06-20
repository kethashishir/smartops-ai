import ProductStatusLabel from "./ProductStatusLabel.jsx";

function ProductCard({
  product,
  currentStock,
  isLowStock,
  recommendation,
  generatingProductId,
  onGenerateRecommendation,
  stockUpdateValue,
  updatingStockProductId,
  onStockInputChange,
  onUpdateStock,
}) {
  const stockDisplay = currentStock ?? "Loading...";
  const recommendationText =
    recommendation?.recommended_quantity > 0
      ? `Restock ${recommendation.recommended_quantity} units`
      : "No Restock Needed";

  return (
    <div className={`product-card ${isLowStock ? "low-stock-card" : ""}`}>
      <div className="product-card-header">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </div>

        <ProductStatusLabel isLowStock={isLowStock} />
      </div>

      <div className="product-meta-grid">
        <div>
          <span>SKU</span>
          <p>{product.sku}</p>
        </div>

        <div>
          <span>Price</span>
          <p>${product.unit_price.toFixed(2)}</p>
        </div>

        <div>
          <span>Current Stock</span>
          <p>{stockDisplay}</p>
        </div>

        <div>
          <span>Reorder Threshold</span>
          <p>{product.reorder_threshold}</p>
        </div>
      </div>

      {recommendation && (
        <p
          className={
            recommendation.recommended_quantity > 0
              ? "inline-recommendation restock"
              : "inline-recommendation no-restock"
          }
        >
          Recommendation: {recommendationText}
        </p>
      )}

      <div className="product-card-actions">
        <div className="stock-update">
          <input
            type="number"
            min="0"
            placeholder="New stock"
            value={stockUpdateValue}
            onChange={(event) =>
              onStockInputChange(product.id, event.target.value)
            }
          />

          <button
            onClick={() => onUpdateStock(product.id)}
            disabled={
              updatingStockProductId === product.id || stockUpdateValue === ""
            }
          >
            {updatingStockProductId === product.id
              ? "Updating..."
              : "Update Stock"}
          </button>
        </div>

        <button
          onClick={() => onGenerateRecommendation(product.id)}
          disabled={generatingProductId === product.id}
        >
          {generatingProductId === product.id
            ? "Updating..."
            : "Update Recommendation"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
