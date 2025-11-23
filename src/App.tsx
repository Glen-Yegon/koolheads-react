import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import Lookbook from "./pages/Lookbook"; // ✅ Add this import
import { PageTransitionProvider } from "./components/PageTransition";
import Buy from "./pages/Buy"; // adjust path if needed
import "./App.css";
import CartPage from "./pages/cart"; // ✅ import your CartPage

export default function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [homeVisible, setHomeVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setHomeVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <Router>
      <ScrollToTop />
      <PageTransitionProvider>
        {loading && (
          <div className={`loader-wrapper ${fadeOut ? "fade-out" : ""}`}>
            <Loader
              onFinish={() => {
                setFadeOut(true);
                setTimeout(() => setLoading(false), 800);
              }}
            />
          </div>
        )}

        {!loading && (
          <div className={`home-container ${homeVisible ? "fade-in" : ""}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} /> {/* ✅ This is required */}
                        <Route path="/buy" element={<Buy />} />
                        <Route path="/lookbook" element={<Lookbook />} />

            </Routes>
          </div>
        )}
      </PageTransitionProvider>
    </Router>
  );
}
