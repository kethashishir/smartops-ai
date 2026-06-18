function ProductStatusLabel({ isLowStock }) {
  if (isLowStock) {
    return <p className="low-stock-label">Low Stock</p>;
  }

  return <p className="healthy-stock-label">Healthy Stock</p>;
}

export default ProductStatusLabel;
