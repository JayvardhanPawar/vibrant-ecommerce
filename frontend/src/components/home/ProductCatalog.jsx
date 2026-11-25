import { RefreshCw } from "lucide-react";
import CatalogToolbar from "./CatalogToolbar";
import ProductGridItem from "./ProductGridItem";
import { LoadingState, ErrorState, EmptyState } from "./CatalogStates";

const css = `
.store-catalog-section {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  max-width: 1240px;
  margin: 0 auto;
  padding: 48px 16px 40px;
  animation: catalog-in 0.8s var(--ease) both;
}

/* ---------- Heading row ---------- */
.store-catalog-section .store-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}
.store-catalog-section .store-eyebrow {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--red-2);
  background: #fdecee;
  border: 1px solid #f7c9ce;
}
.store-catalog-section h2 {
  position: relative;
  display: inline-block;
  margin: 14px 0 10px;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--red-2);
}
.store-catalog-section h2::after {
  content: "";
  display: block;
  height: 4px;
  width: 64px;
  margin-top: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
  transform-origin: left;
  animation: underline-grow 0.9s var(--ease) 0.3s both;
}
.store-catalog-section .store-section-heading p {
  margin: 0;
  max-width: 480px;
  font-size: 1rem;
  line-height: 1.6;
  color: #7c5b5f;
}

/* ---------- Refresh button ---------- */
.store-refresh-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px solid #f0b8bd;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.3s var(--ease), background 0.3s ease,
    color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.store-refresh-btn:hover:not(:disabled) {
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -12px rgba(179, 18, 31, 0.8);
}
.store-refresh-btn:hover:not(:disabled) svg {
  transform: rotate(180deg);
}
.store-refresh-btn svg {
  transition: transform 0.5s var(--ease);
}
.store-refresh-btn:active:not(:disabled) {
  transform: scale(0.97);
}
.store-refresh-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}
.store-refresh-btn:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}
.store-refresh-btn .store-spinning {
  animation: catalog-spin 0.8s linear infinite;
}

/* ---------- Results line ---------- */
.store-results-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 22px 0 18px;
  padding: 7px 14px;
  font-size: 13.5px;
  color: #7c5b5f;
  background: #fff6f6;
  border: 1px solid #f7d9dc;
  border-radius: 999px;
  animation: catalog-in 0.5s var(--ease) both;
}
.store-results-line strong {
  color: var(--red-1);
  font-weight: 800;
}

/* ---------- Product grid: staggered entrance ---------- */
.store-product-grid > * {
  opacity: 0;
  transform: translateY(22px) scale(0.98);
  animation: product-in 0.65s var(--ease) forwards;
}
.store-product-grid > *:nth-child(1)  { animation-delay: 0.03s; }
.store-product-grid > *:nth-child(2)  { animation-delay: 0.08s; }
.store-product-grid > *:nth-child(3)  { animation-delay: 0.13s; }
.store-product-grid > *:nth-child(4)  { animation-delay: 0.18s; }
.store-product-grid > *:nth-child(5)  { animation-delay: 0.23s; }
.store-product-grid > *:nth-child(6)  { animation-delay: 0.28s; }
.store-product-grid > *:nth-child(7)  { animation-delay: 0.33s; }
.store-product-grid > *:nth-child(8)  { animation-delay: 0.38s; }
.store-product-grid > *:nth-child(n+9) { animation-delay: 0.42s; }

@keyframes catalog-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
@keyframes underline-grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes product-in {
  to { opacity: 1; transform: none; }
}
@keyframes catalog-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .store-catalog-section { padding-top: 36px; }
  .store-catalog-section .store-heading-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .store-catalog-section,
  .store-catalog-section *,
  .store-catalog-section *::after {
    animation: none !important;
    transition: none !important;
  }
  .store-product-grid > * {
    opacity: 1;
    transform: none;
  }
}
`;

export default function ProductCatalog({
  products,
  filteredProducts,
  loading,
  refreshing,
  error,
  search,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
  onRefresh,
  onRetry,
}) {
  function renderBody() {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={onRetry} />;

    if (filteredProducts.length === 0) {
      return (
        <EmptyState
          hasProducts={products.length > 0}
          hasFilters={Boolean(search) || activeCategory !== "All"}
          onClearFilters={onClearFilters}
        />
      );
    }

    return (
      <>
        <div className="store-results-line">
          Showing <strong>{filteredProducts.length}</strong> product
          {filteredProducts.length === 1 ? "" : "s"}
        </div>

        <div className="store-product-grid">
          {filteredProducts.map((product) => (
            <ProductGridItem
              key={product.id}
              product={product}
              linked
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <section className="store-catalog-section" id="product-catalog">
        <div className="store-section-heading store-heading-row">
          <div>
            <span className="store-eyebrow">OUR PRODUCT RANGE</span>
            <h2>
              {activeCategory === "All" ? "Explore products" : activeCategory}
            </h2>
            <p>Search our printer and printing supplies collection.</p>
          </div>

          <button
            className="store-refresh-btn"
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "store-spinning" : ""}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        <CatalogToolbar
          search={search}
          onSearchChange={onSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />

        {renderBody()}
      </section>
    </>
  );
}