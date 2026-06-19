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
  return (
    <div className={`card ${isLowStock ? "low-stock-card" : ""}`}>
      <h2>{product.name}</h2>

      <ProductStatusLabel isLowStock={isLowStock} />

      <p>SKU: {product.sku}</p>
      <p>Category: {product.category}</p>
      <p>Price: ${product.unit_price.toFixed(2)}</p>
      <p>Reorder Threshold: {product.reorder_threshold}</p>
      <p>Current Stock: {currentStock ?? "Loading..."}</p>
      {recommendation && (
        <p
          className={
            recommendation.recommended_quantity > 0
              ? "inline-recommendation restock"
              : "inline-recommendation no-restock"
          }
        >
          Recommendation:{" "}
          {recommendation.recommended_quantity > 0
            ? `Restock ${recommendation.recommended_quantity} units`
            : "No Restock Needed"}
        </p>
      )}
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
  );
}

export default ProductCard;
