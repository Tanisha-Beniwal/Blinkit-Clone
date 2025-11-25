import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/App.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getTotalAmount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">My Cart (0 items)</h2>
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <p style={{ color: '#666', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Your cart is empty</p>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1rem' }}>Add items to get started!</p>
          <button onClick={() => navigate('/')} className="btn-checkout">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">My Cart ({cart.length} items)</h2>

      <div className="cart-items">
        {cart.map(item => (
          <div key={item._id} className="cart-item">
            
            {/* FIXED IMAGE DISPLAY */}
            <div className="cart-item-image">
              <img src={item.image} alt={item.name} />
            </div>

            <div className="cart-item-details">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-unit">{item.unit}</p>
              <p className="cart-item-price">₹{item.price} × {item.quantity}</p>
            </div>

            <div className="cart-item-controls">
              <button onClick={() => updateQuantity(item._id, -1)} className="cart-item-btn">
                <Minus size={16} />
              </button>
              <span className="cart-item-quantity">{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, 1)} className="cart-item-btn">
                <Plus size={16} />
              </button>
            </div>

            <button onClick={() => removeFromCart(item._id)} className="cart-remove-btn">
              <X size={20} />
            </button>

          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Item Total:</span>
          <span>₹{getTotalAmount()}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee:</span>
          <span style={{ color: '#16a34a' }}>FREE</span>
        </div>
        <div className="summary-total">
          <span className="summary-total-label">Grand Total:</span>
          <span className="summary-total-amount">₹{getTotalAmount()}</span>
        </div>

        {/* FIXED BUTTON → NAVIGATE TO CHECKOUT */}
        <button 
          className="btn-checkout"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </button>

      </div>
    </div>
  );
};

export default Cart;
