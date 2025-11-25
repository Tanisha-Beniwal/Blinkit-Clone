import React from "react";
import "../styles/App.css";


const Orders = () => {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  return (
    <div className="orders-container">
      <h2 className="orders-title">🧾 My Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">You have no past orders.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Date:</strong> {order.date}</p>
              </div>

              <div className="order-body">
                <p><strong>Payment:</strong> {order.paymentMode}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total Amount:</strong> ₹{order.amount}</p>
              </div>

              <div className="order-items">
                <strong>Items:</strong>
                {order.items.map((item) => (
                  <p key={item._id} className="order-item-name">
                    {item.name} × {item.quantity} — ₹{item.price}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
