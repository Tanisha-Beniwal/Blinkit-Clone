import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/App.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();

  return (
    <nav className="bottom-nav">
      
      {/* HOME */}
      <button
        onClick={() => navigate('/')}
        className={`bottom-nav-btn ${location.pathname === '/' ? 'active' : ''}`}
      >
        <Home size={24} />
        <span>Home</span>
      </button>

      {/* CART */}
      <button
        onClick={() => navigate('/cart')}
        className={`bottom-nav-btn ${location.pathname === '/cart' ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <ShoppingCart size={24} />
        <span>Cart</span>

        {cart.length > 0 && (
          <span className="cart-badge">
            {cart.length}
          </span>
        )}
      </button>

      {/* ⭐ ORDERS BUTTON (NEW) */}
      <button
        onClick={() => navigate('/orders')}
        className={`bottom-nav-btn ${location.pathname === '/orders' ? 'active' : ''}`}
      >
        <Package size={24} />
        <span>Orders</span>
      </button>

      {/* ACCOUNT */}
      <button
        onClick={() => navigate('/login')}
        className={`bottom-nav-btn ${location.pathname === '/login' ? 'active' : ''}`}
      >
        <User size={24} />
        <span>Account</span>
      </button>

    </nav>
  );
};

export default BottomNav;
