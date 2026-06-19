import ProductForm from "./ProductForm.jsx";
import ProductControls from "./ProductControls.jsx";
import ProductCard from "./ProductCard.jsx";

function ProductsSection({
  sectionId,
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
  latestRecommendations,
  onGenerateRecommendation,
  stockUpdates,
  updatingStockProductId,
  onStockInputChange,
  onUpdateStock,
}) {
  return (
    <section id={sectionId} className="section">
      {productSuccess && <p className="success">{productSuccess}</p>}
      {productsError && <p className="error">{productsError}</p>}
      {loadingProducts && <p>Loading products...</p>}

      <div className="products-layout">
        <div className="products-form-panel">
          <ProductForm
            newProduct={newProduct}
            onInputChange={onInputChange}
            onCreateProduct={onCreateProduct}
            creatingProduct={creatingProduct}
          />
        </div>

        <div className="products-list-panel">
          <div className="products-list-header">
            <div>
              <h2>Products</h2>
              <p className="section-description">
                Search, filter, update stock, and refresh product
                recommendations.
              </p>
            </div>

            <button onClick={onRefreshProducts} disabled={loadingProducts}>
              {loadingProducts ? "Refreshing..." : "Refresh Products"}
            </button>
          </div>

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

          {filteredProducts.length === 0 &&
            !loadingProducts &&
            !productsError && (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                No products match this filter.
              </p>
            )}

          {!loadingProducts &&
            !productsError &&
            filteredProducts.length > 0 && (
              <ul>
                {sortedProducts.map((product) => {
                  const productRecommendation = latestRecommendations.find(
                    (recommendation) =>
                      recommendation.product_id === product.id,
                  );

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currentStock={inventoryByProductId[product.id]}
                      isLowStock={isLowStock(product)}
                      recommendation={productRecommendation}
                      generatingProductId={generatingProductId}
                      onGenerateRecommendation={onGenerateRecommendation}
                      stockUpdateValue={stockUpdates[product.id] || ""}
                      updatingStockProductId={updatingStockProductId}
                      onStockInputChange={onStockInputChange}
                      onUpdateStock={onUpdateStock}
                    />
                  );
                })}
              </ul>
            )}
        </div>
      </div>
    </section>
  );
}

export default ProductsSection;
