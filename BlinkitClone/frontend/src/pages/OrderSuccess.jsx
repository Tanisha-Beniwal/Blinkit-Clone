import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();

  // Auto redirect after 3 sec
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-container">
      <div className="checkmark-animation">
        <svg
          className="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle className="checkmark-circle" cx="26" cy="26" r="25" />
          <path
            className="checkmark-check"
            fill="none"
            d="M14 27l7 7 16-16"
          />
        </svg>
      </div>

      <h1 className="success-title">Hurray! 🎉</h1>
      <p className="success-message">Your order has been placed successfully.</p>
      <p className="redirect-text">Redirecting to home...</p>
    </div>
  );
};

export default OrderSuccess;
