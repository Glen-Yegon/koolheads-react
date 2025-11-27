// src/pages/Buy.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/buy-page.css";
// Paystack global type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const PaystackPop: any;

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
};

const formatCurrency = (amount: number) => `Ksh ${amount.toLocaleString()}`;
const showSubmitButton = false; // always false

const Buy: React.FC = () => {
  const location = useLocation();

  // ✅ cartItems state — use data passed via navigation or fallback to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (location.state?.cartItems) return location.state.cartItems;
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Keep cart synced with localStorage changes
  useEffect(() => {
    const update = () => {
      const saved = localStorage.getItem("cart");
      setCartItems(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener("storage", update);
    window.addEventListener("cartUpdated", update as EventListener);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cartUpdated", update as EventListener);
    };
  }, []);

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // ✅ mobile summary toggle
  const [summaryOpen, setSummaryOpen] = useState(false);

  // ✅ form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");

  // ✅ basic validation
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPhoneValid = phone.trim().length >= 8;
  const isFormValid =
    isEmailValid &&
    isPhoneValid &&
    country.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    address.trim() &&
    city.trim();

    const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
const [loading, setLoading] = useState(false);

// Toast component
const Toast = () => {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type} show`}>
      {toast.message}
    </div>
  );
};

const handleSubmitOrder = async () => {
  if (!isFormValid || cartItems.length === 0) {
    setToast({ message: "Please fill all required fields.", type: "error" });
    setTimeout(() => setToast(null), 3000);
    return;
  }

  setLoading(true);
  setToast({ message: "Processing your order, please don't close the tab...", type: "info" });

  const order = {
    contact: { email, phone },
    shipping: {
      country,
      firstName,
      lastName,
      address,
      apartment,
      city,
      postal,
      shippingMethod,
    },
    items: cartItems,
    subtotal,
  };

  try {
    const res = await fetch("http://localhost:5000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setToast({ message: "Order submitted successfully! Check your email.", type: "success" });
      setTimeout(() => setToast(null), 4000);

      // Clear cart
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      setToast({ message: data.message || "Something went wrong.", type: "error" });
      setTimeout(() => setToast(null), 4000);
    }
  } catch (err) {
    console.error(err);
    setLoading(false);
    setToast({ message: "Failed to submit order.", type: "error" });
    setTimeout(() => setToast(null), 4000);
  }
};





 const handlePay = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!isFormValid) {
    setToast({ message: "Please complete all required fields before paying.", type: "error" });
    setTimeout(() => setToast(null), 3000);
    return;
  }

  const orderPayload = {
    contact: { email, phone },
    shipping: {
      country,
      firstName,
      lastName,
      address,
      apartment,
      city,
      postal,
      shippingMethod,
    },
    items: cartItems,
    subtotal,
  };

  // Convert subtotal to cents (Paystack expects *100)
  const amountKES = subtotal * 100;

  const handler = PaystackPop.setup({
    key: "pk_test_b20fcb1e5eb444ed72a8c41d97484875df9374be",
    email,
    amount: amountKES,
    currency: "KES",
    ref: "KH-" + Date.now(),

callback: async (response: { reference: string }) => {
  setToast({ message: "Verifying payment...", type: "info" });
  setLoading(true);

  try {
    const verifyRes = await fetch("http://localhost:5000/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: response.reference,
        order: orderPayload,
      }),
    });

    const verifyData = await verifyRes.json();
    setLoading(false);

    if (verifyRes.ok && verifyData.status === "success") {
      setToast({
        message: "Payment successful! Check your email for confirmation.",
        type: "success",
      });

      setTimeout(() => setToast(null), 4000);

      // Clear cart after success
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      setToast({ message: "Payment verification failed!", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  } catch (err) {
    setLoading(false);
    setToast({ message: "Server error verifying payment.", type: "error" });
    setTimeout(() => setToast(null), 3000);
  }
},

  });

  handler.openIframe();
};


  return (
    <div className="buy-root">
        <Toast />
      <div className="buy-container">
        {/* ✅ Mobile summary toggle */}
        <div className="mobile-summary">
          <button
            className="summary-toggle"
            onClick={() => setSummaryOpen((s) => !s)}
            aria-expanded={summaryOpen}
            aria-controls="mobile-order-details"
          >
            Order Details ({cartItems.length} items) — {formatCurrency(subtotal)}
            <span className={`chev ${summaryOpen ? "open" : ""}`}></span>
          </button>

          <div
            id="mobile-order-details"
            className={`mobile-order-details ${summaryOpen ? "open" : ""}`}
          >
            {cartItems.length === 0 ? (
              <p className="empty">Your cart is empty.</p>
            ) : (
              cartItems.map((it) => (
                <div key={`${it.id}-${it.size}`} className="summary-row">
                  <img src={it.image} alt={it.name} />
                  <div className="sr-info">
                    <div className="sr-name">{it.name}</div>
                    <div className="sr-meta">
                      {it.size} · x{it.quantity}
                    </div>
                  </div>
                  <div className="sr-price">
                    {formatCurrency(it.price * it.quantity)}
                  </div>
                </div>
              ))
            )}
            <div className="summary-sub">
              <span>Subtotal: </span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
          </div>
        </div>

        {/* ✅ Desktop layout */}
        <div className="columns">
          <form className="checkout-form" onSubmit={handlePay} noValidate>
            <h2 className="section-title">Contact</h2>
            <div className="field">
              <label>
                Email <span className="req">*</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={!isEmailValid && email ? "invalid" : ""}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <div className="field">
              <label>
                Phone <span className="req">*</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={!isPhoneValid && phone ? "invalid" : ""}
                  placeholder="+254 7XXXXXXXX"
                  required
                />
              </label>
            </div>

            <h2 className="section-title">Delivery Info</h2>

            <div className="grid-2">
              <div className="field">
                <label>
                  Country / Region <span className="req">*</span>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Kenya"
                    required
                  />
                </label>
              </div>

              <div className="field">
                <label>
                  Postal code (optional)
                  <input
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    placeholder="Postal code"
                  />
                </label>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>
                  First name <span className="req">*</span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="field">
                <label>
                  Last name <span className="req">*</span>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="field">
              <label>
                Address <span className="req">*</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  required
                />
              </label>
            </div>

            <div className="field">
              <label>
                Apartment, suite, building (optional)
                <input
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Apt, suite, etc."
                />
              </label>
            </div>

            <div className="field">
              <label>
                City <span className="req">*</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="shipping-notice">
              <strong>Shipping notice:</strong>
              <p>
                Standard delivery: 2-3 business days. Orders processed within
                24 hours. For urgent deliveries, choose express at checkout (extra fees apply).
              </p>
            </div>

            <div className="shipping-method">
              <label>
                <input
                  type="radio"
                  name="ship"
                  value="standard"
                  checked={shippingMethod === "standard"}
                  onChange={() => setShippingMethod("standard")}
                />{" "}
                Standard shipping
              </label>
              <label>
                <input
                  type="radio"
                  name="ship"
                  value="express"
                  checked={shippingMethod === "express"}
                  onChange={() => setShippingMethod("express")}
                />{" "}
                Express shipping
              </label>
            </div>

<div className="pay-section">
  <div className="pay-summary-inline">
    <span>Order total</span>
    <strong>{formatCurrency(subtotal)}</strong>
  </div>

  <div className="pay-buttons">
    <button
      type="submit"
      className="pay-btn"
      disabled={!isFormValid || cartItems.length === 0}
    >
      Pay
    </button>


{showSubmitButton && (
  <button
    type="button"
    className="pay-btn"
    disabled={!isFormValid || cartItems.length === 0 || loading}
    onClick={handleSubmitOrder}
  >
    {loading ? "Processing..." : "Submit"}
  </button>
)}


  </div>
</div>

          </form>

          <aside className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-list">
              {cartItems.length === 0 ? (
                <p className="empty">No items in cart.</p>
              ) : (
                cartItems.map((it) => (
                  <div key={`${it.id}-${it.size}`} className="summary-row">
                    <img src={it.image} alt={it.name} />
                    <div className="sr-info">
                      <div className="sr-name">{it.name}</div>
                      <div className="sr-meta">
                        {it.size} · x{it.quantity}
                      </div>
                    </div>
                    <div className="sr-price">
                      {formatCurrency(it.price * it.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="summary-sub desktop-only">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <div className="summary-footer">
              <p>
                Promo codes coming soon. Returns within 14 days.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Buy;
