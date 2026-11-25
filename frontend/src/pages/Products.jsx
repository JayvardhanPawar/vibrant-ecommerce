import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ShoppingCart,
  Package,
  RefreshCw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { apiRequest, API_URL } from "../services/api";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";

const css = `
.products-page {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fff6f6 0%, #ffffff 380px);
  color: var(--ink);
}
.products-page *,
.products-page *::before,
.products-page *::after {
  box-sizing: border-box;
}

.products-page .products-container {
  display: block;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 35px 5% 70px;
}

/* ---------- Heading ---------- */
.products-page .products-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  animation: pr-rise 0.8s var(--ease) both;
}
.products-page .products-eyebrow {
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
.products-page .products-heading h1 {
  margin: 14px 0 8px;
  color: var(--red-3);
  font-size: clamp(1.8rem, 3.4vw, 2.5rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.products-page .products-heading h1::after {
  content: "";
  display: block;
  width: 64px;
  height: 4px;
  margin-top: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
  transform-origin: left;
  animation: pr-underline 0.9s var(--ease) 0.3s both;
}
.products-page .products-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}
.products-page .products-heading-icon {
  flex: none;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  box-shadow: 0 16px 28px -12px rgba(179, 18, 31, 0.8);
  animation: pr-float 5s ease-in-out infinite;
}

.products-page .products-mobile-search {
  display: none;
}

/* ---------- Layout ---------- */
.products-page .products-layout {
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr);
  align-items: start;
  gap: 25px;
}

/* ---------- Sidebar ---------- */
.products-page .products-sidebar {
  position: sticky;
  top: 140px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-top: 3px solid var(--red-1);
  border-radius: 18px;
  box-shadow: 0 20px 40px -30px rgba(179, 18, 31, 0.55);
  animation: pr-slide-left 0.8s var(--ease) 0.1s both;
}
.products-page .filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f7e1e3;
}
.products-page .filter-heading h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--red-2);
  font-size: 16px;
  font-weight: 800;
}
.products-page .filter-heading button {
  padding: 5px 11px;
  border: 1px solid #f0b8bd;
  border-radius: 999px;
  background: #ffffff;
  color: var(--red-2);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.products-page .filter-heading button:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
}
.products-page .filter-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 16px 0;
  border-bottom: 1px solid #f7e1e3;
}
.products-page .filter-group label {
  color: var(--red-3);
  font-size: 12px;
  font-weight: 750;
}
.products-page .filter-group select,
.products-page .price-inputs input,
.products-page .products-sort select {
  width: 100%;
  height: 41px;
  padding: 0 12px;
  border: 1.5px solid var(--red-line);
  border-radius: 10px;
  outline: none;
  background-color: #fff6f6;
  color: var(--ink);
  font-family: inherit;
  font-size: 12.5px;
  transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.35s var(--ease);
}
.products-page .filter-group select,
.products-page .products-sort select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 32px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e11d2e' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
}
.products-page .filter-group select:hover,
.products-page .price-inputs input:hover,
.products-page .products-sort select:hover {
  border-color: #eba5ab;
}
.products-page .filter-group select:focus,
.products-page .price-inputs input:focus,
.products-page .products-sort select:focus {
  border-color: var(--red-1);
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.12);
}
.products-page .price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.products-page .price-inputs input {
  min-width: 0;
}
.products-page .clear-filter-button {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  width: 100%;
  height: 43px;
  margin-top: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px solid #f0b8bd;
  border-radius: 12px;
  background: #ffffff;
  color: var(--red-2);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.products-page .clear-filter-button::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s var(--ease);
}
.products-page .clear-filter-button:hover {
  color: #ffffff;
  border-color: transparent;
}
.products-page .clear-filter-button:hover::before {
  transform: scaleX(1);
}
.products-page .clear-filter-button svg {
  transition: transform 0.5s var(--ease);
}
.products-page .clear-filter-button:hover svg {
  transform: rotate(180deg);
}

/* ---------- Toolbar ---------- */
.products-page .products-toolbar {
  min-height: 76px;
  margin-bottom: 18px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 18px;
  box-shadow: 0 20px 40px -32px rgba(179, 18, 31, 0.55);
  animation: pr-rise 0.8s var(--ease) 0.15s both;
}
.products-page .products-toolbar h2 {
  margin: 0 0 5px;
  color: var(--red-2);
  font-size: 18px;
  font-weight: 800;
}
.products-page .products-toolbar p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}
.products-page .products-toolbar p strong {
  color: var(--red-1);
  font-weight: 800;
}
.products-page .products-sort {
  display: flex;
  align-items: center;
  gap: 10px;
}
.products-page .products-sort label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.products-page .products-sort select {
  width: auto;
  min-width: 170px;
}

/* ---------- Product grid ---------- */
.products-page .products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.products-page .catalog-product-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 20px;
  box-shadow: 0 14px 30px -24px rgba(179, 18, 31, 0.5);
  /* "translate" keeps hover lift independent from the entrance animation */
  translate: 0 0;
  opacity: 0;
  animation: pr-card-in 0.65s var(--ease) forwards;
  animation-delay: calc(min(var(--i, 0), 8) * 60ms + 80ms);
  transition: translate 0.45s var(--ease), box-shadow 0.45s var(--ease),
    border-color 0.3s ease;
}
.products-page .catalog-product-card::before {
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
.products-page .catalog-product-card:hover {
  translate: 0 -6px;
  border-color: #f0b8bd;
  box-shadow: 0 28px 44px -24px rgba(179, 18, 31, 0.65);
}
.products-page .catalog-product-card:hover::before {
  transform: scaleX(1);
}
.products-page .catalog-product-image {
  height: 205px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #ffffff;
  border-bottom: 1px solid #f7e1e3;
  text-decoration: none;
}
.products-page .catalog-product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.7s var(--ease);
}
.products-page .catalog-product-card:hover .catalog-product-image img {
  transform: scale(1.07);
}
.products-page .products-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 12px;
  color: #d49aa0;
  background: #fff6f6;
  font-size: 11px;
}
.products-page .catalog-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.products-page .catalog-product-category {
  align-self: flex-start;
  margin-bottom: 9px;
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--red-2);
  background: var(--red-soft);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.products-page .catalog-product-name {
  min-height: 40px;
  display: block;
  color: var(--red-3);
  font-size: 13.5px;
  font-weight: 750;
  line-height: 1.5;
  text-decoration: none;
  transition: color 0.25s ease;
}
.products-page .catalog-product-name:hover {
  color: var(--red-1);
}
.products-page .catalog-product-meta {
  min-height: 15px;
  margin: 6px 0;
  color: var(--muted);
  font-size: 11px;
}
.products-page .catalog-product-pricing {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}
.products-page .catalog-product-pricing strong {
  color: var(--red-2);
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: transform 0.4s var(--ease);
  transform-origin: left center;
}
.products-page .catalog-product-card:hover .catalog-product-pricing strong {
  transform: scale(1.06);
}
.products-page .catalog-product-pricing del {
  color: #b79ca0;
  font-size: 12px;
}
.products-page .catalog-stock {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 10px 0 0;
  font-size: 11.5px;
  font-weight: 700;
}
.products-page .catalog-stock::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.products-page .catalog-stock.in-stock {
  color: var(--red-1);
}
.products-page .catalog-stock.in-stock::before {
  animation: pr-dot 2s ease-in-out infinite;
}
.products-page .catalog-stock.out-stock {
  color: #a8999b;
}
.products-page .catalog-warranty {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 11px;
}
.products-page .catalog-add-cart {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 43px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  color: #ffffff;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 750;
  cursor: pointer;
  box-shadow: 0 12px 22px -12px rgba(179, 18, 31, 0.9);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease, background 0.3s ease;
}
.products-page .catalog-product-info > .catalog-warranty + .catalog-add-cart,
.products-page .catalog-product-info > .catalog-stock + .catalog-add-cart {
  margin-top: 14px;
}
.products-page .catalog-add-cart::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.7s var(--ease);
}
.products-page .catalog-add-cart:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 26px -12px rgba(179, 18, 31, 1);
}
.products-page .catalog-add-cart:hover:not(:disabled)::after {
  transform: translateX(120%);
}
.products-page .catalog-add-cart:active:not(:disabled) {
  transform: scale(0.97);
}
.products-page .catalog-add-cart.is-added {
  color: var(--red-2);
  background: #ffffff;
  box-shadow: inset 0 0 0 2px var(--red-1);
}
.products-page .catalog-add-cart.is-added svg {
  animation: pr-pop 0.5s var(--ease);
}
.products-page .catalog-add-cart:disabled {
  color: #ffffff;
  background: #d9c9cb;
  box-shadow: none;
  cursor: not-allowed;
}

/* ---------- States ---------- */
.products-page .products-state {
  min-height: 300px;
  padding: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px dashed #eba5ab;
  border-radius: 20px;
  background: #fff9f9;
  color: var(--red-1);
  text-align: center;
  animation: pr-rise 0.6s var(--ease) both;
}
.products-page .products-state h3 {
  margin: 0;
  color: var(--red-2);
  font-size: 18px;
  font-weight: 800;
}
.products-page .products-state p {
  margin: 0;
  color: var(--muted);
  font-size: 13.5px;
}
.products-page .products-state button {
  padding: 11px 20px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  color: #ffffff;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 22px -12px rgba(179, 18, 31, 0.9);
  transition: transform 0.3s var(--ease);
}
.products-page .products-state button:hover {
  transform: translateY(-2px);
}
.products-page .products-loader {
  width: 38px;
  height: 38px;
  border: 3px solid #f7d4d7;
  border-top-color: var(--red-1);
  border-radius: 50%;
  animation: pr-spin 0.8s linear infinite;
}

/* ---------- Keyframes ---------- */
@keyframes pr-rise {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
}
@keyframes pr-slide-left {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: none; }
}
@keyframes pr-card-in {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
@keyframes pr-underline {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes pr-float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50%      { transform: translateY(-6px) rotate(-4deg); }
}
@keyframes pr-dot {
  0%   { box-shadow: 0 0 0 0 rgba(225, 29, 46, 0.5); }
  70%  { box-shadow: 0 0 0 7px rgba(225, 29, 46, 0); }
  100% { box-shadow: 0 0 0 0 rgba(225, 29, 46, 0); }
}
@keyframes pr-pop {
  0%   { transform: scale(0.4); }
  60%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes pr-spin {
  to { transform: rotate(360deg); }
}

/* ---------- Focus ---------- */
.products-page a:focus-visible,
.products-page button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

/* ---------- Responsive ---------- */
@media (max-width: 1100px) {
  .products-page .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .products-page .products-layout {
    grid-template-columns: 1fr;
  }
  .products-page .products-sidebar {
    position: static;
  }
}

@media (max-width: 760px) {
  .products-page .products-container {
    padding: 25px 16px 45px;
  }
  .products-page .products-heading-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }
  .products-page .products-mobile-search {
    height: 46px;
    margin-bottom: 17px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 9px;
    border: 1.5px solid var(--red-line);
    border-radius: 12px;
    background: #fff6f6;
    color: var(--red-1);
    transition: border-color 0.3s ease, box-shadow 0.35s var(--ease), background 0.3s ease;
  }
  .products-page .products-mobile-search:focus-within {
    border-color: var(--red-1);
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.12);
  }
  .products-page .products-mobile-search input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--red-3);
    font-family: inherit;
    font-size: 13px;
  }
  .products-page .products-mobile-search input::placeholder {
    color: #b48a8f;
  }
  .products-page .products-sidebar {
    padding: 15px;
  }
  .products-page .products-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .products-page .products-sort {
    width: 100%;
    justify-content: space-between;
  }
  .products-page .products-sort select {
    flex: 1;
    max-width: 220px;
  }
  .products-page .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 11px;
  }
  .products-page .catalog-product-image {
    height: 155px;
    padding: 12px;
  }
  .products-page .catalog-product-info {
    padding: 12px;
  }
  .products-page .catalog-product-name {
    font-size: 12.5px;
  }
  .products-page .catalog-product-pricing strong {
    font-size: 16px;
  }
}

@media (max-width: 380px) {
  .products-page .products-grid {
    grid-template-columns: 1fr;
  }
  .products-page .catalog-product-image {
    height: 190px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .products-page *,
  .products-page *::before,
  .products-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .products-page .catalog-product-card {
    opacity: 1;
  }
}
`;

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function getProductText(product) {
  return [
    product.name,
    product.description,
    product.category,
    product.brand,
    product.model,
    product.sku,
    JSON.stringify(product.specifications || {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getUniqueValues(products, field) {
  return [
    ...new Set(
      products
        .map((product) => product[field])
        .filter((value) => value && String(value).trim())
        .map(String)
    ),
  ].sort((a, b) => a.localeCompare(b));
}

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);

  if (!product.image_type || failed) {
    return (
      <div className="products-image-placeholder">
        <Package size={42} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={`${API_URL}/products/${product.id}/image`}
      alt={product.name}
      onError={() => setFailed(true)}
    />
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );
  const [brand, setBrand] = useState("");
  const [technology, setTechnology] = useState("");
  const [printerType, setPrinterType] = useState("");
  const [format, setFormat] = useState("");
  const [functionType, setFunctionType] = useState("");
  const [availability, setAvailability] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/products");

        if (active) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load products.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Keep filters in sync with navbar category/search links.
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const categories = useMemo(
    () => getUniqueValues(products, "category"),
    [products]
  );

  const brands = useMemo(
    () => getUniqueValues(products, "brand"),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((product) =>
        getProductText(product).includes(query)
      );
    }

    if (category) {
      result = result.filter(
        (product) =>
          String(product.category || "").toLowerCase() ===
          category.toLowerCase()
      );
    }

    if (brand) {
      result = result.filter(
        (product) =>
          String(product.brand || "").toLowerCase() ===
          brand.toLowerCase()
      );
    }

    if (technology) {
      result = result.filter((product) =>
        getProductText(product).includes(technology.toLowerCase())
      );
    }

    if (printerType) {
      result = result.filter((product) =>
        getProductText(product).includes(printerType.toLowerCase())
      );
    }

    if (format) {
      result = result.filter((product) =>
        getProductText(product).includes(format.toLowerCase())
      );
    }

    if (functionType) {
      result = result.filter((product) =>
        getProductText(product).includes(functionType.toLowerCase())
      );
    }

    if (availability === "in-stock") {
      result = result.filter(
        (product) => Number(product.stock_quantity || 0) > 0
      );
    }

    if (availability === "out-of-stock") {
      result = result.filter(
        (product) => Number(product.stock_quantity || 0) <= 0
      );
    }

    if (minPrice !== "") {
      result = result.filter(
        (product) => Number(product.price || 0) >= Number(minPrice)
      );
    }

    if (maxPrice !== "") {
      result = result.filter(
        (product) => Number(product.price || 0) <= Number(maxPrice)
      );
    }

    switch (sort) {
      case "price-low":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name":
        result.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
        break;
      case "newest":
      default:
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return result;
  }, [
    products,
    search,
    category,
    brand,
    technology,
    printerType,
    format,
    functionType,
    availability,
    minPrice,
    maxPrice,
    sort,
  ]);

  function updateCategory(value) {
    setCategory(value);
    const next = new URLSearchParams(searchParams);

    if (value) next.set("category", value);
    else next.delete("category");

    setSearchParams(next);
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setBrand("");
    setTechnology("");
    setPrinterType("");
    setFormat("");
    setFunctionType("");
    setAvailability("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setSearchParams({});
  }

  function handleAddToCart(product) {
    addToCart(product);
    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1800);
  }

  return (
    <div className="products-page">
      <style>{css}</style>
      <Navbar />

      <main className="products-container">
        <div className="products-heading">
          <div>
            <span className="products-eyebrow">PRINTSTORE CATALOGUE</span>
            <h1>Explore Products</h1>
            <p>
              Find printers, toners, cartridges and printing accessories.
            </p>
          </div>

          <div className="products-heading-icon">
            <Package size={30} />
          </div>
        </div>

        <form
          className="products-mobile-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product, brand or model..."
          />
        </form>

        <div className="products-layout">
          {/* FILTER SIDEBAR */}
          <aside className="products-sidebar">
            <div className="filter-heading">
              <h2>
                <SlidersHorizontal size={18} />
                Filters
              </h2>

              <button type="button" onClick={clearFilters}>
                Clear all
              </button>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-category">Category</label>
              <select
                id="filter-category"
                value={category}
                onChange={(event) => updateCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-brand">Brand</label>
              <select
                id="filter-brand"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
              >
                <option value="">All brands</option>
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-technology">Technology</label>
              <select
                id="filter-technology"
                value={technology}
                onChange={(event) => setTechnology(event.target.value)}
              >
                <option value="">All technologies</option>
                <option value="laser">Laser</option>
                <option value="inkjet">Inkjet</option>
                <option value="barcode">Barcode</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-type">Printer type</label>
              <select
                id="filter-type"
                value={printerType}
                onChange={(event) => setPrinterType(event.target.value)}
              >
                <option value="">All types</option>
                <option value="colour">Colour</option>
                <option value="color">Color</option>
                <option value="mono">Mono</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-format">Paper format</label>
              <select
                id="filter-format"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="">All formats</option>
                <option value="a3">A3</option>
                <option value="a4">A4</option>
                <option value="a3 a4">A3 / A4</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-function">Function</label>
              <select
                id="filter-function"
                value={functionType}
                onChange={(event) => setFunctionType(event.target.value)}
              >
                <option value="">All functions</option>
                <option value="single function">Single Function</option>
                <option value="multifunction">Multifunction</option>
                <option value="multi function">Multi Function</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-stock">Availability</label>
              <select
                id="filter-stock"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
              >
                <option value="">All products</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price range</label>

              <div className="price-inputs">
                <input
                  type="number"
                  min="0"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              <RefreshCw size={15} />
              Reset Filters
            </button>
          </aside>

          {/* PRODUCT RESULTS */}
          <section className="products-results">
            <div className="products-toolbar">
              <div>
                <h2>All Products</h2>
                <p>
                  Showing <strong>{filteredProducts.length}</strong> of{" "}
                  <strong>{products.length}</strong> products
                </p>
              </div>

              <div className="products-sort">
                <label htmlFor="products-sort">Sort by</label>
                <select
                  id="products-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="products-state">
                <span className="products-loader" />
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="products-state products-error">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="products-state">
                <Package size={42} />
                <h3>No products found</h3>
                <p>Try changing your search or filters.</p>
                <button type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product, index) => {
                  const inStock =
                    Number(product.stock_quantity || 0) > 0;

                  return (
                    <article
                      className="catalog-product-card"
                      key={product.id}
                      style={{ "--i": index }}
                    >
                      <Link
                        to={`/products/${product.id}`}
                        className="catalog-product-image"
                      >
                        <ProductImage product={product} />
                      </Link>

                      <div className="catalog-product-info">
                        <span className="catalog-product-category">
                          {product.category || "Printer Product"}
                        </span>

                        <Link
                          to={`/products/${product.id}`}
                          className="catalog-product-name"
                        >
                          {product.name}
                        </Link>

                        {(product.brand || product.model) && (
                          <p className="catalog-product-meta">
                            {[product.brand, product.model]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        <div className="catalog-product-pricing">
                          <strong>{money(product.price)}</strong>

                          {product.mrp &&
                            Number(product.mrp) > Number(product.price) && (
                              <del>{money(product.mrp)}</del>
                            )}
                        </div>

                        <p
                          className={`catalog-stock ${
                            inStock ? "in-stock" : "out-stock"
                          }`}
                        >
                          {inStock
                            ? `${product.stock_quantity} in stock`
                            : "Out of stock"}
                        </p>

                        {product.warranty && (
                          <p className="catalog-warranty">
                            Warranty: {product.warranty}
                          </p>
                        )}

                        <button
                          type="button"
                          className={`catalog-add-cart ${
                            addedProductId === product.id ? "is-added" : ""
                          }`}
                          disabled={!inStock}
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart size={17} />
                          {!inStock
                            ? "Out of Stock"
                            : addedProductId === product.id
                              ? "Added to Cart"
                              : "Add to Cart"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}