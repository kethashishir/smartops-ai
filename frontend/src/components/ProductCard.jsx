import ProductStatusLabel from "./ProductStatusLabel";

function ProductCard({
  product,
  currentStock,
  isLowStock,
  generatingProductId,
  onGenerateRecommendation,
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
