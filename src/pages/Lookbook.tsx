import React, { useState } from "react";
import CartBar from "../components/CartBar";
import SideBrand from "../components/SideBrand";
import Footer from "../components/Footer";
import imageList from "../data/LookbookImages";

import "../styles/Lookbook.css";

const Lookbook: React.FC = () => {
  const [mainImage, setMainImage] = useState<string>(imageList[0]);

  return (
    <div className="lookbook-page">
      {/* Cart Modal at the top */}
      <CartBar />

      {/* Side brand fixed on the left */}
      <SideBrand/>

      {/* Main content area */}
      <main className="lookbook-main">
        {/* Left - Large display */}
        <div className="main-display">
          <img src={mainImage} alt="Main lookbook" className="main-image" />
        </div>

        {/* Right - Thumbnails scrollable grid */}
        <div className="thumbnail-gallery">
          {imageList.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Look ${index + 1}`}
              className={`thumbnail ${mainImage === img ? "active" : ""}`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Lookbook;
