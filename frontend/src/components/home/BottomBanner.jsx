import { Printer } from "lucide-react";

export default function BottomBanner() {
  return (
    <section className="store-bottom-banner">
      <div>
        <span className="store-eyebrow">NEED HELP CHOOSING?</span>
        <h2>Find the right printing solution.</h2>
        <p>Browse our printer range and printing essentials in one place.</p>
      </div>
      <Printer size={70} strokeWidth={1.2} />
    </section>
  );
}
