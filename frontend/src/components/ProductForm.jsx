function ProductForm({
  newProduct,
  onInputChange,
  onCreateProduct,
  creatingProduct,
}) {
  return (
    <>
      <h3>Create New Product</h3>

      <form className="product-form" onSubmit={onCreateProduct}>
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={newProduct.name}
          onChange={onInputChange}
          required
        />

        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={newProduct.sku}
          onChange={onInputChange}
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={newProduct.category}
          onChange={onInputChange}
          required
        />

        <input
          type="number"
          name="unit_price"
          placeholder="Unit price"
          value={newProduct.unit_price}
          onChange={onInputChange}
          step="0.01"
          min="0"
          required
        />

        <input
          type="number"
          name="reorder_threshold"
          placeholder="Reorder threshold"
          value={newProduct.reorder_threshold}
          onChange={onInputChange}
          min="0"
          required
        />

        <button type="submit" disabled={creatingProduct}>
          {creatingProduct ? "Creating..." : "Create Product"}
        </button>
      </form>
    </>
  );
}

export default ProductForm;
