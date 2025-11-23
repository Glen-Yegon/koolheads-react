import "../App.css";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import Footer from "../components/Footer";
import { TransitionLink } from "../components/PageTransition";

export default function Home() {
  return (
    <main className="home-container">
      <div className="overlay">
        <div className="center-content">
          <h1 className="brand-title">koolheads</h1>

          <div className="menu-box">
            <nav className="menu-links">
              {/* Internal navigation uses Link */}
                <TransitionLink to="/shop">Shop</TransitionLink>
              <TransitionLink to="/lookbook">Lookbook</TransitionLink>
            </nav>

            <div className="social-icons">
              <a href="https://www.instagram.com/koolheads_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://www.tiktok.com/@koolheads?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>
      </div>

<Footer />
    </main>
  );
}
