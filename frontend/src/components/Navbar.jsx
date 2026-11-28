
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  PlusCircle,
  ShieldCheck,
  UserRound,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import {
  clearCustomerSession,
  getCustomerToken,
  customerApiRequest,
} from "../services/customerApi";

import { useCart } from "../context/CartContext";

const css = `
.navbar {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  box-sizing: border-box;
  /* force a vertical stack: top row, then nav row, then mobile menu */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--red-line);
  box-shadow: 0 6px 24px -14px rgba(179, 18, 31, 0.35);
  animation: nav-drop 0.7s var(--ease) both;
}

/* thin red accent line on very top */
.navbar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red-3), var(--red-1), #ff6b76, var(--red-1), var(--red-3));
  background-size: 200% 100%;
  animation: nav-line 6s linear infinite;
}

.navbar > .navbar-main,
.navbar > .navbar-navigation,
.navbar > .mobile-menu {
  width: 100%;
  box-sizing: border-box;
}

.navbar-main {
  max-width: 1440px;
  min-height: 76px;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* ---------- BRAND ---------- */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 12px;
  box-shadow: 0 10px 20px -10px rgba(225, 29, 46, 0.9);
  transition: transform 0.5s var(--ease), box-shadow 0.4s ease;
}

.brand:hover .brand-icon {
  transform: rotate(-10deg) scale(1.08);
  box-shadow: 0 14px 26px -10px rgba(225, 29, 46, 1);
}

.brand-name {
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.8px;
  color: var(--red-3);
}

.brand-name span {
  color: var(--red-1);
}

/* ---------- SEARCH ---------- */
.navbar-search {
  height: 46px;
  max-width: 490px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 5px 0 15px;
  background: #fff6f6;
  border: 1.5px solid var(--red-line);
  border-radius: 12px;
  color: var(--red-1);
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.4s var(--ease);
}

.navbar-search:hover {
  border-color: #eba5ab;
}

.navbar-search:focus-within {
  border-color: var(--red-1);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.13), 0 14px 26px -16px rgba(225, 29, 46, 0.6);
}

.navbar-search svg {
  flex: none;
  transition: transform 0.4s var(--ease);
}

.navbar-search:focus-within svg {
  transform: scale(1.15) rotate(-8deg);
}

.navbar-search input,
.mobile-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--red-3);
  font-family: inherit;
  font-size: 13.5px;
}

.navbar-search input::placeholder,
.mobile-search input::placeholder {
  color: #b48a8f;
}

.navbar-search input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

.navbar-search button,
.mobile-search button {
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  color: #ffffff;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}

.navbar-search button:hover,
.mobile-search button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px -8px rgba(179, 18, 31, 0.9);
}

.navbar-search button:active,
.mobile-search button:active {
  transform: scale(0.96);
}

/* ---------- ACCOUNT ACTIONS ---------- */
.navbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  flex-shrink: 0;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--ink);
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--red-1);
}

.nav-link svg {
  transition: transform 0.4s var(--ease);
}

.nav-link:hover svg {
  transform: translateY(-2px) scale(1.1);
}

.nav-button {
  padding: 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
}

.navbar-register {
  position: relative;
  overflow: hidden;
  padding: 11px 17px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  color: #ffffff;
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 12px 22px -12px rgba(179, 18, 31, 0.9);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}

.navbar-register::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: nav-sheen 5s ease-in-out infinite 2s;
}

.navbar-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 26px -12px rgba(179, 18, 31, 1);
}

.nav-admin-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  color: var(--red-2);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.nav-admin-link:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
}

/* ---------- CART ---------- */
.cart-nav-link {
  gap: 8px;
}

.cart-icon-wrap {
  position: relative;
  display: inline-flex;
}

.cart-count {
  position: absolute;
  top: -9px;
  right: -11px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  border-radius: 20px;
  background: var(--red-1);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  animation: cart-pop 0.5s var(--ease);
}

/* ---------- SECOND NAV ROW ---------- */
.navbar-navigation {
  background: #fff6f6;
  border-top: 1px solid #f7e1e3;
}

.navbar-nav-links {
  max-width: 1440px;
  min-height: 46px;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  align-items: center;
  gap: 34px;
}

.navbar-nav-links > a,
.nav-dropdown-trigger {
  position: relative;
  height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.25s ease;
}

/* animated underline */
.navbar-nav-links > a::after,
.nav-dropdown-trigger::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--red-1);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease);
}

.navbar-nav-links > a:hover,
.navbar-nav-links > a.active,
.nav-dropdown-trigger:hover,
.nav-dropdown:hover .nav-dropdown-trigger {
  color: var(--red-1);
}

.navbar-nav-links > a:hover::after,
.navbar-nav-links > a.active::after,
.nav-dropdown:hover .nav-dropdown-trigger::after {
  transform: scaleX(1);
}

/* ---------- DROPDOWN ---------- */
.nav-dropdown {
  position: relative;
  height: 46px;
  display: flex;
  align-items: center;
}

.nav-dropdown-trigger svg {
  transition: transform 0.4s var(--ease);
}

.nav-dropdown:hover .nav-dropdown-trigger svg,
.nav-dropdown:focus-within .nav-dropdown-trigger svg {
  transform: rotate(180deg);
}

.nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: -12px;
  min-width: 232px;
  padding: 9px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-top: 3px solid var(--red-1);
  border-radius: 4px 4px 14px 14px;
  box-shadow: 0 24px 40px -18px rgba(122, 11, 20, 0.45);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.4s var(--ease), visibility 0s linear 0.3s;
}

.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown:focus-within .nav-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition-delay: 0s;
}

.nav-dropdown-menu a {
  position: relative;
  padding: 11px 14px;
  border-radius: 9px;
  color: var(--ink);
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s ease, background 0.25s ease, padding-left 0.35s var(--ease);
}

.nav-dropdown-menu a:hover {
  color: var(--red-1);
  background: var(--red-soft);
  padding-left: 20px;
}

/* ---------- MOBILE ---------- */
.mobile-menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #f7c9ce;
  border-radius: 12px;
  background: var(--red-soft);
  color: var(--red-2);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, transform 0.3s var(--ease);
}

.mobile-menu-toggle:hover {
  background: var(--red-1);
  color: #ffffff;
}

.mobile-menu-toggle:active {
  transform: scale(0.92);
}

.mobile-menu-toggle svg {
  animation: icon-swap 0.35s var(--ease);
}

.mobile-menu {
  display: none;
}

.mobile-search {
  height: 46px;
  margin-bottom: 10px;
  padding: 0 6px 0 14px;
  display: flex;
  align-items: center;
  gap: 9px;
  background: #fff6f6;
  border: 1.5px solid var(--red-line);
  border-radius: 12px;
  color: var(--red-1);
}

.mobile-search:focus-within {
  border-color: var(--red-1);
  background: #ffffff;
}

.mobile-menu > a {
  min-height: 44px;
  padding: 11px 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f7e1e3;
  color: var(--ink);
  font-size: 13.5px;
  font-weight: 650;
  text-decoration: none;
  transition: color 0.25s ease, padding-left 0.35s var(--ease);
}

.mobile-menu > a:hover {
  color: var(--red-1);
  padding-left: 12px;
}

.mobile-menu > button {
  width: 100%;
  min-height: 44px;
  padding: 11px 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-bottom: 1px solid #f7e1e3;
  background: transparent;
  color: var(--red-2);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

/* admin header */
.navbar-admin .navbar-main {
  min-height: 70px;
}

/* ---------- KEYFRAMES ---------- */
@keyframes nav-drop {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: none; opacity: 1; }
}

@keyframes nav-line {
  to { background-position: -200% 0; }
}

@keyframes nav-sheen {
  0%, 60% { transform: translateX(-120%); }
  100%    { transform: translateX(120%); }
}

@keyframes cart-pop {
  0%   { transform: scale(0.4); }
  60%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}

@keyframes icon-swap {
  from { transform: rotate(-90deg) scale(0.6); opacity: 0; }
  to   { transform: none; opacity: 1; }
}

@keyframes menu-down {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: none; }
}

@keyframes menu-item-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: none; }
}

/* ---------- TABLET ---------- */
@media (max-width: 1050px) {
  .navbar-main {
    gap: 18px;
    padding-left: 3%;
    padding-right: 3%;
  }

  .navbar-actions { gap: 13px; }

  .navbar-nav-links {
    gap: 22px;
    padding-left: 3%;
    padding-right: 3%;
  }

  .brand-name { font-size: 20px; }
}

/* ---------- MOBILE ---------- */
@media (max-width: 760px) {
  .navbar-main {
    min-height: 65px;
    padding: 0 17px;
    gap: 12px;
  }

  .brand-icon {
    width: 38px;
    height: 38px;
  }

  .brand-name { font-size: 19px; }

  .navbar-search,
  .navbar-actions,
  .navbar-navigation {
    display: none;
  }

  .mobile-menu-toggle {
    display: inline-flex;
    flex-shrink: 0;
  }

  .mobile-menu {
    padding: 13px 18px 18px;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-top: 1px solid var(--red-line);
    box-shadow: 0 18px 28px -16px rgba(122, 11, 20, 0.35);
    max-height: calc(100vh - 68px);
    overflow-y: auto;
    animation: menu-down 0.4s var(--ease) both;
  }

  .mobile-menu > * {
    animation: menu-item-in 0.45s var(--ease) both;
  }

  .mobile-menu > *:nth-child(1)  { animation-delay: 0.03s; }
  .mobile-menu > *:nth-child(2)  { animation-delay: 0.06s; }
  .mobile-menu > *:nth-child(3)  { animation-delay: 0.09s; }
  .mobile-menu > *:nth-child(4)  { animation-delay: 0.12s; }
  .mobile-menu > *:nth-child(5)  { animation-delay: 0.15s; }
  .mobile-menu > *:nth-child(6)  { animation-delay: 0.18s; }
  .mobile-menu > *:nth-child(7)  { animation-delay: 0.21s; }
  .mobile-menu > *:nth-child(8)  { animation-delay: 0.24s; }
  .mobile-menu > *:nth-child(n+9) { animation-delay: 0.27s; }
}

@media (max-width: 380px) {
  .navbar-main { padding: 0 12px; }
  .brand-name { font-size: 17px; }
}

/* ---------- ACCESSIBILITY ---------- */
.navbar a:focus-visible,
.navbar button:focus-visible,
.navbar input:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .navbar,
  .navbar *,
  .navbar::before,
  .navbar *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

export default function Navbar({ admin = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { cartCount, clearCart } = useCart();

  const [loggedIn, setLoggedIn] = useState(
    Boolean(getCustomerToken())
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let mounted = true;

    setMobileMenuOpen(false);

    if (!getCustomerToken()) {
      setLoggedIn(false);
      return () => { mounted = false; };
    }

    customerApiRequest("/customer/me")
      .then((data) => {
        if (!mounted) return;

        localStorage.setItem("customer_data", JSON.stringify(data.customer));
        setLoggedIn(true);
      })
      .catch(() => {
        if (!mounted) return;

        localStorage.removeItem("customer_data");
        setLoggedIn(false);
      });

    return () => { mounted = false; };
  }, [location.pathname]);

  function handleLogout() {
    clearCustomerSession();
    clearCart();
    setLoggedIn(false);
    setMobileMenuOpen(false);
    navigate("/");
  }

  function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar ${admin ? "navbar-admin" : ""}`}>
      <style>{css}</style>

      <div className="navbar-main">
        {/* BRAND */}
        <Link to="/" className="brand" onClick={closeMobileMenu}>
          <span className="brand-icon">
            <ShoppingBag size={24} strokeWidth={2.2} />
          </span>

          <span className="brand-name">
            Vibrant<span>Infotech</span>
          </span>
        </Link>

        {/* DESKTOP SEARCH */}
        {!admin && (
          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={19} />

            <input
              type="search"
              placeholder="Search printers, brands, models..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>
        )}

        {/* DESKTOP ACTIONS */}
        <div className="navbar-actions">
          {admin ? (
            <>
              <Link
                to="/admin/products/add"
                className={`nav-link ${
                  location.pathname === "/admin/products/add" ? "active" : ""
                }`}
              >
                <PlusCircle size={17} /> Add Product
              </Link>

              <Link
                to="/admin/products"
                className={`nav-link ${
                  location.pathname === "/admin/products" ? "active" : ""
                }`}
              >
                <Package size={17} /> View All Products
              </Link>

              {/* ORDERS LINK */}
              <Link
                to="/admin/orders"
                className={`nav-link ${
                  location.pathname.startsWith("/admin/orders") ? "active" : ""
                }`}
              >
                <ShoppingBag size={17} /> Orders
              </Link>

              {/* DELIVERY STAFF LINK */}
              <Link
                to="/admin/delivery-staff"
                className={`nav-link ${
                  location.pathname === "/admin/delivery-staff" ? "active" : ""
                }`}
              >
                <UserRound size={17} /> Delivery Staff
              </Link>

              <Link to="/" className="nav-link">
                <ShoppingBag size={17} /> View Website
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                className={`nav-link cart-nav-link ${
                  isActive("/cart") ? "active" : ""
                }`}
              >
                <span className="cart-icon-wrap">
                  <ShoppingCart size={21} />

                  {/* key restarts the pop animation whenever the count changes */}
                  <span className="cart-count" key={cartCount}>
                    {cartCount}
                  </span>
                </span>

                <span>Cart</span>
              </Link>

              {loggedIn ? (
                <>
                  <Link
                    to="/account"
                    className={`nav-link ${
                      isActive("/account") ? "active" : ""
                    }`}
                  >
                    <UserRound size={18} />
                    My Account
                  </Link>

                  <button
                    type="button"
                    className="nav-link nav-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>

                  <Link to="/register" className="navbar-register">
                    Create Account
                  </Link>
                </>
              )}

              <Link to="/delivery/login" className="nav-link">
                <Package size={16} />
                Delivery Login
              </Link>

              <Link to="/admin/login" className="nav-admin-link">
                <ShieldCheck size={16} />
                Admin
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((current) => !current)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={25} key="x" />
          ) : (
            <Menu size={25} key="menu" />
          )}
        </button>
      </div>

      {/* MAIN NAVIGATION */}
      {!admin && (
        <div className="navbar-navigation">
          <nav className="navbar-nav-links">
            <Link
              to="/"
              className={isActive("/") ? "active" : ""}
              onClick={closeMobileMenu}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={isActive("/products") ? "active" : ""}
              onClick={closeMobileMenu}
            >
              All Products
            </Link>

            <div className="nav-dropdown">
              <Link to="/products" className="nav-dropdown-trigger">
                Printers <ChevronDown size={15} />
              </Link>

              <div className="nav-dropdown-menu">
                <Link
                  to="/products?category=Laser Printers"
                  onClick={closeMobileMenu}
                >
                  Laser Printers
                </Link>

                <Link
                  to="/products?category=Inkjet Printers"
                  onClick={closeMobileMenu}
                >
                  Inkjet Printers
                </Link>

                <Link
                  to="/products?category=Barcode Printers"
                  onClick={closeMobileMenu}
                >
                  Barcode Printers
                </Link>

                <Link
                  to="/products?category=Multifunction Printers"
                  onClick={closeMobileMenu}
                >
                  Multifunction Printers
                </Link>
              </div>
            </div>

            <Link
              to="/products?category=Toners%20%26%20Cartridges"
              onClick={closeMobileMenu}
            >
              Toners & Cartridges
            </Link>

            <Link
              to="/products?category=Accessories"
              onClick={closeMobileMenu}
            >
              Accessories
            </Link>

            <Link
              to="/products?view=brands"
              onClick={closeMobileMenu}
            >
              Brands
            </Link>

            <Link to="/contact" onClick={closeMobileMenu}>
              Support
            </Link>
          </nav>
        </div>
      )}

      {/* ADMIN MOBILE MENU */}
      {admin && mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/admin/products/add" onClick={closeMobileMenu}>
            <PlusCircle size={17} /> Add Product
          </Link>

          <Link to="/admin/products" onClick={closeMobileMenu}>
            <Package size={17} /> View All Products
          </Link>

          <Link to="/admin/orders" onClick={closeMobileMenu}>
            <ShoppingBag size={17} /> Orders
          </Link>

          <Link to="/admin/delivery-staff" onClick={closeMobileMenu}>
            <UserRound size={17} /> Delivery Staff
          </Link>

          <Link to="/admin/cod-collections" onClick={closeMobileMenu}>
            <Package size={17} /> COD Collections
          </Link>

          <Link to="/" onClick={closeMobileMenu}>
            <ShoppingBag size={17} /> View Website
          </Link>
        </div>
      )}

      {/* CUSTOMER MOBILE MENU */}
      {!admin && mobileMenuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <Search size={18} />

            <input
              type="search"
              placeholder="Search products..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          <Link to="/" onClick={closeMobileMenu}>Home</Link>
          <Link to="/products" onClick={closeMobileMenu}>All Products</Link>

          <Link
            to="/products?category=Laser Printers"
            onClick={closeMobileMenu}
          >
            Laser Printers
          </Link>

          <Link
            to="/products?category=Inkjet Printers"
            onClick={closeMobileMenu}
          >
            Inkjet Printers
          </Link>

          <Link
            to="/products?category=Barcode Printers"
            onClick={closeMobileMenu}
          >
            Barcode Printers
          </Link>

          <Link
            to="/products?category=Toners%20%26%20Cartridges"
            onClick={closeMobileMenu}
          >
            Toners & Cartridges
          </Link>

          <Link
            to="/products?category=Accessories"
            onClick={closeMobileMenu}
          >
            Accessories
          </Link>

          <Link
            to="/products?view=brands"
            onClick={closeMobileMenu}
          >
            Brands
          </Link>

          <Link to="/contact" onClick={closeMobileMenu}>Support</Link>

          <Link to="/cart" onClick={closeMobileMenu}>
            Shopping Cart ({cartCount})
          </Link>

          {loggedIn ? (
            <>
              <Link to="/account" onClick={closeMobileMenu}>
                My Account
              </Link>

              <button type="button" onClick={handleLogout}>
                <LogOut size={17} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" onClick={closeMobileMenu}>
                Create Account
              </Link>
            </>
          )}

          <Link to="/delivery/login" onClick={closeMobileMenu}>
            <Package size={17} /> Delivery Login
          </Link>

          <Link to="/admin/login" onClick={closeMobileMenu}>
            <ShieldCheck size={16} /> Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}
