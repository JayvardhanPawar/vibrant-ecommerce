import { useState } from "react";
import { Link } from "react-router-dom";
import { money } from "./homeData";
import { API_URL } from "../../services/api";

// If your images are served by a backend (e.g. "uploads/a.jpg"), set its
// origin here, e.g. "http://localhost:5000". Leave "" for same-origin.
const IMAGE_BASE = "";

// If you know the exact field that holds the image, put its name here,
// e.g. "mainImage" or "photoUrl". Leave "" to auto-detect.
const IMAGE_FIELD = "";

const css = `
.store-product-item {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --ink: #2a1215;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border: 1px solid #f3d3d6;
  border-radius: 20px;
  box-shadow: 0 14px 30px -24px rgba(179, 18, 31, 0.5);
  /* "translate" (not "transform") so the hover lift works alongside
     the entrance animation used by the catalog grid */
  translate: 0 0;
  transition: translate 0.45s var(--ease), box-shadow 0.45s var(--ease),
    border-color 0.3s ease;
}
.store-product-item::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 3;
  height: 3px;
  background: linear-gradient(90deg, var(--red-2), var(--red-1), #ff6b76);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.55s var(--ease);
}
.store-product-item:hover,
.store-product-item:focus-within {
  translate: 0 -6px;
  border-color: #f0b8bd;
  box-shadow: 0 28px 44px -24px rgba(179, 18, 31, 0.65);
}
.store-product-item:hover::before,
.store-product-item:focus-within::before {
  transform: scaleX(1);
}

.store-product-link {
  display: flex;
  flex-direction: column;
  flex: 1;
  color: inherit;
  text-decoration: none;
  outline: none;
}
.store-product-link:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: -3px;
  border-radius: 20px;
}

/* ---------- Image ---------- */
.store-product-media {
  position: relative;
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 40%, #ffffff 0%, #fff1f2 100%);
}
.store-product-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 18px;
  box-sizing: border-box;
  transition: transform 0.7s var(--ease);
}
.store-product-item:hover .store-product-media img {
  transform: scale(1.06);
}
.store-product-placeholder {
  font-size: 44px;
  font-weight: 800;
  color: #f0b8bd;
}

.store-badges {
  position: absolute;
  top: 12px; left: 12px; right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  z-index: 2;
}
.store-badge {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}
.store-badge-cat {
  color: var(--red-2);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #f7c9ce;
  backdrop-filter: blur(4px);
}
.store-badge-off {
  color: #fff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  box-shadow: 0 6px 14px -6px rgba(179, 18, 31, 0.8);
}

/* ---------- Body ---------- */
.store-product-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  padding: 16px 18px 14px;
}
.store-product-brand {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--red-1);
}
.store-product-name {
  margin: 0;
  font-size: 1.02rem;
  line-height: 1.35;
  font-weight: 700;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}
.store-product-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.store-product-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.store-chip {
  padding: 4px 9px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--red-2);
  background: #fff6f6;
  border: 1px solid #f7d9dc;
  border-radius: 8px;
}
.store-product-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--muted);
}
.store-stars { color: #f5a524; letter-spacing: 1px; }

/* ---------- Footer ---------- */
.store-product-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px 16px;
  margin-top: auto;
  background: #fff6f6;
  border-top: 1px dashed #f0c4c8;
}
.store-price-now {
  display: block;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--red-2);
  line-height: 1.1;
}
.store-price-old {
  font-size: 12.5px;
  color: #b49a9d;
  text-decoration: line-through;
  margin-right: 6px;
}
.store-price-save {
  font-size: 12px;
  font-weight: 700;
  color: #15803d;
}
.store-stock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #15803d;
}
.store-stock::before {
  content: "";
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.store-stock.is-out { color: #b3121f; }

.store-product-cta {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 999px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}
.store-product-cta span { transition: transform 0.3s var(--ease); }
.store-product-item:hover .store-product-cta {
  box-shadow: 0 12px 20px -10px rgba(179, 18, 31, 0.85);
}
.store-product-item:hover .store-product-cta span {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .store-product-item,
  .store-product-item *,
  .store-product-item::before {
    transition: none !important;
  }
  .store-product-item:hover { translate: 0 0; }
}
`;

