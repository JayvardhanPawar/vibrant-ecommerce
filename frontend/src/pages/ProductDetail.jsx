import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Package,
  Truck,
  Printer,
  ImageOff,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { apiRequest, API_URL } from "../services/api";
import { useCart } from "../context/CartContext";

const css = `
.product-detail-page {
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
.product-detail-page *,
.product-detail-page *::before,
.product-detail-page *::after {
  box-sizing: border-box;
}
.product-detail-page .pd-container {
  display: block;
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  padding: 30px 24px 70px;
}

/* ---------- Breadcrumb ---------- */
.product-detail-page .pd-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 26px;
  color: var(--muted);
  font-size: 13px;
  animation: pd-rise 0.6s var(--ease) both;
}
.product-detail-page .pd-breadcrumb a {
  color: var(--red-1);
  font-weight: 700;
  text-decoration: none;
  transition: color 0.25s ease;
}
.product-detail-page .pd-breadcrumb a:hover {
  color: var(--red-3);
  text-decoration: underline;
}
.product-detail-page .pd-breadcrumb strong {
  color: var(--red-3);
}

/* ---------- Main overview ---------- */
.product-detail-page .pd-main {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 55px;
  align-items: start;
  padding: 32px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-top: 3px solid var(--red-1);
  border-radius: 26px;
  box-shadow: 0 30px 60px -40px rgba(179, 18, 31, 0.6);
  animation: pd-rise 0.8s var(--ease) 0.05s both;
}
.product-detail-page .pd-gallery {
  animation: pd-slide-right 0.9s var(--ease) 0.15s both;
}
.product-detail-page .pd-main-image {
  position: relative;
  min-height: 430px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 40%, #ffffff 40%, #fff1f2 100%);
  border: 1px solid #f7e1e3;
  border-radius: 20px;
}
.product-detail-page .pd-main-image img {
  width: 100%;
  height: 430px;
  object-fit: contain;
  padding: 14px;
  transition: transform 0.8s var(--ease);
}
.product-detail-page .pd-main-image:hover img {
  transform: scale(1.06);
}
.product-detail-page .pd-image-fallback {
  display: none;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #d49aa0;
}

/* ---------- Info column (staggered) ---------- */
.product-detail-page .pd-product-info > * {
  opacity: 0;
  animation: pd-rise 0.7s var(--ease) forwards;
}
.product-detail-page .pd-product-info > *:nth-child(1) { animation-delay: 0.20s; }
.product-detail-page .pd-product-info > *:nth-child(2) { animation-delay: 0.27s; }
.product-detail-page .pd-product-info > *:nth-child(3) { animation-delay: 0.34s; }
.product-detail-page .pd-product-info > *:nth-child(4) { animation-delay: 0.41s; }
.product-detail-page .pd-product-info > *:nth-child(5) { animation-delay: 0.48s; }
.product-detail-page .pd-product-info > *:nth-child(6) { animation-delay: 0.55s; }
.product-detail-page .pd-product-info > *:nth-child(7) { animation-delay: 0.62s; }
.product-detail-page .pd-product-info > *:nth-child(8) { animation-delay: 0.69s; }
.product-detail-page .pd-product-info > *:nth-child(n+9) { animation-delay: 0.76s; }

.product-detail-page .pd-product-category {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  color: var(--red-2);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.product-detail-page .pd-product-info h1 {
  margin: 14px 0 12px;
  color: var(--red-3);
  font-size: clamp(27px, 3vw, 38px);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.product-detail-page .pd-brand-model {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: var(--muted);
  font-size: 14px;
}
.product-detail-page .pd-brand-model strong {
  color: var(--red-2);
}
.product-detail-page .pd-sku {
  margin: 12px 0 0;
  color: #a98d91;
  font-size: 13px;
}

/* price */
.product-detail-page .pd-price-block {
  margin: 24px 0 16px;
  padding: 16px 20px;
  background: #fff6f6;
  border: 1px solid #f7d9dc;
  border-radius: 18px;
}
.product-detail-page .pd-price {
  color: var(--red-1);
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.product-detail-page .pd-mrp {
  margin-top: 5px;
  color: var(--muted);
  font-size: 14px;
}
.product-detail-page .pd-mrp span {
  text-decoration: line-through;
}
.product-detail-page .pd-price-block small {
  display: block;
  margin-top: 7px;
  color: #a98d91;
}

/* stock */
.product-detail-page .pd-stock {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 12px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
}
.product-detail-page .pd-stock.available {
  color: var(--red-2);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
}
.product-detail-page .pd-stock.available svg {
  animation: pd-pulse 2s ease-in-out infinite;
}
.product-detail-page .pd-stock.unavailable {
  color: #8f7e80;
  background: #f4eeee;
  border: 1px solid #e6dcdc;
}

.product-detail-page .pd-description {
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px dashed #f0c4c8;
}
.product-detail-page .pd-description h3 {
  margin: 0 0 10px;
  color: var(--red-2);
  font-size: 16px;
  font-weight: 800;
}
.product-detail-page .pd-description p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
}

/* highlights */
.product-detail-page .pd-highlights {
  display: grid;
  gap: 12px;
  margin: 24px 0;
}
.product-detail-page .pd-highlights > div {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  color: var(--red-1);
  background: #ffffff;
  border: 1px solid #f7e1e3;
  border-radius: 14px;
  transition: transform 0.35s var(--ease), border-color 0.3s ease,
    background 0.3s ease, box-shadow 0.35s var(--ease);
}
.product-detail-page .pd-highlights > div:hover {
  transform: translateX(6px);
  background: #fff6f6;
  border-color: #f0b8bd;
  box-shadow: 0 14px 26px -20px rgba(179, 18, 31, 0.7);
}
.product-detail-page .pd-highlights > div > svg {
  flex: none;
  padding: 9px;
  box-sizing: content-box;
  border-radius: 12px;
  background: var(--red-soft);
}
.product-detail-page .pd-highlights span {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.product-detail-page .pd-highlights strong {
  color: var(--red-2);
  font-size: 13.5px;
}
.product-detail-page .pd-highlights small {
  color: var(--muted);
  font-size: 12px;
}

/* ---------- Buttons ---------- */
.product-detail-page .pd-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}
.product-detail-page .pd-primary-btn,
.product-detail-page .pd-add-cart-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 14px 24px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 14px 26px -14px rgba(179, 18, 31, 0.95);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease,
    background 0.3s ease, color 0.3s ease;
}
.product-detail-page .pd-add-cart-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: pd-sheen 4.5s ease-in-out infinite 1.5s;
}
.product-detail-page .pd-add-cart-btn:hover:not(:disabled),
.product-detail-page .pd-primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 32px -14px rgba(179, 18, 31, 1);
}
.product-detail-page .pd-add-cart-btn:active:not(:disabled),
.product-detail-page .pd-primary-btn:active {
  transform: scale(0.97);
}
.product-detail-page .pd-add-cart-btn.is-added {
  color: var(--red-2);
  background: #ffffff;
  box-shadow: inset 0 0 0 2px var(--red-1);
}
.product-detail-page .pd-add-cart-btn.is-added svg {
  animation: pd-pop 0.5s var(--ease);
}
.product-detail-page .pd-add-cart-btn:disabled {
  background: #d9c9cb;
  box-shadow: none;
  cursor: not-allowed;
}
.product-detail-page .pd-add-cart-btn:disabled::after {
  display: none;
}
/* "Continue shopping" = secondary outline style */
.product-detail-page .pd-action-buttons .pd-primary-btn {
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px solid #f0b8bd;
  box-shadow: none;
}
.product-detail-page .pd-action-buttons .pd-primary-btn:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
  box-shadow: 0 16px 28px -14px rgba(179, 18, 31, 0.95);
}
.product-detail-page .pd-action-buttons .pd-primary-btn svg {
  transition: transform 0.35s var(--ease);
}
.product-detail-page .pd-action-buttons .pd-primary-btn:hover svg {
  transform: translateX(-4px);
}

/* ---------- Section headings ---------- */
.product-detail-page .pd-specifications,
.product-detail-page .pd-related {
  margin-top: 65px;
}
.product-detail-page .pd-section-heading {
  margin-bottom: 25px;
}
.product-detail-page .pd-eyebrow {
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
.product-detail-page .pd-section-heading h2 {
  margin: 14px 0 8px;
  color: var(--red-3);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.product-detail-page .pd-section-heading h2::after {
  content: "";
  display: block;
  width: 64px;
  height: 4px;
  margin-top: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
}
.product-detail-page .pd-section-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 14.5px;
}

/* ---------- Specs ---------- */
.product-detail-page .pd-spec-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.product-detail-page .pd-spec-card {
  overflow: hidden;
  padding: 22px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 20px;
  box-shadow: 0 16px 34px -28px rgba(179, 18, 31, 0.55);
  translate: 0 0;
  opacity: 0;
  animation: pd-rise 0.7s var(--ease) forwards;
  transition: translate 0.45s var(--ease), box-shadow 0.45s var(--ease), border-color 0.3s ease;
}
.product-detail-page .pd-spec-card:nth-child(1) { animation-delay: 0.10s; }
.product-detail-page .pd-spec-card:nth-child(2) { animation-delay: 0.18s; }
.product-detail-page .pd-spec-card:nth-child(3) { animation-delay: 0.26s; }
.product-detail-page .pd-spec-card:nth-child(n+4) { animation-delay: 0.34s; }
.product-detail-page .pd-spec-card:hover {
  translate: 0 -4px;
  border-color: #f0b8bd;
  box-shadow: 0 26px 42px -28px rgba(179, 18, 31, 0.7);
}
.product-detail-page .pd-spec-card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  color: var(--red-2);
  font-size: 16px;
  font-weight: 800;
}
.product-detail-page .pd-spec-card h3 svg {
  padding: 7px;
  box-sizing: content-box;
  border-radius: 10px;
  color: var(--red-1);
  background: var(--red-soft);
}
.product-detail-page .pd-spec-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 12px 8px;
  border-top: 1px solid #f7e1e3;
  font-size: 13px;
  border-radius: 8px;
  transition: background 0.25s ease;
}
.product-detail-page .pd-spec-row:hover {
  background: #fff6f6;
}
.product-detail-page .pd-spec-label {
  color: var(--muted);
}
.product-detail-page .pd-spec-value {
  color: var(--red-3);
  font-weight: 650;
  overflow-wrap: anywhere;
}

/* ---------- Related ---------- */
.product-detail-page .pd-related-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}
.product-detail-page .pd-related-card {
  position: relative;
  display: block;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 20px;
  box-shadow: 0 14px 30px -24px rgba(179, 18, 31, 0.5);
  color: inherit;
  text-decoration: none;
  translate: 0 0;
  opacity: 0;
  animation: pd-rise 0.7s var(--ease) forwards;
  transition: translate 0.45s var(--ease), box-shadow 0.45s var(--ease), border-color 0.3s ease;
}
.product-detail-page .pd-related-card:nth-child(1) { animation-delay: 0.05s; }
.product-detail-page .pd-related-card:nth-child(2) { animation-delay: 0.12s; }
.product-detail-page .pd-related-card:nth-child(3) { animation-delay: 0.19s; }
.product-detail-page .pd-related-card:nth-child(4) { animation-delay: 0.26s; }
.product-detail-page .pd-related-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  height: 3px;
  background: linear-gradient(90deg, var(--red-2), var(--red-1), #ff6b76);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.55s var(--ease);
}
.product-detail-page .pd-related-card:hover {
  translate: 0 -6px;
  border-color: #f0b8bd;
  box-shadow: 0 28px 44px -24px rgba(179, 18, 31, 0.65);
}
.product-detail-page .pd-related-card:hover::before {
  transform: scaleX(1);
}
.product-detail-page .pd-related-card img {
  display: block;
  width: 100%;
  height: 180px;
  padding: 12px;
  object-fit: contain;
  transition: transform 0.7s var(--ease);
}
.product-detail-page .pd-related-card:hover img {
  transform: scale(1.07);
}
.product-detail-page .pd-related-card > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: #fff6f6;
  border-top: 1px dashed #f0c4c8;
}
.product-detail-page .pd-related-card strong {
  color: var(--red-3);
  font-size: 13.5px;
  line-height: 1.4;
}
.product-detail-page .pd-related-card span {
  color: var(--red-1);
  font-size: 17px;
  font-weight: 800;
}

/* ---------- States ---------- */
.product-detail-page .pd-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--muted);
  text-align: center;
  animation: pd-rise 0.6s var(--ease) both;
}
.product-detail-page .pd-error svg {
  color: var(--red-1);
}
.product-detail-page .pd-state h2 {
  margin: 0;
  color: var(--red-2);
}
.product-detail-page .pd-state p {
  margin: 0;
  font-size: 14px;
}
.product-detail-page .pd-loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f7d4d7;
  border-top-color: var(--red-1);
  border-radius: 50%;
  animation: pd-spin 0.8s linear infinite;
}

/* ---------- Footer ---------- */
.product-detail-page .pd-footer {
  padding: 32px 20px;
  text-align: center;
  background: #ffffff;
  border-top: 1px solid var(--red-line);
}
.product-detail-page .pd-footer a {
  color: var(--red-3);
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
  text-decoration: none;
}
.product-detail-page .pd-footer a span {
  color: var(--red-1);
}
.product-detail-page .pd-footer p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
}

/* ---------- Keyframes ---------- */
@keyframes pd-rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
}
@keyframes pd-slide-right {
  from { opacity: 0; transform: translateX(-30px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}
@keyframes pd-sheen {
  0%, 60% { transform: translateX(-120%); }
  100%    { transform: translateX(120%); }
}
@keyframes pd-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}
@keyframes pd-pop {
  0%   { transform: scale(0.4); }
  60%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes pd-spin {
  to { transform: rotate(360deg); }
}

/* ---------- Focus ---------- */
.product-detail-page a:focus-visible,
.product-detail-page button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

/* ---------- Responsive ---------- */
@media (max-width: 850px) {
  .product-detail-page .pd-main {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 20px;
  }
  .product-detail-page .pd-main-image,
  .product-detail-page .pd-main-image img {
    min-height: 300px;
    height: 300px;
  }
  .product-detail-page .pd-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .product-detail-page .pd-container {
    padding: 20px 14px 45px;
  }
  .product-detail-page .pd-spec-sections {
    grid-template-columns: 1fr;
  }
  .product-detail-page .pd-product-info h1 {
    font-size: 27px;
  }
  .product-detail-page .pd-price {
    font-size: 30px;
  }
  .product-detail-page .pd-spec-row {
    grid-template-columns: 0.9fr 1.1fr;
  }
  .product-detail-page .pd-related-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .product-detail-page .pd-related-card img {
    height: 135px;
  }
  .product-detail-page .pd-action-buttons {
    flex-direction: column;
  }
  .product-detail-page .pd-action-buttons > * {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-detail-page *,
  .product-detail-page *::before,
  .product-detail-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .product-detail-page .pd-product-info > *,
  .product-detail-page .pd-spec-card,
  .product-detail-page .pd-related-card {
    opacity: 1;
  }
}
`;

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function displayValue(field) {
  const value = field.value;

  if (field.type === "checkbox") {
    return value === true || value === "true" || value === 1
      ? "Yes"
      : "No";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  function handleAddToCart() {
    if (!product) return;

    addToCart(product);
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  }

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(`/products/${id}`);

        if (!data.product) {
          throw new Error("Product not found");
        }

        if (!active) return;

        setProduct(data.product);

        const allData = await apiRequest("/products");

        if (active) {
          const related = (allData.products || [])
            .filter(
              (item) =>
                String(item.id) !== String(id) &&
                (
                  item.category === data.product.category ||
                  !data.product.category
                )
            )
            .slice(0, 4);

          setRelatedProducts(related);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <style>{css}</style>
        <Navbar />
        <div className="pd-state">
          <span className="pd-loader" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <style>{css}</style>
        <Navbar />
        <div className="pd-state pd-error">
          <AlertCircle size={38} />
          <h2>Product not available</h2>
          <p>{error || "We couldn't find this product."}</p>
          <Link to="/" className="pd-primary-btn">
            Return to store
          </Link>
        </div>
      </div>
    );
  }

  const specifications = Array.isArray(product.specifications?.sections)
    ? product.specifications.sections
    : [];

  const imageUrl = `${API_URL}/products/${product.id}/image`;
  const inStock = Number(product.stock_quantity || 0) > 0;

  return (
    <div className="product-detail-page">
      <style>{css}</style>
      <Navbar />

      <main className="pd-container">
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{product.category || "Products"}</span>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>

        {/* PRODUCT OVERVIEW */}
        <section className="pd-main">
          <div className="pd-gallery">
            <div className="pd-main-image">
              {product.image_type ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              <div className="pd-image-fallback">
                <ImageOff size={45} />
                <span>Image unavailable</span>
              </div>
            </div>
          </div>

          <div className="pd-product-info">
            <div className="pd-product-category">
              {product.category || "Printer Product"}
            </div>

            <h1>{product.name}</h1>

            {(product.brand || product.model) && (
              <div className="pd-brand-model">
                {product.brand && (
                  <span>
                    Brand: <strong>{product.brand}</strong>
                  </span>
                )}

                {product.model && (
                  <span>
                    Model: <strong>{product.model}</strong>
                  </span>
                )}
              </div>
            )}

            {product.sku && (
              <p className="pd-sku">SKU: {product.sku}</p>
            )}

            <div className="pd-price-block">
              <div className="pd-price">{money(product.price)}</div>

              {product.mrp &&
                Number(product.mrp) > Number(product.price) && (
                  <div className="pd-mrp">
                    MRP: <span>{money(product.mrp)}</span>
                  </div>
                )}

              <small>Inclusive of applicable taxes</small>
            </div>

            <div
              className={`pd-stock ${
                inStock ? "available" : "unavailable"
              }`}
            >
              {inStock ? (
                <>
                  <CheckCircle2 size={17} />
                  In stock ({product.stock_quantity} available)
                </>
              ) : (
                <>
                  <AlertCircle size={17} />
                  Currently unavailable
                </>
              )}
            </div>

            {product.description && (
              <div className="pd-description">
                <h3>Product Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="pd-highlights">
              {product.warranty && (
                <div>
                  <ShieldCheck size={21} />
                  <span>
                    <strong>Warranty</strong>
                    <small>{product.warranty}</small>
                  </span>
                </div>
              )}

              <div>
                <Package size={21} />
                <span>
                  <strong>Product quality</strong>
                  <small>Printer and printing supplies</small>
                </span>
              </div>

              <div>
                <Truck size={21} />
                <span>
                  <strong>Delivery support</strong>
                  <small>Contact store for delivery details</small>
                </span>
              </div>
            </div>

            {/* CART ACTIONS */}
            <div className="pd-action-buttons">
              <button
                type="button"
                className={`pd-add-cart-btn ${addedToCart ? "is-added" : ""}`}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart size={18} />
                {!inStock
                  ? "Out of Stock"
                  : addedToCart
                    ? "Added to Cart!"
                    : "Add to Cart"}
              </button>

              <Link to="/" className="pd-primary-btn">
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>

        {/* SPECIFICATIONS */}
        {specifications.length > 0 && (
          <section className="pd-specifications">
            <div className="pd-section-heading">
              <span className="pd-eyebrow">PRODUCT INFORMATION</span>
              <h2>Technical Specifications</h2>
              <p>Detailed specifications of this product.</p>
            </div>

            <div className="pd-spec-sections">
              {specifications.map((section, sectionIndex) => (
                <div
                  className="pd-spec-card"
                  key={`${section.title}-${sectionIndex}`}
                >
                  <h3>
                    <Printer size={19} />
                    {section.title}
                  </h3>

                  <div className="pd-spec-table">
                    {(section.fields || []).map((field, fieldIndex) => (
                      <div
                        className="pd-spec-row"
                        key={`${field.label}-${fieldIndex}`}
                      >
                        <div className="pd-spec-label">
                          {field.label}
                        </div>

                        <div className="pd-spec-value">
                          {displayValue(field)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="pd-related">
            <div className="pd-section-heading">
              <span className="pd-eyebrow">EXPLORE MORE</span>
              <h2>Related Products</h2>
            </div>

            <div className="pd-related-grid">
              {relatedProducts.map((item) => (
                <Link
                  to={`/products/${item.id}`}
                  className="pd-related-card"
                  key={item.id}
                >
                  <img
                    src={`${API_URL}/products/${item.id}/image`}
                    alt={item.name}
                  />

                  <div>
                    <strong>{item.name}</strong>
                    <span>{money(item.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="pd-footer">
        <Link to="/">
          PRINT<span>STORE</span>
        </Link>
        <p>Your destination for printers and printing supplies.</p>
      </footer>
    </div>
  );
}