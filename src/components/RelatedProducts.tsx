import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import "../styles/related-products.css";

interface RelatedProductsProps {
  category: string;
  currentId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ category, currentId }) => {
  const related = products.filter(
    (p) => p.category === category && p.id !== currentId
  );
  const scrollRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  const onWheel = (e: WheelEvent) => {
    const isMobile = window.innerWidth <= 900;

    // For mobile: horizontal scroll
    if (isMobile) {
      const canScroll =
        (e.deltaY < 0 && el.scrollLeft > 0) ||
        (e.deltaY > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth);

      if (canScroll) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY });
      }
    } 
    // For desktop: vertical scroll
    else {
      const canScroll =
        (e.deltaY < 0 && el.scrollTop > 0) ||
        (e.deltaY > 0 && el.scrollTop < el.scrollHeight - el.clientHeight);

      if (canScroll) {
        e.preventDefault();
        el.scrollBy({ top: e.deltaY });
      }
    }
  };

  el.addEventListener("wheel", onWheel, { passive: false });
  return () => el.removeEventListener("wheel", onWheel);
}, []);


  if (related.length === 0) return null;

  return (
    <aside className="related-products">
      <div className="related-scroll" ref={scrollRef}>
        {related.map((item) => (
          <Link
            to={`/product/${item.id}`}
            key={item.id}
            className="related-img-wrap"
          >
            <img
              src={item.images[0]}
              alt={item.name}
              className="related-img"
              draggable={false}
            />
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default RelatedProducts;
