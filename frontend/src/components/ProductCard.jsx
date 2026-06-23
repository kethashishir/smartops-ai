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
  isEditing,
  editForm,
  savingProductId,
  deletingProductId,
  onStartEdit,
  onCancelEdit,
  onEditInputChange,
  onSaveEdit,
  onDeleteProduct,
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
          {isEditing ? (
            <div className="product-edit-stack">
              <input
                type="text"
                value={editForm?.name || ""}
                onChange={(event) =>
                  onEditInputChange(product.id, "name", event.target.value)
                }
                aria-label="Product name"
              />
              <input
                type="text"
                value={editForm?.category || ""}
                onChange={(event) =>
                  onEditInputChange(product.id, "category", event.target.value)
                }
                aria-label="Product category"
              />
            </div>
          ) : (
            <>
              <h3>{product.name}</h3>
              <p>{product.category}</p>
            </>
          )}
        </div>

        <ProductStatusLabel isLowStock={isLowStock} />
      </div>

      {isEditing ? (
        <div className="product-edit-grid">
          <label>
            Unit Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={editForm?.unit_price || ""}
              onChange={(event) =>
                onEditInputChange(product.id, "unit_price", event.target.value)
              }
            />
          </label>

          <label>
            Reorder Threshold
            <input
              type="number"
              min="0"
              value={editForm?.reorder_threshold || ""}
              onChange={(event) =>
                onEditInputChange(
                  product.id,
                  "reorder_threshold",
                  event.target.value,
                )
              }
            />
          </label>

          <div>
            <span>SKU</span>
            <p>{product.sku}</p>
          </div>

          <div>
            <span>Current Stock</span>
            <p>{stockDisplay}</p>
          </div>
        </div>
      ) : (
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
      )}

      {recommendation && !isEditing && (
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
        {isEditing ? (
          <div className="product-edit-actions">
            <button
              type="button"
              onClick={() => onSaveEdit(product.id)}
              disabled={savingProductId === product.id}
            >
              {savingProductId === product.id ? "Saving..." : "Save Changes"}
            </button>

            <button type="button" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          <>
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
                  updatingStockProductId === product.id ||
                  stockUpdateValue === ""
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

            <div className="product-manage-actions">
              <button type="button" onClick={() => onStartEdit(product)}>
                Edit
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() => onDeleteProduct(product.id)}
                disabled={deletingProductId === product.id}
              >
                {deletingProductId === product.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
