function ProductControls({
  productSearch,
  setProductSearch,
  productFilter,
  setProductFilter,
  filteredProductsCount,
  productsCount,
  sortOption,
  setSortOption,
}) {
  return (
    <div className="product-controls">
      <input
        className="search-input"
        type="text"
        placeholder="Search products by name, SKU, or category..."
        value={productSearch}
        onChange={(event) => setProductSearch(event.target.value)}
      />

      <div className="product-toolbar">
        <div className="filter-buttons">
          <button
            className={productFilter === "all" ? "active-filter" : ""}
            onClick={() => setProductFilter("all")}
          >
            All
          </button>

          <button
            className={productFilter === "low" ? "active-filter" : ""}
            onClick={() => setProductFilter("low")}
          >
            Low Stock
          </button>

          <button
            className={productFilter === "healthy" ? "active-filter" : ""}
            onClick={() => setProductFilter("healthy")}
          >
            Healthy
          </button>
        </div>

        <div className="sort-control">
          <label htmlFor="sort-products">Sort</label>

          <select
            id="sort-products"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock-low">Stock: Low to High</option>
          </select>
        </div>
      </div>

      <p className="filter-count">
        Showing {filteredProductsCount} of {productsCount} products
      </p>
    </div>
  );
}

export default ProductControls;
