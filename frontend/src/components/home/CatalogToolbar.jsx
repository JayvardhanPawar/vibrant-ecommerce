import { Search } from "lucide-react";
import { categories } from "./homeData";

const css = `
.store-catalog-tools {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #f3d3d6;
  border-radius: 22px;
  box-shadow: 0 20px 40px -30px rgba(179, 18, 31, 0.55);
  animation: tools-in 0.7s var(--ease) 0.1s both;
}

/* ---------- Search ---------- */
.store-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px 0 18px;
  height: 54px;
  background: #fff6f6;
  border: 1.5px solid #f3d3d6;
  border-radius: 16px;
  cursor: text;
  transition: border-color 0.3s ease, background 0.3s ease,
    box-shadow 0.4s var(--ease);
}
.store-search svg {
  flex: none;
  color: var(--red-1);
  transition: transform 0.4s var(--ease);
}
.store-search:hover {
  border-color: #eba5ab;
}
.store-search:focus-within {
  background: #ffffff;
  border-color: var(--red-1);
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.14),
    0 14px 26px -16px rgba(225, 29, 46, 0.6);
}
.store-search:focus-within svg {
  transform: scale(1.15) rotate(-8deg);
}
.store-search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  font-family: inherit;
  font-size: 15px;
  color: var(--red-3);
  background: transparent;
  border: 0;
  outline: none;
}
.store-search input::placeholder {
  color: #b48a8f;
}
/* hide the browser's native clear "x" — we have our own button */
.store-search input[type="search"]::-webkit-search-cancel-button,
.store-search input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.store-search button {
  flex: none;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--red-2);
  background: #ffffff;
  border: 1px solid #f0b8bd;
  border-radius: 999px;
  cursor: pointer;
  animation: clear-in 0.3s var(--ease) both;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s var(--ease);
}
.store-search button:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
}
.store-search button:active {
  transform: scale(0.95);
}
.store-search button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 2px;
}

/* ---------- Filter pills ---------- */
.store-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.store-filter-pills button {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px solid #f0b8bd;
  border-radius: 999px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  animation: pill-in 0.5s var(--ease) forwards;
  transition: color 0.3s ease, border-color 0.3s ease, box-shadow 0.35s var(--ease),
    translate 0.3s var(--ease);
}
.store-filter-pills button:nth-child(1) { animation-delay: 0.20s; }
.store-filter-pills button:nth-child(2) { animation-delay: 0.26s; }
.store-filter-pills button:nth-child(3) { animation-delay: 0.32s; }
.store-filter-pills button:nth-child(4) { animation-delay: 0.38s; }
.store-filter-pills button:nth-child(5) { animation-delay: 0.44s; }
.store-filter-pills button:nth-child(6) { animation-delay: 0.50s; }
.store-filter-pills button:nth-child(n+7) { animation-delay: 0.56s; }

/* Red fill that sweeps in from the left */
.store-filter-pills button::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s var(--ease);
}
.store-filter-pills button:hover {
  translate: 0 -2px;
  border-color: var(--red-1);
  color: #ffffff;
}
.store-filter-pills button:hover::before {
  transform: scaleX(1);
}
.store-filter-pills button:active {
  translate: 0 0;
}
.store-filter-pills button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

/* Selected pill */
.store-filter-pills button.is-active {
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 14px 24px -12px rgba(179, 18, 31, 0.85);
}
.store-filter-pills button.is-active::before {
  transform: scaleX(1);
}

@keyframes tools-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
@keyframes pill-in {
  to { opacity: 1; transform: none; }
}
@keyframes clear-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: none; }
}

@media (max-width: 640px) {
  .store-catalog-tools { padding: 14px; border-radius: 18px; }
  .store-search { height: 50px; }
  /* pills become one horizontal swipeable row */
  .store-filter-pills {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -14px;
    padding: 4px 14px 8px;
    scrollbar-width: none;
  }
  .store-filter-pills::-webkit-scrollbar { display: none; }
  .store-filter-pills button { flex: none; }
}

@media (prefers-reduced-motion: reduce) {
  .store-catalog-tools,
  .store-catalog-tools *,
  .store-catalog-tools *::before {
    animation: none !important;
    transition: none !important;
  }
  .store-filter-pills button { opacity: 1; transform: none; }
}
`;

export default function CatalogToolbar({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}) {
  return (
    <div className="store-catalog-tools">
      <style>{css}</style>
      <label className="store-search">
        <Search size={19} />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search printers, toner, cartridges..."
          aria-label="Search printer products"
        />
        {search && (
          <button type="button" onClick={() => onSearchChange("")} aria-label="Clear search">
            Clear
          </button>
        )}
      </label>
      <div className="store-filter-pills">
        {["All", ...categories.map((c) => c.name)].map((name) => (
          <button
            type="button"
            key={name}
            className={activeCategory === name ? "is-active" : ""}
            onClick={() => onCategoryChange(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}