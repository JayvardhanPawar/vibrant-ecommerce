import { Truck, ShieldCheck, Headphones } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Delivery support", text: "Convenient ordering" },
  { icon: ShieldCheck, title: "Trusted products", text: "Quality-focused selection" },
  { icon: Headphones, title: "Customer assistance", text: "Help when you need it" },
];

const css = `
.store-benefits {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
  max-width: 1240px;
  margin: 16px auto 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #f3d3d6;
  box-shadow: 0 24px 50px -28px rgba(179, 18, 31, 0.45);
  animation: benefits-in 0.8s var(--ease) both;
}

/* Animated red accent line along the top */
.store-benefits::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red-2), var(--red-1), #ff6b76, var(--red-1), var(--red-2));
  background-size: 200% 100%;
  animation: benefits-line 5s linear infinite;
}

.store-benefits > div {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 26px 30px;
  cursor: default;
  opacity: 0;
  transform: translateY(16px);
  animation: benefit-item-in 0.7s var(--ease) forwards;
  transition: background 0.35s ease;
}
.store-benefits > div:nth-child(1) { animation-delay: 0.15s; }
.store-benefits > div:nth-child(2) { animation-delay: 0.3s; }
.store-benefits > div:nth-child(3) { animation-delay: 0.45s; }

/* Divider between items */
.store-benefits > div + div::after {
  content: "";
  position: absolute;
  left: 0;
  top: 22%;
  bottom: 22%;
  width: 1px;
  background: linear-gradient(transparent, #f0c4c8, transparent);
}

/* Icon badge */
.store-benefits > div > svg {
  flex: none;
  box-sizing: content-box;
  padding: 13px;
  border-radius: 16px;
  color: var(--red-1);
  background: #fdecee;
  border: 1px solid #f7c9ce;
  transition: transform 0.45s var(--ease), background 0.35s ease,
    color 0.35s ease, box-shadow 0.35s ease;
}

.store-benefits strong {
  display: block;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--red-2);
  letter-spacing: -0.01em;
}
.store-benefits small {
  display: block;
  margin-top: 3px;
  font-size: 13px;
  color: #7c5b5f;
}

/* Hover: red wash + icon turns solid red */
.store-benefits > div:hover {
  background: linear-gradient(180deg, #fff6f6, #ffffff);
}
.store-benefits > div:hover > svg {
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-color: transparent;
  transform: translateY(-4px) rotate(-6deg);
  box-shadow: 0 14px 24px -10px rgba(225, 29, 46, 0.8);
}

@keyframes benefits-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
@keyframes benefit-item-in {
  to { opacity: 1; transform: none; }
}
@keyframes benefits-line {
  to { background-position: -200% 0; }
}

@media (max-width: 820px) {
  .store-benefits { grid-template-columns: 1fr; }
  .store-benefits > div { padding: 18px 22px; }
  .store-benefits > div + div::after {
    left: 8%;
    right: 8%;
    top: 0;
    bottom: auto;
    width: auto;
    height: 1px;
    background: linear-gradient(90deg, transparent, #f0c4c8, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .store-benefits,
  .store-benefits::before,
  .store-benefits > div {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
`;

export default function BenefitsBar() {
  return (
    <>
      <style>{css}</style>
      <section className="store-benefits" aria-label="Store benefits">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon size={21} />
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </div>
        ))}
      </section>
    </>
  );
}