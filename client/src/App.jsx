import React from 'react';
import ProductList from './ProductList';
import AskQuery from './AskQuery';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Product Discovery with AI Assist</h1>
        <p>Find your perfect product with AI-powered recommendations</p>
      </header>
      
      <main>
        <AskQuery />
        <ProductList />
      </main>
    </div>
  );
}

export default App;