import ProductStatusLabel from "./ProductStatusLabel";

function ProductCard({
  product,
  currentStock,
  isLowStock,
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
          disabled={updatingStockProductId === product.id}
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
          ? "Generating..."
          : "Generate Recommendation"}
      </button>
    </div>
  );
}

export default ProductCard;
