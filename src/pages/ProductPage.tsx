import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import SideBrand from "../components/SideBrand";
import RelatedProducts from "../components/RelatedProducts";
import "../styles/product-page.css";



/* Shared cart item type */
export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);

  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    product?.images[0]
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedImage(product?.images[0]);
  }, [product]);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    if (product) {
      product.images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [product]);

  if (!product) return <div className="not-found">Product not found.</div>;

  const increaseQty = () => setQuantity((prev) => prev + 1);
  const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addToCart = () => {
    if (!selectedSize) {
      alert("Please select a size!");
      return;
    }

    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(
      (item) => item.id === product.id && item.size === selectedSize
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: selectedImage || product.images[0],
        price: product.price ?? 0,
        size: selectedSize,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert("Added to cart!");
  };


  return (
    <div className="product-page-root">
      <SideBrand />
      <main className="product-page-container">
        <div className="product-card">
          {/* LEFT IMAGES */}
          <section className="left-col">
            <div className="main-image-wrap">
              <img
                src={selectedImage}
                alt={product.name}
                className="main-image"
                draggable={false}
              />
            </div>

            <div className="thumb-grid">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb-btn ${
                    img === selectedImage ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx}`}
                    className="thumb-img"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT DETAILS */}
          <aside className="right-col">
            <h1 className="product-title">{product.name}</h1>

            <div className="price-row">
              <span className="price">
                Ksh {product.price?.toLocaleString()}
              </span>
            </div>

            <a href="#" className="shipping-link">
              View Shipping Policy
            </a>

            <div className="size-block">
              <label htmlFor="size-select" className="size-label">
                Size
              </label>
              <select
                id="size-select"
                className="size-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Select size</option>
                {product.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Quantity Selector */}
            <div className="quantity-block">
              <label className="size-label">Quantity</label>
              <div className="qty-controls">
                <button onClick={decreaseQty} className="qty-btn">−</button>
                <span className="qty-display">{quantity}</span>
                <button onClick={increaseQty} className="qty-btn">+</button>
              </div>
            </div>

            <div className="cta-column">
              <button className="btn add-cart" onClick={addToCart}>
                Add to Cart
              </button>
              <button
  className="btn buy-now"
  onClick={() => {
    if (!selectedSize) {
      alert("Please select a size!");
      return;
    }

    // Prepare single-item cart
    const singleItem = [
      {
        id: product.id,
        name: product.name,
        image: selectedImage || product.images[0],
        price: product.price ?? 0,
        size: selectedSize,
        quantity,
      },
    ];

    // Navigate to Buy page and pass this item
    navigate("/Buy", { state: { cartItems: singleItem } });
  }}
>
  Buy Now
</button>

            </div>

            <div className="description-block">
              <h3 className="desc-title">Product details</h3>
              <p className="description">{product.description}</p>
            </div>

            <Link to="/shop" className="back-link">
              ← Back to Shop
            </Link>
          </aside>

          <RelatedProducts
            category={product.category}
            currentId={product.id}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
