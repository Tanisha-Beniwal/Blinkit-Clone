import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';
import '../styles/App.css';

const Home = ({ searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await productAPI.getAll(params);
      setProducts(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="categories-container">
        <div className="categories">
          <button
            onClick={() => setSelectedCategory('')}
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      
      

      

      <div className="products-container">
        <h2 className="products-header">
          {selectedCategory || 'All Products'} ({filteredProducts.length})
        </h2>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No products found</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;