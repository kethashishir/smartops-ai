import ProductForm from "./ProductForm.jsx";
import ProductControls from "./ProductControls.jsx";
import ProductCard from "./ProductCard.jsx";

function ProductsSection({
  productSuccess,
  productsError,
  loadingProducts,
  newProduct,
  onInputChange,
  onCreateProduct,
  creatingProduct,
  onRefreshProducts,
  productSearch,
  setProductSearch,
  productFilter,
  setProductFilter,
  filteredProducts,
  products,
  sortOption,
  setSortOption,
  sortedProducts,
  isLowStock,
  inventoryByProductId,
  generatingProductId,
  onGenerateRecommendation,
  stockUpdates,
  updatingStockProductId,
  onStockInputChange,
  onUpdateStock,
}) {
  return (
    <section className="section">
      {productSuccess && <p className="success">{productSuccess}</p>}
      {productsError && <p className="error">{productsError}</p>}
      {loadingProducts && <p>Loading products...</p>}

      <ProductForm
        newProduct={newProduct}
        onInputChange={onInputChange}
        onCreateProduct={onCreateProduct}
        creatingProduct={creatingProduct}
      />

      <button onClick={onRefreshProducts} disabled={loadingProducts}>
        {loadingProducts ? "Refreshing..." : "Refresh Products"}
      </button>

      <h2>Products</h2>

      <ProductControls
        productSearch={productSearch}
        setProductSearch={setProductSearch}
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        filteredProductsCount={filteredProducts.length}
        productsCount={products.length}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      {filteredProducts.length === 0 && !loadingProducts && !productsError && (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          No products match this filter.
        </p>
      )}

      {!loadingProducts && !productsError && filteredProducts.length > 0 && (
        <ul>
          {sortedProducts.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                currentStock={inventoryByProductId[product.id]}
                isLowStock={isLowStock(product)}
                generatingProductId={generatingProductId}
                onGenerateRecommendation={onGenerateRecommendation}
                stockUpdateValue={stockUpdates[product.id] ?? ""}
                updatingStockProductId={updatingStockProductId}
                onStockInputChange={onStockInputChange}
                onUpdateStock={onUpdateStock}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProductsSection;
