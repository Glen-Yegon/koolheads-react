import React from "react";
import "../App.css"; // keep using your existing styles

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-links">
          <a href="#">Terms & Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Support</a>
        </div>

        <div className="footer-contact">
          <p>Email: contact@koolheads.com</p>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <h2>KOOLHEADS</h2>
      </div>
    </footer>
  );
};

export default Footer;
