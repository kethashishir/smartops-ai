import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const products = [
    {
      id: 1,
      name: 'Laptop'
    },
    {
      id: 2,
      name: 'Mouse'
    },
    {
      id: 3,
      name: 'Keyboard'
    }
  ];

  return (
    <div>
      <h1>SmartOps Frontend</h1>
      <p>Products Page</p>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
