import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/cart-page.css";
import type { CartItem } from "./ProductPage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faWhatsapp,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";


const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const updateCartData = () => {
    const saved = localStorage.getItem("cart");
    setCartItems(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    updateCartData();
    const handleCartUpdate = () => updateCartData();
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  const handleRemove = (id: string, size: string) => {
    const updated = cartItems.filter((item) => !(item.id === id && item.size === size));
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleQuantityChange = (id: string, size: string, newQty: number) => {
    const updated = cartItems.map((item) =>
      item.id === id && item.size === size
        ? { ...item, quantity: Math.max(1, newQty) }
        : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

const handleCheckout = () => {
  navigate("/buy", { state: { cartItems } });
};


  return (
    <div className="cart-page-root">
      <header className="cart-page-header">
        <h1>Your Cart</h1>
      </header>

      <main className="cart-page-main">
        <div className="cart-container">
          <div className="cart-table-header">
            <span className="product-col">Product</span>
            <span className="price-col">Price</span>
          </div>
          <hr className="divider" />

          {cartItems.length === 0 ? (
            <p className="empty-msg">
              Your cart is empty. <Link to="/shop">Continue Shopping</Link>
            </p>
          ) : (
            cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-info">
                  <h2 className="item-name">{item.name}</h2>
                  <p className="item-size">Size: {item.size}</p>

                  <div className="item-quantity">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        handleQuantityChange(item.id, item.size, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        handleQuantityChange(item.id, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-price">
                  <span>Ksh {(item.price * item.quantity).toLocaleString()}</span>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id, item.size)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}

          {cartItems.length > 0 && (
            <>
              <div className="cart-subtotal">
                <span>Subtotal:</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>

              {/* ✅ Checkout Button */}
              <button className="checkout-btn" onClick={handleCheckout}>
                Checkout
              </button>
            </>
          )}
        </div>
      </main>
      <footer className="cart-footer">
  <div className="footer-links">
    <Link to="/terms">Terms & Conditions</Link>
    <Link to="/privacy">Privacy Policy</Link>
  </div>

  <div className="footer-socials">
    <a
      href="https://www.instagram.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
    >
      <FontAwesomeIcon icon={faInstagram} />
    </a>
    <a
      href="https://www.facebook.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
    >
      <FontAwesomeIcon icon={faWhatsapp} />
    </a>
    <a
      href="https://twitter.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Twitter"
    >
      <FontAwesomeIcon icon={faXTwitter} />
    </a>
  </div>

  <p className="footer-copy">
    © {new Date().getFullYear()} Koolheads. All rights reserved.
  </p>
</footer>

    </div>
  );
};

export default CartPage;
