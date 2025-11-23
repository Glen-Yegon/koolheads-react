
import { FaFilter } from "react-icons/fa";

interface ShopLinksBarProps {
  activeCategory: "Capes" | "Accessories";
  setActiveCategory: (category: "Capes" | "Accessories") => void;

  // Filter controlled from parent
  onFilterClick: () => void;
}

const ShopLinksBar: React.FC<ShopLinksBarProps> = ({
  activeCategory,
  setActiveCategory,
  onFilterClick,
}) => {
  return (
    <div className="shop-links-bar">

      <div className="left-links">
        <span className="separator">•</span>

        <span
          className={`link ${activeCategory === "Capes" ? "active" : ""}`}
          onClick={() => setActiveCategory("Capes")}
        >
          Caps
        </span>

        <span
          className={`link ${activeCategory === "Accessories" ? "active" : ""}`}
          onClick={() => setActiveCategory("Accessories")}
        >
          Accessories
        </span>
      </div>

      <div className="right-links">
        <div
          className="icon-with-text"
          onClick={onFilterClick}
          style={{ cursor: "pointer" }}
        >
          <FaFilter className="icon" />
          <span className="text">Filter</span>
        </div>
      </div>

    </div>
  );
};

export default ShopLinksBar;
