import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Headphones,
  BadgeCheck,
  ArrowUp,
} from "lucide-react";

const css = `
.footer {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  margin-top: 60px;
  background: #fff6f6;
  border-top: 1px solid var(--red-line);
  color: var(--ink);
}
.footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red-3), var(--red-1), #ff6b76, var(--red-1), var(--red-3));
  background-size: 200% 100%;
  animation: footer-line 6s linear infinite;
}

/* ---------- TRUST STRIP ---------- */
.footer-trust {
  background: #ffffff;
  border-bottom: 1px solid var(--red-line);
}
.footer-trust-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 22px 5%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.trust-icon {
  width: 44px;
  height: 44px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--red-soft);
  color: var(--red-1);
  border: 1px solid #f7c9ce;
  transition: background 0.3s ease, color 0.3s ease, transform 0.4s var(--ease);
}
.trust-item:hover .trust-icon {
  background: var(--red-1);
  color: #ffffff;
  transform: translateY(-3px) rotate(-6deg);
}
.trust-item strong {
  display: block;
  font-size: 13px;
  font-weight: 750;
  color: var(--red-3);
}
.trust-item span {
  font-size: 12px;
  color: var(--muted);
}

/* ---------- MAIN GRID ---------- */
.footer-main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 5% 36px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 44px;
}
.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.footer-brand-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 12px;
  box-shadow: 0 10px 20px -10px rgba(225, 29, 46, 0.9);
  transition: transform 0.5s var(--ease);
}
.footer-brand:hover .footer-brand-icon {
  transform: rotate(-10deg) scale(1.08);
}
.footer-brand-name {
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.8px;
  color: var(--red-3);
}
.footer-brand-name span {
  color: var(--red-1);
}
.footer-about {
  margin: 16px 0 0;
  max-width: 340px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}
.footer-col h4 {
  position: relative;
  margin: 0 0 18px;
  padding-bottom: 10px;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--red-3);
}
.footer-col h4::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 28px;
  height: 3px;
  border-radius: 3px;
  background: var(--red-1);
}
.footer-col ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.footer-col ul a {
  display: inline-block;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.35s var(--ease);
}
.footer-col ul a:hover {
  color: var(--red-1);
  transform: translateX(6px);
}

/* ---------- CONTACT ---------- */
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.footer-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s ease;
}
a.footer-contact-item:hover {
  color: var(--red-1);
}
.footer-contact-item svg {
  flex: none;
  margin-top: 2px;
  color: var(--red-1);
}

/* ---------- BOTTOM BAR ---------- */
.footer-bottom {
  border-top: 1px solid var(--red-line);
  background: #ffffff;
}
.footer-bottom-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.footer-copy {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 600;
}
.footer-copy b {
  color: var(--red-2);
}
.footer-legal {
  display: flex;
  align-items: center;
  gap: 22px;
}
.footer-legal a {
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s ease;
}
.footer-legal a:hover {
  color: var(--red-1);
}
.footer-top-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  color: #ffffff;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 22px -12px rgba(179, 18, 31, 0.9);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}
.footer-top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 26px -12px rgba(179, 18, 31, 1);
}
.footer-top-btn:active {
  transform: scale(0.96);
}

@keyframes footer-line {
  to { background-position: -200% 0; }
}

/* ---------- TABLET ---------- */
@media (max-width: 1050px) {
  .footer-trust-inner {
    grid-template-columns: repeat(2, 1fr);
    padding-left: 3%;
    padding-right: 3%;
  }
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    padding-left: 3%;
    padding-right: 3%;
  }
  .footer-bottom-inner {
    padding-left: 3%;
    padding-right: 3%;
  }
}

/* ---------- MOBILE ---------- */
@media (max-width: 640px) {
  .footer { margin-top: 40px; }
  .footer-trust-inner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px 17px;
  }
  .footer-main {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 34px 17px 26px;
  }
  .footer-bottom-inner {
    padding: 16px 17px;
    flex-direction: column;
    align-items: flex-start;
  }
  .footer-legal { flex-wrap: wrap; gap: 14px; }
}

/* ---------- ACCESSIBILITY ---------- */
.footer a:focus-visible,
.footer button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .footer,
  .footer *,
  .footer::before {
    animation: none !important;
    transition: none !important;
  }
}
`;

export default function Footer() {
  const year = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="footer">
      <style>{css}</style>

      {/* TRUST STRIP */}
      <div className="footer-trust">
        <div className="footer-trust-inner">
          <div className="trust-item">
            <span className="trust-icon"><Truck size={21} /></span>
            <div>
              <strong>Fast Delivery</strong>
              <span>Safe shipping across India</span>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon"><BadgeCheck size={21} /></span>
            <div>
              <strong>Genuine Products</strong>
              <span>100% authentic brands</span>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon"><ShieldCheck size={21} /></span>
            <div>
              <strong>Secure Payments</strong>
              <span>Safe &amp; trusted checkout</span>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon"><Headphones size={21} /></span>
            <div>
              <strong>Expert Support</strong>
              <span>Help before &amp; after purchase</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="footer-main">
        <div className="footer-col">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon">
              <ShoppingBag size={24} strokeWidth={2.2} />
            </span>
            <span className="footer-brand-name">
              Vibrant<span>Infotech</span>
            </span>
          </Link>

          <p className="footer-about">
            Your trusted source for laser, inkjet and barcode printers,
            toners &amp; cartridges, and accessories — genuine products,
            fair prices and reliable service.
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?view=brands">Brands</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/contact">Support</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products?category=Laser Printers">Laser Printers</Link></li>
            <li><Link to="/products?category=Inkjet Printers">Inkjet Printers</Link></li>
            <li><Link to="/products?category=Barcode Printers">Barcode Printers</Link></li>
            <li><Link to="/products?category=Multifunction Printers">Multifunction Printers</Link></li>
            <li><Link to="/products?category=Toners%20%26%20Cartridges">Toners &amp; Cartridges</Link></li>
            <li><Link to="/products?category=Accessories">Accessories</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <div className="footer-contact">
            <a href="tel:+910000000000" className="footer-contact-item">
              <Phone size={17} />
              +91 00000 00000
            </a>
            <a href="mailto:support@vibrantinfotech.com" className="footer-contact-item">
              <Mail size={17} />
              support@vibrantinfotech.com
            </a>
            <div className="footer-contact-item">
              <MapPin size={17} />
              <span>Your shop address,<br />City, State - PIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-copy">
            © {year} <b>VibrantInfotech</b>. All rights reserved.
          </div>

          <div className="footer-legal">
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms &amp; Conditions</Link>
            <Link to="/contact">Shipping &amp; Returns</Link>
          </div>

          <button type="button" className="footer-top-btn" onClick={scrollToTop}>
            <ArrowUp size={15} />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}