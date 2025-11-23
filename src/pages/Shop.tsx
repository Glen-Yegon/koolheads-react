import React, { useState, useEffect, useRef } from "react";
import CartBar from "../components/CartBar";
import ProductGrid from "../components/ProductGrid";
import SideBrand from "../components/SideBrand";
import ShopLinksBar from "../components/ShopLinksBar";
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { products } from "../data/products";
import "../styles/Shop.css";

const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] =
    useState<"Capes" | "Accessories">("Capes");

  // Filter dropdown open/close
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Brim filter
  const [activeBrim, setActiveBrim] =
    useState<"all" | "flat" | "curved">("all");

  // Dropdown reference for outside-click detection
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Separate products
  const capeProducts = products.filter((p) => p.category === "cape");
  const accessoryProducts = products.filter((p) => p.category === "accessory");

  // Apply brim filter to capes only
  const filteredCapeProducts =
    activeBrim === "all"
      ? capeProducts
      : capeProducts.filter((p) => {
          if (activeBrim === "flat") return p.type === "flat brim";
          if (activeBrim === "curved") return p.type === "curved brim";
          return true;
        });

  const displayedProducts =
    activeCategory === "Capes" ? filteredCapeProducts : accessoryProducts;

  return (
    <div className="shop-container">
      <SideBrand />

      <div className="shop-content">
        <CartBar />

        {/* Shop Links Bar */}
        <ShopLinksBar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Filter Dropdown */}
        {isFilterOpen && activeCategory === "Capes" && (
          <div className="filter-dropdown" ref={dropdownRef}>
            <div
              className={`filter-option ${
                activeBrim === "flat" ? "active" : ""
              }`}
              onClick={() => setActiveBrim("flat")}
            >
              Flat Brim
            </div>

            <div
              className={`filter-option ${
                activeBrim === "curved" ? "active" : ""
              }`}
              onClick={() => setActiveBrim("curved")}
            >
              Curved Brim
            </div>

            <div
              className={`filter-option ${
                activeBrim === "all" ? "active" : ""
              }`}
              onClick={() => setActiveBrim("all")}
            >
              Show All
            </div>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid items={displayedProducts} />

        {/* Bottom Links */}
        <div className="shop-bottom-links">
          <div className="links-row">
            <span className="separator">|</span>
            <a href="#"><FaInstagram className="icon" /></a>
            <a href="#"><FaWhatsapp className="icon" /></a>
            <a href="#"><FaTiktok className="icon" /></a>
          </div>

          <div className="footer-legal">
            <a href="#">Terms & Conditions</a>
            <span>•</span>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
