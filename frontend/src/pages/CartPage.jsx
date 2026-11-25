import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft } from "lucide-react";

import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { API_URL } from "../services/api";

const css = `
.cart-page {
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
.cart-page *,
.cart-page *::before,
.cart-page *::after {
  box-sizing: border-box;
}
.cart-page .cart-container {
  display: block;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 45px 24px 75px;
}

/* ---------- Heading ---------- */
.cart-page .cart-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  animation: ca-rise 0.8s var(--ease) both;
}
.cart-page .cart-eyebrow {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  color: var(--red-2);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.cart-page .cart-heading h1 {
  margin: 14px 0 8px;
  color: var(--red-3);
  font-size: clamp(1.8rem, 3.6vw, 2.5rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.cart-page .cart-heading h1::after {
  content: "";
  display: block;
  width: 64px;
  height: 4px;
  margin-top: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
  transform-origin: left;
  animation: ca-underline 0.9s var(--ease) 0.3s both;
}
.cart-page .cart-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 14.5px;
}
.cart-page .cart-continue-link {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px solid #f0b8bd;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s ease, background 0.3s ease, border-color 0.3s ease,
    transform 0.3s var(--ease), box-shadow 0.3s ease;
}
.cart-page .cart-continue-link svg {
  transition: transform 0.35s var(--ease);
}
.cart-page .cart-continue-link:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -12px rgba(179, 18, 31, 0.9);
}
.cart-page .cart-continue-link:hover svg {
  transform: translateX(-4px);
}

/* ---------- Layout ---------- */
.cart-page .cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  align-items: start;
  gap: 25px;
}
.cart-page .cart-items {
  display: grid;
  gap: 15px;
}

/* ---------- Item ---------- */
.cart-page .cart-item {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 22px;
  box-shadow: 0 16px 34px -28px rgba(179, 18, 31, 0.55);
  translate: 0 0;
  opacity: 0;
  animation: ca-item-in 0.7s var(--ease) forwards;
  animation-delay: calc(min(var(--i, 0), 8) * 80ms + 100ms);
  transition: translate 0.4s var(--ease), box-shadow 0.4s var(--ease), border-color 0.3s ease;
}
.cart-page .cart-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--red-1), var(--red-2));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.5s var(--ease);
}
.cart-page .cart-item:hover {
  translate: 0 -4px;
  border-color: #f0b8bd;
  box-shadow: 0 26px 42px -28px rgba(179, 18, 31, 0.7);
}
.cart-page .cart-item:hover::before {
  transform: scaleY(1);
}
.cart-page .cart-item-image {
  height: 125px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #d49aa0;
  background: radial-gradient(circle at 50% 40%, #ffffff 40%, #fff1f2 100%);
  border: 1px solid #f7e1e3;
  border-radius: 16px;
}
.cart-page .cart-item-image img {
  width: 100%;
  height: 100%;
  padding: 8px;
  object-fit: contain;
  transition: transform 0.7s var(--ease);
}
.cart-page .cart-item:hover .cart-item-image img {
  transform: scale(1.08);
}
.cart-page .cart-item-info a {
  color: inherit;
  text-decoration: none;
}
.cart-page .cart-item-info h3 {
  margin: 0 0 10px;
  color: var(--red-3);
  font-size: 16px;
  font-weight: 750;
  line-height: 1.4;
  transition: color 0.25s ease;
}
.cart-page .cart-item-info a:hover h3 {
  color: var(--red-1);
}
.cart-page .cart-item-price {
  display: block;
  color: var(--red-2);
  font-size: 17px;
  font-weight: 800;
}
.cart-page .cart-item-stock {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}
.cart-page .cart-item-stock::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--red-1);
  animation: ca-dot 2s ease-in-out infinite;
}
.cart-page .cart-item-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 16px;
}

/* quantity stepper */
.cart-page .cart-quantity {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  background: #fff6f6;
  border: 1.5px solid var(--red-line);
  border-radius: 999px;
}
.cart-page .cart-quantity button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  color: var(--red-2);
  box-shadow: 0 0 0 1px #f0b8bd inset;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s var(--ease),
    box-shadow 0.25s ease;
}
.cart-page .cart-quantity button:hover:not(:disabled) {
  color: #ffffff;
  background: var(--red-1);
  box-shadow: none;
  transform: scale(1.1);
}
.cart-page .cart-quantity button:active:not(:disabled) {
  transform: scale(0.9);
}
.cart-page .cart-quantity button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.cart-page .cart-quantity span {
  min-width: 26px;
  color: var(--red-3);
  text-align: center;
  font-size: 14px;
  font-weight: 800;
}
.cart-page .cart-remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}
.cart-page .cart-remove-btn svg {
  transition: transform 0.35s var(--ease);
}
.cart-page .cart-remove-btn:hover {
  color: var(--red-1);
  background: var(--red-soft);
  border-color: #f7c9ce;
}
.cart-page .cart-remove-btn:hover svg {
  transform: rotate(-12deg) scale(1.15);
}
.cart-page .cart-item-total {
  color: var(--red-1);
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
}

/* ---------- Summary ---------- */
.cart-page .cart-summary {
  position: sticky;
  top: 140px;
  overflow: hidden;
  padding: 26px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-top: 3px solid var(--red-1);
  border-radius: 22px;
  box-shadow: 0 30px 56px -38px rgba(179, 18, 31, 0.7);
  animation: ca-slide-left 0.8s var(--ease) 0.2s both;
}
.cart-page .cart-summary h2 {
  margin: 0 0 20px;
  color: var(--red-2);
  font-size: 20px;
  font-weight: 800;
}
.cart-page .cart-summary-row,
.cart-page .cart-summary-total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 15px 0;
  color: var(--muted);
  font-size: 13.5px;
}
.cart-page .cart-summary-row strong {
  color: var(--red-3);
}
.cart-page .cart-summary-divider {
  height: 1px;
  margin: 20px 0;
  background: repeating-linear-gradient(90deg, #f0c4c8 0 6px, transparent 6px 12px);
}
.cart-page .cart-summary-total {
  align-items: center;
  color: var(--red-3);
  font-size: 16px;
  font-weight: 700;
}
.cart-page .cart-summary-total strong {
  display: inline-block;
  color: var(--red-1);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  animation: ca-pop 0.5s var(--ease);
}
.cart-page .cart-summary-note {
  margin: 18px 0;
  padding: 12px 14px;
  color: var(--muted);
  background: #fff6f6;
  border: 1px dashed #f0c4c8;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.6;
}

/* ---------- Buttons ---------- */
.cart-page .cart-checkout-btn,
.cart-page .cart-shop-btn {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 14px 22px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 14px;
  box-shadow: 0 14px 26px -14px rgba(179, 18, 31, 0.95);
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}
.cart-page .cart-checkout-btn::after,
.cart-page .cart-shop-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: ca-sheen 4.5s ease-in-out infinite 1.5s;
}
.cart-page .cart-checkout-btn:hover,
.cart-page .cart-shop-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 32px -14px rgba(179, 18, 31, 1);
}
.cart-page .cart-checkout-btn:active,
.cart-page .cart-shop-btn:active {
  transform: scale(0.97);
}

/* ---------- Empty ---------- */
.cart-page .cart-empty {
  min-height: 390px;
  padding: 35px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--muted);
  background: #fff9f9;
  border: 1.5px dashed #eba5ab;
  border-radius: 26px;
  animation: ca-rise 0.7s var(--ease) 0.1s both;
}
.cart-page .cart-empty svg {
  padding: 22px;
  box-sizing: content-box;
  color: var(--red-1);
  background: #ffffff;
  border: 1px solid #f7c9ce;
  border-radius: 50%;
  box-shadow: 0 20px 36px -20px rgba(179, 18, 31, 0.7);
  animation: ca-float 4s ease-in-out infinite;
}
.cart-page .cart-empty h2 {
  margin: 22px 0 6px;
  color: var(--red-2);
  font-size: 22px;
  font-weight: 800;
}
.cart-page .cart-empty p {
  margin: 0 0 22px;
  font-size: 14.5px;
}
.cart-page .cart-shop-btn {
  width: auto;
}

/* ---------- Keyframes ---------- */
@keyframes ca-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ca-item-in {
  from { opacity: 0; transform: translateX(-26px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ca-slide-left {
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ca-underline {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes ca-sheen {
  0%, 60% { transform: translateX(-120%); }
  100%    { transform: translateX(120%); }
}
@keyframes ca-dot {
  0%   { box-shadow: 0 0 0 0 rgba(225, 29, 46, 0.5); }
  70%  { box-shadow: 0 0 0 7px rgba(225, 29, 46, 0); }
  100% { box-shadow: 0 0 0 0 rgba(225, 29, 46, 0); }
}
@keyframes ca-pop {
  0%   { transform: scale(0.85); opacity: 0.5; }
  60%  { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ca-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

/* ---------- Focus ---------- */
.cart-page a:focus-visible,
.cart-page button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

/* ---------- Responsive ---------- */
@media (max-width: 850px) {
  .cart-page .cart-layout {
    grid-template-columns: 1fr;
  }
  .cart-page .cart-summary {
    position: static;
  }
}
@media (max-width: 600px) {
  .cart-page .cart-container {
    padding: 25px 14px 50px;
  }
  .cart-page .cart-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .cart-page .cart-item {
    grid-template-columns: 85px minmax(0, 1fr);
    gap: 13px;
    padding: 13px;
  }
  .cart-page .cart-item-image {
    height: 100px;
  }
  .cart-page .cart-item-info h3 {
    font-size: 14px;
  }
  .cart-page .cart-item-total {
    grid-column: 2;
    font-size: 16px;
  }
  .cart-page .cart-item-controls {
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-page *,
  .cart-page *::before,
  .cart-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .cart-page .cart-item {
    opacity: 1;
  }
}
`;

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  return (
    <div className="cart-page">
      <style>{css}</style>
      <Navbar />

      <main className="cart-container">
        <div className="cart-heading">
          <div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
            <h1>Shopping Cart</h1>
            <p>{cartCount} item(s) in your cart</p>
          </div>

          <Link to="/" className="cart-continue-link">
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={55} />
            <h2>Your cart is empty</h2>
            <p>Explore our printers and printing supplies.</p>

            <Link to="/" className="cart-shop-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cart.map((item, index) => (
                <article
                  className="cart-item"
                  key={item.id}
                  style={{ "--i": index }}
                >
                  <div className="cart-item-image">
                    {item.image_type ? (
                      <img
                        src={`${API_URL}/products/${item.id}/image`}
                        alt={item.name}
                      />
                    ) : (
                      <ShoppingCart size={35} />
                    )}
                  </div>

                  <div className="cart-item-info">
                    <Link to={`/products/${item.id}`}>
                      <h3>{item.name}</h3>
                    </Link>

                    <strong className="cart-item-price">
                      {money(item.price)}
                    </strong>

                    <span className="cart-item-stock">
                      {item.stock_quantity} available
                    </span>

                    <div className="cart-item-controls">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    {money(item.price * item.quantity)}
                  </div>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items ({cartCount})</span>
                <strong>{money(cartTotal)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong>Calculated later</strong>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Subtotal</span>
                {/* key restarts the pop animation whenever the total changes */}
                <strong key={cartTotal}>{money(cartTotal)}</strong>
              </div>

              <p className="cart-summary-note">
                Delivery charges and final order details will be confirmed
                during checkout.
              </p>

              <Link to="/" className="cart-checkout-btn">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}