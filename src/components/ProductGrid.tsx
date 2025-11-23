import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/Product";
import { products } from "../data/products";

interface ProductGridProps {
  items?: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ items }) => {
  const productList = items ?? products;

  React.useEffect(() => {
    products.forEach((product) => {
      product.images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  return (
    <div className="product-grid">
      {productList.map((product) => (
        <Link
          to={`/product/${product.id}`}
          key={product.id}
          className="product-item"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="primary-img"
          />
          <img
            src={product.images[1]}
            alt={`${product.name} hover`}
            className="hover-img"
          />
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
