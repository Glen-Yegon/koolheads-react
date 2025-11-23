import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/shop.css"; // optional, if you have styling
import { TransitionLink } from "../components/PageTransition";


const CartBar: React.FC = () => {
  const [itemsCount, setItemsCount] = useState(0);
  const [total, setTotal] = useState(0);
  const currency = "Kshs.";
  const navigate = useNavigate();

  // Function to update cart info
  const updateCartData = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    setItemsCount(count);
    setTotal(totalPrice);
  };

  // Initial load and storage event listener
  useEffect(() => {
    updateCartData();

    // Listen for changes in localStorage (e.g., another component updates the cart)
    const handleStorageChange = () => updateCartData();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Optional: allow other components to trigger updates by dispatching custom event
  useEffect(() => {
    const handleCartUpdate = () => updateCartData();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleViewCart = () => {
    navigate("/cart");
  };

  return (
    <div className="cart-bar">
      <div className="cart-mobile-row">
        <div className="cart-details">
          <div className="cart-top">
            <span className="cart-title">CART</span>
            <span className="cart-currency">{currency}</span>
          </div>
          <hr className="cart-divider" />
          <div className="cart-bottom">
            <span className="cart-items">{itemsCount} items</span>
            <span className="cart-total">Total: {currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

<TransitionLink to="/cart" className="view-cart-btn">
  View Cart
</TransitionLink>

    </div>
  );
};

export default CartBar;
