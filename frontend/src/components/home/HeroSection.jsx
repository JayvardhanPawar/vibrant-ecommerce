import { useRef } from "react";
import { ChevronRight, ShieldCheck, PackageCheck, Sparkles } from "lucide-react";
import "./HeroSection.css";

export default function HeroSection({ onChooseCategory }) {
  const artRef = useRef(null);

  // Subtle mouse parallax for the illustration (desktop only, no re-renders)
  const handleMove = (e) => {
    const el = artRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
  };

  const resetMove = () => {
    const el = artRef.current;
    if (!el) return;
    el.style.setProperty("--mx", 0);
    el.style.setProperty("--my", 0);
  };

  return (
    <section className="store-hero-wrap">
      <div className="store-hero">
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="hero-bg-orb hero-bg-orb-a" aria-hidden="true" />
        <div className="hero-bg-orb hero-bg-orb-b" aria-hidden="true" />

        <div className="store-hero-copy">
          <span className="store-eyebrow hero-reveal" style={{ "--d": "0ms" }}>
            <Sparkles size={13} /> YOUR COMPLETE PRINTING DESTINATION
          </span>

          <h1 className="hero-reveal" style={{ "--d": "120ms" }}>
            Everything for
            <br />
            <span>better printing.</span>
          </h1>

          <p className="hero-reveal" style={{ "--d": "240ms" }}>
            Discover reliable printers, genuine consumables and essential
            accessories for home, office and business.
          </p>

          <div className="store-hero-actions hero-reveal" style={{ "--d": "360ms" }}>
            <button
              className="store-primary-btn"
              onClick={() => onChooseCategory("Printers")}
            >
              <span>Explore printers</span>
              <ChevronRight size={17} />
            </button>
            <button
              className="store-secondary-btn"
              onClick={() => onChooseCategory("Ink & Toner")}
            >
              Shop supplies
            </button>
          </div>

          <div className="store-hero-points hero-reveal" style={{ "--d": "480ms" }}>
            <span><ShieldCheck size={16} /> Quality products</span>
            <span><PackageCheck size={16} /> Wide selection</span>
          </div>
        </div>

        <div
          className="store-hero-art"
          ref={artRef}
          onMouseMove={handleMove}
          onMouseLeave={resetMove}
          aria-hidden="true"
        >
          <div className="hero-art-glow" />
          <div className="hero-art-ring hero-art-ring-1" />
          <div className="hero-art-ring hero-art-ring-2" />

          <div className="hero-printer-stage">
            <div className="hero-printer">
              <div className="hero-printer-top" />
              <div className="hero-printer-panel">
                <span />
                <span />
                <span />
              </div>
              <div className="hero-printer-slot" />
              <div className="hero-printer-paper">
                <i /><i /><i /><i /><i />
              </div>
              <div className="hero-printer-base" />
            </div>
          </div>

          <div className="hero-ink">
            <span className="ink-c" />
            <span className="ink-m" />
            <span className="ink-y" />
            <span className="ink-k" />
          </div>

          <div className="hero-art-tag hero-tag-top">PRINT SMART</div>
          <div className="hero-art-tag hero-tag-bottom">HOME · OFFICE · BUSINESS</div>
        </div>
      </div>
    </section>
  );
} 