function pick(product, keys) {
  for (const k of keys) {
    const v = product?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

// Turns many possible shapes into a single URL string:
// "url", { url }, { src }, ["url"], [{ url }], etc.
function toUrl(v) {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return toUrl(v[0]);
  if (typeof v === "object") {
    return toUrl(
      v.url || v.src || v.secure_url || v.path || v.image || v.imageUrl
    );
  }
  return undefined;
}

const IMG_EXT = /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i;
const IMG_KEY = /(image|img|photo|pic|thumb|cover|media|gallery|file)/i;

// Last-resort scan: look through every field (and nested objects/arrays)
// for something that looks like an image.
function scanForImage(value, depth = 0) {
  if (!value || depth > 3) return undefined;
  if (typeof value === "string") return IMG_EXT.test(value) ? value : undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = scanForImage(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof value === "object") {
    // Fields whose name hints at an image come first
    const entries = Object.entries(value).sort(
      ([a], [b]) => Number(IMG_KEY.test(b)) - Number(IMG_KEY.test(a))
    );
    for (const [key, v] of entries) {
      if (IMG_KEY.test(key)) {
        const direct = toUrl(v);
        if (direct) return direct;
      }
      const found = scanForImage(v, depth + 1);
      if (found) return found;
    }
  }
  return undefined;
}

function resolveImage(product) {
  const raw =
    (IMAGE_FIELD && toUrl(product?.[IMAGE_FIELD])) ||
    toUrl(
      pick(product, [
        "image",
        "imageUrl",
        "image_url",
        "img",
        "photo",
        "picture",
        "thumbnail",
        "images",
        "gallery",
        "photos",
      ])
    ) || scanForImage(product);
  if (!raw) return undefined;
  if (/^(https?:|data:|blob:|\/\/)/i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${IMAGE_BASE}${path}`;
}

function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="store-product-placeholder">
        {String(name).charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function CardContent({ product }) {
  const name = pick(product, ["name", "title"]) || "Untitled product";
  const image = product.image_type
  ? `${API_URL}/products/${product.id}/image`
  : resolveImage(product);
  const category = pick(product, ["category"]);
  const brand = pick(product, ["brand", "manufacturer"]);
  const description = pick(product, ["shortDescription", "description"]);
  const price = Number(product.price);
  const oldPrice = Number(pick(product, ["mrp", "originalPrice", "oldPrice"]));
  const hasDiscount = oldPrice > price && price > 0;
  const percentOff = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const rating = Number(product.rating);
  const reviews = pick(product, ["reviews", "reviewCount"]);
  const stock = pick(product, ["stock", "quantity"]);
  const inStock =
    product.inStock !== undefined
      ? Boolean(product.inStock)
      : stock !== undefined
      ? Number(stock) > 0
      : true;

  // Spec chips: use product.specs / tags if present (array of strings)
  const chips = (
    Array.isArray(product.specs)
      ? product.specs
      : Array.isArray(product.tags)
      ? product.tags
      : []
  ).slice(0, 3);

  return (
    <>
      <div className="store-product-media">
        <ProductImage src={image} name={name} />
        {/* Debug: uncomment to see what the card received */}
        {/* {console.log("product image fields", product)} */}
        <div className="store-badges">
          {category ? (
            <span className="store-badge store-badge-cat">{category}</span>
          ) : (
            <span />
          )}
          {hasDiscount && (
            <span className="store-badge store-badge-off">
              {percentOff}% OFF
            </span>
          )}
        </div>
      </div>

      <div className="store-product-body">
        {brand && <span className="store-product-brand">{brand}</span>}
        <h3 className="store-product-name">{name}</h3>
        {description && <p className="store-product-desc">{description}</p>}

        {chips.length > 0 && (
          <div className="store-product-chips">
            {chips.map((c) => (
              <span className="store-chip" key={c}>
                {c}
              </span>
            ))}
          </div>
        )}

        {rating > 0 && (
          <div className="store-product-rating">
            <span className="store-stars" aria-hidden="true">
              {"★".repeat(Math.round(rating))}
              {"☆".repeat(5 - Math.round(rating))}
            </span>
            <span>
              {rating.toFixed(1)}
              {reviews ? ` (${reviews})` : ""}
            </span>
          </div>
        )}
      </div>

      <div className="store-product-foot">
        <div>
          <strong className="store-price-now">{money(price)}</strong>
          {hasDiscount && (
            <div>
              <span className="store-price-old">{money(oldPrice)}</span>
              <span className="store-price-save">
                Save {money(oldPrice - price)}
              </span>
            </div>
          )}
          <span className={`store-stock${inStock ? "" : " is-out"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        <span className="store-product-cta">
          View <span aria-hidden="true">→</span>
        </span>
      </div>
    </>
  );
}

export default function ProductGridItem({ product, linked = false }) {
  const content = <CardContent product={product} />;

  return (
    // <style> lives inside the item so the grid's direct children stay 1:1
    // with products (keeps the catalog's staggered animation correct).
    <div className="store-product-item">
      <style>{css}</style>
      {linked ? (
        <Link to={`/products/${product.id}`} className="store-product-link">
          {content}
        </Link>
      ) : (
        <div className="store-product-link">{content}</div>
      )}
    </div>
  );
}