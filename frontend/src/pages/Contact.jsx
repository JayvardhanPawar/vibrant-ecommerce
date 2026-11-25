import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Headphones,
  MessageCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";

const css = `
.contact-page {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 100vh;
  background: linear-gradient(180deg, #fff6f6 0%, #ffffff 420px);
  color: var(--ink);
}
.contact-page *,
.contact-page *::before,
.contact-page *::after {
  box-sizing: border-box;
}

.contact-page .contact-container {
  display: block;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 55px 5% 80px;
}

/* ---------- Hero ---------- */
.contact-page .contact-hero {
  max-width: 680px;
  margin: 0 auto 44px;
  text-align: center;
}
.contact-page .contact-hero > * {
  opacity: 0;
  animation: ct-rise 0.8s var(--ease) forwards;
}
.contact-page .contact-hero > span {
  display: inline-block;
  padding: 7px 15px;
  border-radius: 999px;
  color: var(--red-2);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.contact-page .contact-hero h1 {
  margin: 16px 0 14px;
  color: var(--red-3);
  font-size: clamp(2rem, 4.6vw, 3rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  animation-delay: 0.12s;
}
.contact-page .contact-hero h1::after {
  content: "";
  display: block;
  width: 64px;
  height: 4px;
  margin: 14px auto 0;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
  transform-origin: center;
  animation: ct-underline 0.9s var(--ease) 0.5s both;
}
.contact-page .contact-hero p {
  margin: 0;
  color: var(--muted);
  font-size: 15.5px;
  line-height: 1.8;
  animation-delay: 0.24s;
}

/* ---------- Cards ---------- */
.contact-page .contact-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.contact-page .contact-card {
  position: relative;
  overflow: hidden;
  min-height: 235px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 22px;
  box-shadow: 0 16px 34px -26px rgba(179, 18, 31, 0.55);
  /* "translate" keeps hover lift independent from the entrance animation */
  translate: 0 0;
  opacity: 0;
  animation: ct-rise 0.75s var(--ease) forwards;
  transition: translate 0.45s var(--ease), box-shadow 0.45s var(--ease),
    border-color 0.3s ease;
}
.contact-page .contact-card:nth-child(1) { animation-delay: 0.3s; }
.contact-page .contact-card:nth-child(2) { animation-delay: 0.42s; }
.contact-page .contact-card:nth-child(3) { animation-delay: 0.54s; }

/* red accent line that draws across the top on hover */
.contact-page .contact-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red-2), var(--red-1), #ff6b76);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.55s var(--ease);
}
/* soft decorative corner glow */
.contact-page .contact-card::after {
  content: "";
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(225, 29, 46, 0.12), transparent 70%);
  transition: transform 0.6s var(--ease);
}
.contact-page .contact-card:hover {
  translate: 0 -8px;
  border-color: #f0b8bd;
  box-shadow: 0 30px 46px -26px rgba(179, 18, 31, 0.7);
}
.contact-page .contact-card:hover::before {
  transform: scaleX(1);
}
.contact-page .contact-card:hover::after {
  transform: scale(1.6);
}

.contact-page .contact-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: var(--red-1);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  transition: transform 0.5s var(--ease), background 0.3s ease, color 0.3s ease,
    box-shadow 0.3s ease, border-color 0.3s ease;
}
.contact-page .contact-card:hover .contact-icon {
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-color: transparent;
  transform: rotate(-8deg) scale(1.08);
  box-shadow: 0 14px 24px -10px rgba(225, 29, 46, 0.85);
}
.contact-page .contact-card h3 {
  margin: 22px 0 8px;
  color: var(--red-2);
  font-size: 18px;
  font-weight: 800;
}
.contact-page .contact-card p {
  min-height: 44px;
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}
.contact-page .contact-card span,
.contact-page .contact-card a {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px dashed #eba5ab;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}
.contact-page .contact-card a {
  border-style: solid;
  border-color: #f0b8bd;
  transition: color 0.3s ease, background 0.3s ease, border-color 0.3s ease,
    transform 0.3s var(--ease);
}
.contact-page .contact-card a:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
  transform: translateX(4px);
}

/* ---------- Bottom CTA ---------- */
.contact-page .contact-bottom {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  margin-top: 28px;
  padding: 34px 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-radius: 26px;
  background: linear-gradient(135deg, var(--red-1) 0%, var(--red-2) 55%, var(--red-3) 100%);
  color: #ffffff;
  box-shadow: 0 34px 60px -34px rgba(122, 11, 20, 0.8);
  opacity: 0;
  animation: ct-rise 0.8s var(--ease) 0.7s forwards;
}
/* floating soft circles */
.contact-page .contact-bottom::before,
.contact-page .contact-bottom::after {
  content: "";
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}
.contact-page .contact-bottom::before {
  width: 240px;
  height: 240px;
  top: -110px;
  right: 14%;
  animation: ct-float 9s ease-in-out infinite;
}
.contact-page .contact-bottom::after {
  width: 160px;
  height: 160px;
  bottom: -80px;
  left: 34%;
  animation: ct-float 11s ease-in-out infinite reverse;
}
.contact-page .contact-bottom svg {
  padding: 9px;
  box-sizing: content-box;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  animation: ct-bob 3.5s ease-in-out infinite;
}
.contact-page .contact-bottom h2 {
  margin: 14px 0 8px;
  color: #ffffff;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.contact-page .contact-bottom p {
  max-width: 520px;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13.5px;
  line-height: 1.7;
}
.contact-page .contact-shop-button {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  padding: 15px 26px;
  border-radius: 14px;
  background: #ffffff;
  color: var(--red-2);
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 16px 30px -14px rgba(0, 0, 0, 0.55);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}
.contact-page .contact-shop-button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(225, 29, 46, 0.22) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: ct-sheen 4.5s ease-in-out infinite 2s;
}
.contact-page .contact-shop-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 36px -14px rgba(0, 0, 0, 0.6);
}
.contact-page .contact-shop-button:active {
  transform: scale(0.97);
}

/* ---------- Keyframes ---------- */
@keyframes ct-rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ct-underline {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes ct-float {
  0%, 100% { transform: translate(0, 0); }
  50%      { transform: translate(24px, 18px); }
}
@keyframes ct-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}
@keyframes ct-sheen {
  0%, 60% { transform: translateX(-120%); }
  100%    { transform: translateX(120%); }
}

/* ---------- Focus ---------- */
.contact-page a:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px var(--red-1);
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .contact-page .contact-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .contact-page .contact-container {
    padding: 35px 17px 55px;
  }
  .contact-page .contact-cards {
    grid-template-columns: 1fr;
  }
  .contact-page .contact-card {
    min-height: auto;
  }
  .contact-page .contact-bottom {
    align-items: flex-start;
    flex-direction: column;
    padding: 28px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-page *,
  .contact-page *::before,
  .contact-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .contact-page .contact-hero > *,
  .contact-page .contact-card,
  .contact-page .contact-bottom {
    opacity: 1;
  }
}
`;

