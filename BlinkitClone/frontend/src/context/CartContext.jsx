import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => 
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item._id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      getTotalAmount,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};