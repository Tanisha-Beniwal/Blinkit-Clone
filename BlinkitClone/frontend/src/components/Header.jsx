import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, MapPin, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/App.css';

const Header = ({ searchQuery, setSearchQuery }) => {
  const { cart } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="logo">blinkit</Link>
          <div className="delivery-info">
            <MapPin size={16} style={{ color: '#16a34a' }} />
            <span style={{ fontWeight: 600 }}>Delivery in 8 minutes</span>
          </div>
        </div>
        
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <User size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {user?.name}
                  {user?.role === 'admin' && (
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      background: '#fbbf24', 
                      padding: '0.125rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      ADMIN
                    </span>
                  )}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-login">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-login">
              <User size={20} />
              <span>Login</span>
            </button>
          )}
          <button onClick={() => navigate('/cart')} className="btn btn-cart">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="cart-badge">{cart.length}</span>
            )}
            <span>Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;