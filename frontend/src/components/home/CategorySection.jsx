import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { categories } from "./homeData";

const css = `
.store-category-section {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  max-width: 1240px;
  margin: 0 auto;
  padding: 56px 16px 24px;
}

/* ---------- Heading ---------- */
.store-category-section .store-section-heading {
  margin-bottom: 30px;
}
.store-category-section .store-eyebrow {
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
.store-category-section h2 {
  position: relative;
  display: inline-block;
  margin: 14px 0 10px;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--red-2);
}
.store-category-section h2::after {
  content: "";
  display: block;
  height: 4px;
  width: 0;
  margin-top: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
  transition: width 0.9s var(--ease) 0.3s;
}
.store-category-section.is-visible h2::after {
  width: 64px;
}
.store-category-section .store-section-heading p {
  margin: 0;
  max-width: 480px;
  font-size: 1rem;
  line-height: 1.6;
  color: #7c5b5f;
}
.store-category-section .store-section-heading > div {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
}
.store-category-section.is-visible .store-section-heading > div {
  opacity: 1;
  transform: none;
}

/* ---------- Grid ---------- */
.store-category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

/* ---------- Card ---------- */
.store-category-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px 20px;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #f3d3d6;
  border-radius: 20px;
  box-shadow: 0 14px 30px -24px rgba(179, 18, 31, 0.5);
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s var(--ease), transform 0.5s var(--ease),
    box-shadow 0.4s var(--ease), border-color 0.3s ease;
  transition-delay: calc(var(--i, 0) * 70ms), 0s, 0s, 0s;
}
.store-category-section.is-visible .store-category-card {
  opacity: 1;
  transform: none;
}

/* Red fill that sweeps in on hover */
.store-category-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, var(--red-1), var(--red-2) 60%, var(--red-3));
  transform: translateY(101%);
  transition: transform 0.5s var(--ease);
}
.store-category-card:hover,
.store-category-card:focus-visible {
  border-color: transparent;
  box-shadow: 0 24px 40px -22px rgba(179, 18, 31, 0.8);
}
.store-category-section.is-visible .store-category-card:hover,
.store-category-section.is-visible .store-category-card:focus-visible {
  transform: translateY(-6px);
  transition-delay: 0s;
}
.store-category-card:hover::before,
.store-category-card:focus-visible::before,
.store-category-card.is-active::before {
  transform: translateY(0);
}
.store-category-card:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}
.store-category-card:active {
  transform: translateY(-2px) scale(0.99) !important;
}

/* Icon badge */
.store-category-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  color: var(--red-1);
  background: #fdecee;
  border: 1px solid #f7c9ce;
  transition: transform 0.5s var(--ease), background 0.3s ease, color 0.3s ease,
    border-color 0.3s ease;
}
.store-category-card:hover .store-category-icon,
.store-category-card:focus-visible .store-category-icon {
  transform: rotate(-8deg) scale(1.08);
}

/* Text */
.store-category-text {
  flex: 1;
  min-width: 0;
}
.store-category-text strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--red-2);
  transition: color 0.3s ease;
}
.store-category-text small {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.45;
  color: #7c5b5f;
  transition: color 0.3s ease;
}

/* Arrow */
.store-category-arrow {
  flex: none;
  color: var(--red-1);
  opacity: 0.55;
  transform: translateX(-4px);
  transition: transform 0.4s var(--ease), opacity 0.3s ease, color 0.3s ease;
}

/* Hover + active text/icon colours (white on red) */
.store-category-card:hover .store-category-text strong,
.store-category-card:focus-visible .store-category-text strong,
.store-category-card.is-active .store-category-text strong {
  color: #ffffff;
}
.store-category-card:hover .store-category-text small,
.store-category-card:focus-visible .store-category-text small,
.store-category-card.is-active .store-category-text small {
  color: rgba(255, 255, 255, 0.82);
}
.store-category-card:hover .store-category-icon,
.store-category-card:focus-visible .store-category-icon,
.store-category-card.is-active .store-category-icon {
  color: var(--red-2);
  background: #ffffff;
  border-color: #ffffff;
}
.store-category-card:hover .store-category-arrow,
.store-category-card:focus-visible .store-category-arrow,
.store-category-card.is-active .store-category-arrow {
  color: #ffffff;
  opacity: 1;
  transform: translateX(2px);
}

/* Active (selected) card */
.store-category-card.is-active {
  border-color: transparent;
  box-shadow: 0 24px 40px -22px rgba(179, 18, 31, 0.8);
}

@media (max-width: 520px) {
  .store-category-section { padding-top: 40px; }
  .store-category-grid { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .store-category-section *,
  .store-category-section *::before {
    transition: none !important;
  }
  .store-category-card,
  .store-category-section .store-section-heading > div {
    opacity: 1;
    transform: none;
  }
}
`;

export default function CategorySection({ activeCategory, onChooseCategory }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Trigger the entrance animation when the section scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{css}</style>
      <section
        ref={ref}
        className={`store-section store-category-section ${visible ? "is-visible" : ""}`}
      >
        <div className="store-section-heading">
          <div>
            <span className="store-eyebrow">BROWSE THE STORE</span>
            <h2>Shop by category</h2>
            <p>Find the right equipment and supplies for your printing needs.</p>
          </div>
        </div>

        <div className="store-category-grid">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                type="button"
                className={`store-category-card ${
                  activeCategory === category.name ? "is-active" : ""
                }`}
                key={category.name}
                style={{ "--i": index }}
                onClick={() => onChooseCategory(category.name)}
              >
                <span className="store-category-icon"><Icon size={25} /></span>
                <span className="store-category-text">
                  <strong>{category.name}</strong>
                  <small>{category.description}</small>
                </span>
                <ChevronRight className="store-category-arrow" size={18} />
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}