export default function Contact() {
  return (
    <div className="contact-page">
      <style>{css}</style>
      <Navbar />

      <main className="contact-container">
        <section className="contact-hero">
          <span>WE ARE HERE TO HELP</span>
          <h1>How can we help you?</h1>
          <p>
            Need help choosing a printer, finding supplies or getting
            assistance with an order? Contact our team.
          </p>
        </section>

        <section className="contact-cards">
          <article className="contact-card">
            <div className="contact-icon">
              <Phone size={23} />
            </div>
            <h3>Call Us</h3>
            <p>Speak with our support team for assistance.</p>
            <span>Contact number to be added</span>
          </article>

          <article className="contact-card">
            <div className="contact-icon">
              <Mail size={23} />
            </div>
            <h3>Email Support</h3>
            <p>Send us your questions and product enquiries.</p>
            <span>Email address to be added</span>
          </article>

          <article className="contact-card">
            <div className="contact-icon">
              <Headphones size={23} />
            </div>
            <h3>Product Assistance</h3>
            <p>Get help selecting printers and consumables.</p>
            <Link to="/products">Explore Products</Link>
          </article>
        </section>

        <section className="contact-bottom">
          <div>
            <MessageCircle size={27} />
            <h2>Looking for a printer?</h2>
            <p>
              Browse our printer catalogue and find a product that
              matches your requirements.
            </p>
          </div>

          <Link to="/products" className="contact-shop-button">
            Browse Products
          </Link>
        </section>
      </main>
    </div>
  );
}