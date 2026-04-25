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
      description: 'A high-performance laptop for all your computing needs.'
    },
    {
      id: 2,
      name: 'Mouse'
      description: 'A wireless mouse with ergonomic design and long battery life.'
    },
    {
      id: 3,
      name: 'Keyboard'
      description: 'A mechanical keyboard with customizable RGB lighting and tactile feedback.'
    }
  ];

  return (
    <div>
      <h1>SmartOps Frontend</h1>
      <p>Products Page</p>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
