import { Link } from "react-router-dom";

export default function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="store-footer-inner">
        <Link to="/" className="store-footer-brand">PRINT<span>STORE</span></Link>
        <p>Your destination for printers, consumables and printing accessories.</p>
        <small>© {new Date().getFullYear()} PrintStore. All rights reserved.</small>
      </div>
    </footer>
  );
}
