import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {

  const [products, setProducts] = useState([]);

  async function fetchProducts() {
    try {
      console.log("Fetching products...");
      const response = await fetch("http://127.0.0.1:8000/products/");
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      console.log("Products fetched:", data);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);


  return (
    <div>
      <h1>SmartOps Frontend</h1>
      <p>Products Page</p>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.id}</h2>
            <h2>{product.sku}</h2>
            <h2>{product.name}</h2>
            <h2>{product.category}</h2>
            <h2>{product.unit_price}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
