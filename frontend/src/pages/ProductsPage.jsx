import ProductsSection from "../components/ProductsSection.jsx";

function ProductsPage({ productState, recommendationState }) {
  return (
    <ProductsSection
      sectionId="products-section"
      productSuccess={productState.productSuccess}
      productsError={productState.productsError}
      loadingProducts={productState.loadingProducts}
      newProduct={productState.newProduct}
      onInputChange={productState.handleProductInputChange}
      onCreateProduct={productState.createProduct}
      creatingProduct={productState.creatingProduct}
      onRefreshProducts={productState.fetchProducts}
      loadingDemoData={productState.loadingDemoData}
      onLoadDemoData={productState.loadDemoData}
      productSearch={productState.productSearch}
      setProductSearch={productState.setProductSearch}
      productFilter={productState.productFilter}
      setProductFilter={productState.setProductFilter}
      filteredProducts={productState.filteredProducts}
      products={productState.products}
      sortOption={productState.sortOption}
      setSortOption={productState.setSortOption}
      sortedProducts={productState.sortedProducts}
      isLowStock={productState.isLowStock}
      inventoryByProductId={productState.inventoryByProductId}
      generatingProductId={recommendationState.generatingProductId}
      latestRecommendations={recommendationState.latestRecommendations}
      onGenerateRecommendation={
        recommendationState.generateRecommendationForProduct
      }
      stockUpdates={productState.stockUpdates}
      updatingStockProductId={productState.updatingStockProductId}
      onStockInputChange={productState.handleStockInputChange}
      onUpdateStock={productState.updateProductStock}
      editingProductId={productState.editingProductId}
      productEditForms={productState.productEditForms}
      savingProductId={productState.savingProductId}
      deletingProductId={productState.deletingProductId}
      onStartEditProduct={productState.startEditingProduct}
      onCancelEditProduct={productState.cancelEditingProduct}
      onProductEditInputChange={productState.handleProductEditInputChange}
      onSaveProductChanges={productState.saveProductChanges}
      onDeleteProduct={productState.removeProduct}
    />
  );
}

export default ProductsPage;
