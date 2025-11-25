import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './components/Checkout';   // ✅ FIXED IMPORT
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";


import './styles/App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />  {/* ✅ Works now */}
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/orders" element={<Orders />} />

            </Routes>

            <BottomNav />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
