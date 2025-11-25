import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/App.css';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find(item => item._id === product._id);

  return (
    <div className="product-card">
      <div style={{ 
        width: '100%', 
        height: '150px', 
        overflow: 'hidden', 
        borderRadius: '8px',
        marginBottom: '1rem',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              console.log('Image failed to load:', product.image);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="font-size: 3rem;">📦</div>';
            }}
          />
        ) : (
          <div style={{ fontSize: '3rem' }}>📦</div>
        )}
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-unit">{product.unit}</p>
      <div className="product-price">
        <span className="price-current">₹{product.price}</span>
        {product.discount > 0 && (
          <>
            <span className="price-original">₹{product.originalPrice}</span>
            <span className="price-discount">{product.discount}% OFF</span>
          </>
        )}
      </div>
      {cartItem ? (
        <div className="quantity-controls">
          <button onClick={() => updateQuantity(product._id, -1)} className="quantity-btn">
            <Minus size={16} />
          </button>
          <span style={{ fontWeight: 600 }}>{cartItem.quantity}</span>
          <button onClick={() => updateQuantity(product._id, 1)} className="quantity-btn">
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <button onClick={() => addToCart(product)} className="btn-add-cart">
          ADD
        </button>
      )}
    </div>
  );
};

export default ProductCard;