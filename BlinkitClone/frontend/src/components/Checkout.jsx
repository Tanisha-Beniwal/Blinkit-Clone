import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";   // ⭐ ADD THIS
import "../styles/App.css";

const Checkout = () => {
  const { cart, getTotalAmount } = useCart();
  const navigate = useNavigate();   // ⭐ NAVIGATE HOOK

  // Address state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState(
    JSON.parse(localStorage.getItem("address")) || null
  );

  // Form fields
  const [form, setForm] = useState({
    name: "",
    phone: "",
    house: "",
    area: "",
    city: "",
    pincode: "",
  });

  // Save Address
  const handleSaveAddress = () => {
    localStorage.setItem("address", JSON.stringify(form));
    setAddress(form);
    setShowAddressModal(false);
  };

  // ------------------------------------------------------------------
  // ✅ CASH ON DELIVERY CONFIRMATION + REDIRECT TO SUCCESS PAGE
  // ------------------------------------------------------------------
  const handleCOD = () => {
    if (!address) {
      alert("Please add your delivery address first.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const order = {
      id: Date.now(),
      items: cart,
      address,
      amount: getTotalAmount(),
      paymentMode: "Cash on Delivery",
      status: "Confirmed",
      date: new Date().toLocaleString(),
    };

    // Save order in localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // ⭐ GO TO ORDER SUCCESS PAGE
    navigate("/order-success");
  };

  return (
    <div className="checkout-container">

      {/* LEFT SIDE */}
      <div className="checkout-left">
        <h2 className="checkout-title">Checkout</h2>

        {/* Delivery Address */}
        <div className="checkout-card">
          <h3 className="section-title">Delivery Address</h3>

          {!address ? (
            <>
              <p className="section-text">Select or add a delivery address</p>
              <button className="btn-green" onClick={() => setShowAddressModal(true)}>
                Add New Address
              </button>
            </>
          ) : (
            <>
              <div className="saved-address-box">
                <p><strong>{address.name}</strong> ({address.phone})</p>
                <p>{address.house}, {address.area}</p>
                <p>{address.city} - {address.pincode}</p>
              </div>
              <button className="btn-grey" onClick={() => setShowAddressModal(true)}>
                Change Address
              </button>
            </>
          )}
        </div>

        {/* Payment Section */}
        <div className="checkout-card">
          <h3 className="section-title">Payment Method</h3>
          <p className="section-text">Choose your payment option</p>

          {/* 🟢 CASH ON DELIVERY */}
          <button className="btn-grey" onClick={handleCOD}>
            Cash on Delivery
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="checkout-right">
        <h3 className="summary-title">Order Summary</h3>

        <div className="summary-items">
          {cart.map(item => (
            <div key={item._id} className="summary-item">
              <img src={item.image} alt={item.name} className="summary-item-img" />
              <div className="summary-item-info">
                <p className="summary-name">{item.name}</p>
                <p className="summary-unit">{item.unit}</p>
              </div>
              <p className="summary-price">₹{item.price} × {item.quantity}</p>
            </div>
          ))}
        </div>

        <div className="summary-row">
          <span>Item Total:</span>
          <span>₹{getTotalAmount()}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee:</span>
          <span style={{ color: "#16a34a" }}>FREE</span>
        </div>
        <div className="summary-total">
          <span className="summary-total-label">Grand Total:</span>
          <span className="summary-total-amount">₹{getTotalAmount()}</span>
        </div>

        <button className="btn-checkout-final" onClick={handleCOD}>
          Place Order (COD)
        </button>
      </div>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Delivery Address</h3>

            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              type="text"
              placeholder="House / Flat No."
              value={form.house}
              onChange={(e) => setForm({ ...form, house: e.target.value })}
            />

            <input
              type="text"
              placeholder="Area / Street"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />

            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <input
              type="text"
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />

            <button className="btn-green" onClick={handleSaveAddress}>
              Save Address
            </button>

            <button className="btn-grey" onClick={() => setShowAddressModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
