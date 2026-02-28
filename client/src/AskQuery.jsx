import React, { useState } from 'react';
import axios from 'axios';
import './styles/AskQuery.css';

const AskQuery = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exampleQueries = [
    "Show me laptops under $2000",
    "Best headphones for music",
    "Gaming products",
    "Smartwatches with health tracking",
    "Affordable electronics under $500"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axios.post('https://discvrai-assessment-1.onrender.com/api/ask', {
        query: query
      });
      
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get response');
      console.error('Error asking query:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="ask-query">
      <h2>Ask About Products</h2>
      
      <form className="ask-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., Show me laptops under $2000"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      <div className="example-queries">
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            className="example-button"
            onClick={() => handleExampleClick(example)}
            disabled={loading}
          >
            {example}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Processing your query...</div>}

      {response && (
        <div className="response">
          <h3>AI Response:</h3>
          <p className="answer">{response.answer}</p>
          
          {response.products && response.products.length > 0 ? (
            <div className="recommended-products">
              <h4>Recommended Products:</h4>
              <div className="products-mini-grid">
                {response.products.map(product => (
                  <div key={product.id} className="mini-product-card">
                    <h5>{product.name}</h5>
                    <p className="price">${product.price.toFixed(2)}</p>
                    <p className="category">{product.category}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-products">No specific products matched your query.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AskQuery;