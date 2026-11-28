import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  LogOut,
  ShieldCheck,
  MapPin,
  Plus,
  Home,
  Briefcase,
  MoreHorizontal,
  Trash2,
  Star,
  Pencil,
  ShoppingBag,
  ChevronRight
} from "lucide-react";

import Navbar from "../components/Navbar";

import {
  customerApiRequest,
  getCustomerToken,
  clearCustomerSession,
  saveCustomerSession
} from "../services/customerApi";

const css = `
.customer-account-page {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  min-height: calc(100vh - 124px);
  padding: 40px 16px 70px;
  background: linear-gradient(180deg, #fff6f6 0%, #ffffff 420px);
  color: var(--ink);
}
.customer-account-page *,
.customer-account-page *::before,
.customer-account-page *::after {
  box-sizing: border-box;
}
.customer-account-page .customer-account-layout {
  display: grid;
  gap: 22px;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}
.customer-account-page > p {
  text-align: center;
  color: var(--muted);
  padding: 80px 0;
}

/* ---------- Heading ---------- */
.customer-account-page .account-page-heading {
  animation: ac-rise 0.8s var(--ease) both;
}
.customer-account-page .account-page-heading h1 {
  margin: 0 0 8px;
  color: var(--red-3);
  font-size: clamp(1.8rem, 3.6vw, 2.5rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.customer-account-page .account-page-heading h1::after {
  content: "";
  display: block;
  width: 64px;
  height: 4px;
  margin-top: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--red-1), #ff6b76);
  transform-origin: left;
  animation: ac-underline 0.9s var(--ease) 0.3s both;
}
.customer-account-page .account-page-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

/* ---------- Alerts ---------- */
.customer-account-page .profile-alert {
  padding: 13px 16px;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 650;
  animation: ac-alert 0.5s var(--ease) both;
}
.customer-account-page .profile-error {
  color: var(--red-3);
  background: #fff1f2;
  border: 1px solid #f0a0a8;
  border-left: 4px solid var(--red-1);
}
.customer-account-page .profile-success {
  color: var(--red-2);
  background: #ffffff;
  border: 1px solid #f0b8bd;
  border-left: 4px solid var(--red-1);
  box-shadow: 0 14px 26px -22px rgba(179, 18, 31, 0.7);
}

/* ---------- Section cards ---------- */
.customer-account-page .customer-section-card {
  position: relative;
  overflow: hidden;
  padding: 26px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-top: 3px solid var(--red-1);
  border-radius: 24px;
  box-shadow: 0 24px 46px -36px rgba(179, 18, 31, 0.6);
  opacity: 0;
  animation: ac-rise 0.8s var(--ease) forwards;
}
.customer-account-page .customer-section-card:nth-of-type(1) { animation-delay: 0.12s; }
.customer-account-page .customer-section-card:nth-of-type(2) { animation-delay: 0.24s; }

.customer-account-page .customer-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.customer-account-page .customer-section-heading h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 4px;
  color: var(--red-2);
  font-size: 19px;
  font-weight: 800;
}
.customer-account-page .customer-section-heading h2 svg {
  padding: 7px;
  box-sizing: content-box;
  color: var(--red-1);
  background: var(--red-soft);
  border-radius: 10px;
}
.customer-account-page .customer-section-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 13.5px;
}

/* ---------- Buttons ---------- */
.customer-account-page .account-primary-btn,
.customer-account-page .account-outline-btn {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease, color 0.3s ease,
    background 0.3s ease, border-color 0.3s ease;
}
.customer-account-page .account-primary-btn {
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border: 0;
  box-shadow: 0 14px 24px -14px rgba(179, 18, 31, 0.95);
}
.customer-account-page .account-primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px -14px rgba(179, 18, 31, 1);
}
.customer-account-page .account-primary-btn:disabled {
  opacity: 0.75;
  cursor: progress;
}
.customer-account-page .account-outline-btn {
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px solid #f0b8bd;
}
.customer-account-page .account-outline-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--red-1);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease);
}
.customer-account-page .account-outline-btn:hover:not(:disabled) {
  color: #ffffff;
  border-color: var(--red-1);
}
.customer-account-page .account-outline-btn:hover:not(:disabled)::before {
  transform: scaleX(1);
}
.customer-account-page .account-outline-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.customer-account-page .account-primary-btn:active:not(:disabled),
.customer-account-page .account-outline-btn:active:not(:disabled) {
  transform: scale(0.97);
}

/* ---------- Profile info ---------- */
.customer-account-page .profile-information {
  display: grid;
  gap: 12px;
}
.customer-account-page .profile-field {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: #fff6f6;
  border: 1px solid #f7d9dc;
  border-radius: 16px;
  transition: transform 0.35s var(--ease), border-color 0.3s ease,
    background 0.3s ease, box-shadow 0.35s var(--ease);
}
.customer-account-page .profile-field:hover {
  transform: translateX(6px);
  background: #ffffff;
  border-color: #f0b8bd;
  box-shadow: 0 16px 28px -22px rgba(179, 18, 31, 0.7);
}
.customer-account-page .profile-field-icon {
  flex: none;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--red-1);
  background: #ffffff;
  border: 1px solid #f7c9ce;
  border-radius: 14px;
  transition: background 0.3s ease, color 0.3s ease, transform 0.4s var(--ease);
}
.customer-account-page .profile-field:hover .profile-field-icon {
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  transform: rotate(-8deg);
}
.customer-account-page .profile-field > div:not(.profile-field-icon) {
  flex: 1;
  min-width: 0;
}
.customer-account-page .profile-field small {
  display: block;
  margin-bottom: 3px;
  color: var(--muted);
  font-size: 12px;
}
.customer-account-page .profile-field strong {
  display: block;
  color: var(--red-3);
  font-size: 15px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.customer-account-page .verified-icon {
  flex: none;
  color: var(--red-1);
  animation: ac-pulse 2.4s ease-in-out infinite;
}
.customer-account-page .profile-member-date {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 12.5px;
}

/* ---------- Forms ---------- */
.customer-account-page .account-form {
  display: grid;
  gap: 8px;
  animation: ac-rise 0.5s var(--ease) both;
}
.customer-account-page .account-form label {
  display: block;
  margin-top: 8px;
  color: var(--red-2);
  font-size: 13px;
  font-weight: 750;
}
.customer-account-page .account-form input:not([type="checkbox"]),
.customer-account-page .account-form select {
  width: 100%;
  height: 48px;
  margin-top: 6px;
  padding: 0 14px;
  color: var(--red-3);
  background-color: #fff6f6;
  border: 1.5px solid var(--red-line);
  border-radius: 12px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.4s var(--ease);
}
.customer-account-page .account-form select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 34px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e11d2e' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}
.customer-account-page .account-form input:hover:not(:disabled),
.customer-account-page .account-form select:hover {
  border-color: #eba5ab;
}
.customer-account-page .account-form input:focus:not([type="checkbox"]),
.customer-account-page .account-form select:focus {
  background-color: #ffffff;
  border-color: var(--red-1);
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.12);
}
.customer-account-page .account-form input:disabled {
  color: #a98d91;
  background: #f7efef;
  cursor: not-allowed;
}
.customer-account-page .account-form input::placeholder {
  color: #b48a8f;
}
.customer-account-page .account-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}
.customer-account-page .address-form {
  margin-bottom: 24px;
  padding: 22px;
  background: #fff9f9;
  border: 1.5px dashed #eba5ab;
  border-radius: 20px;
}
.customer-account-page .address-form h3 {
  margin: 0 0 6px;
  color: var(--red-2);
  font-size: 17px;
  font-weight: 800;
}
.customer-account-page .address-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 16px;
}
.customer-account-page .address-full-width {
  grid-column: 1 / -1;
}
.customer-account-page .account-form .default-address-check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  color: var(--red-3);
  font-size: 13.5px;
  font-weight: 650;
  cursor: pointer;
}
.customer-account-page .default-address-check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--red-1);
  cursor: pointer;
}

/* ---------- Empty addresses ---------- */
.customer-account-page .no-addresses {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px;
  text-align: center;
  color: var(--muted);
  background: #fff9f9;
  border: 1.5px dashed #eba5ab;
  border-radius: 20px;
}
.customer-account-page .no-addresses > svg {
  padding: 18px;
  box-sizing: content-box;
  color: var(--red-1);
  background: #ffffff;
  border: 1px solid #f7c9ce;
  border-radius: 50%;
  animation: ac-float 4s ease-in-out infinite;
}
.customer-account-page .no-addresses h3 {
  margin: 18px 0 6px;
  color: var(--red-2);
  font-size: 18px;
  font-weight: 800;
}
.customer-account-page .no-addresses p {
  margin: 0 0 18px;
  font-size: 14px;
}

/* ---------- Address cards ---------- */
.customer-account-page .customer-address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.customer-account-page .customer-address-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-radius: 20px;
  box-shadow: 0 14px 30px -26px rgba(179, 18, 31, 0.6);
  translate: 0 0;
  opacity: 0;
  animation: ac-rise 0.6s var(--ease) forwards;
  transition: translate 0.4s var(--ease), box-shadow 0.4s var(--ease), border-color 0.3s ease;
}
.customer-account-page .customer-address-card:nth-child(1) { animation-delay: 0.05s; }
.customer-account-page .customer-address-card:nth-child(2) { animation-delay: 0.12s; }
.customer-account-page .customer-address-card:nth-child(3) { animation-delay: 0.19s; }
.customer-account-page .customer-address-card:nth-child(n+4) { animation-delay: 0.26s; }
.customer-account-page .customer-address-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red-2), var(--red-1), #ff6b76);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--ease);
}
.customer-account-page .customer-address-card:hover {
  translate: 0 -5px;
  border-color: #f0b8bd;
  box-shadow: 0 26px 42px -26px rgba(179, 18, 31, 0.7);
}
.customer-account-page .customer-address-card:hover::before {
  transform: scaleX(1);
}
.customer-account-page .address-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.customer-account-page .address-type-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  color: var(--red-2);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.08em;
}
.customer-account-page .address-type-label strong {
  font-weight: 800;
}
.customer-account-page .default-address-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 999px;
  font-size: 11px;
  font-weight: 750;
  box-shadow: 0 10px 18px -10px rgba(179, 18, 31, 0.9);
}
.customer-account-page .customer-address-card h3 {
  margin: 0 0 6px;
  color: var(--red-3);
  font-size: 16px;
  font-weight: 800;
}
.customer-account-page .customer-address-card p {
  margin: 0 0 4px;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.6;
}
.customer-account-page .address-mobile {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--red-2) !important;
  font-weight: 650;
}
.customer-account-page .address-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 14px;
}
.customer-account-page .address-card-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  color: var(--red-2);
  background: #ffffff;
  border: 1px solid #f0b8bd;
  border-radius: 999px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease,
    transform 0.3s var(--ease);
}
.customer-account-page .address-card-actions button:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
  transform: translateY(-2px);
}
.customer-account-page .address-card-actions .address-delete-action {
  color: var(--muted);
  border-color: #e9dcdd;
}
.customer-account-page .address-card-actions .address-delete-action:hover {
  background: var(--red-3);
  border-color: var(--red-3);
}

/* ---------- Order history ---------- */
.customer-account-page .account-orders-list {
  display: grid;
  gap: 13px;
}
.customer-account-page .account-order-card {
  padding: 17px;
  background: #fff8f8;
  border: 1px solid #f5d5d8;
  border-radius: 16px;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.customer-account-page .account-order-card:hover {
  border-color: #efadb4;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -20px rgba(179, 18, 31, 0.65);
}
.customer-account-page .account-order-top,
.customer-account-page .account-order-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.customer-account-page .account-order-number {
  color: var(--red-3);
  font-size: 14px;
  font-weight: 800;
}
.customer-account-page .account-order-meta {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}
.customer-account-page .account-order-status {
  padding: 6px 11px;
  border-radius: 999px;
  color: var(--red-2);
  background: var(--red-soft);
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
}
.customer-account-page .account-order-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}
.customer-account-page .account-order-summary small {
  display: block;
  margin-bottom: 4px;
  color: var(--muted);
  font-size: 11px;
}
.customer-account-page .account-order-summary strong {
  color: var(--red-3);
  font-size: 14px;
}
.customer-account-page .account-order-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--red-2);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}
.customer-account-page .account-order-link:hover {
  color: var(--red-1);
}
.customer-account-page .account-orders-empty {
  padding: 28px 18px;
  text-align: center;
  color: var(--muted);
  background: #fff9f9;
  border: 1.5px dashed #eba5ab;
  border-radius: 18px;
}
.customer-account-page .account-orders-empty svg {
  color: var(--red-1);
}
.customer-account-page .account-orders-empty h3 {
  margin: 10px 0 5px;
  color: var(--red-2);
}
.customer-account-page .account-orders-empty p {
  margin: 0 0 14px;
  font-size: 13px;
}
.customer-account-page .account-order-notice {
  margin: 12px 0 0;
  padding: 10px 12px;
  color: #75521b;
  background: #fff8e8;
  border-radius: 10px;
  font-size: 12px;
}
.customer-account-page .account-order-error {
  margin: 0;
  color: var(--red-2);
  font-size: 13px;
}
@media (max-width: 520px) {
  .customer-account-page .account-order-summary {
    grid-template-columns: 1fr 1fr;
  }
}

/* ---------- Logout ---------- */
.customer-account-page .customer-logout-btn {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 24px;
  color: var(--red-2);
  background: #ffffff;
  border: 1.5px solid #f0b8bd;
  border-radius: 999px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  opacity: 0;
  animation: ac-rise 0.7s var(--ease) 0.4s forwards;
  transition: color 0.3s ease, background 0.3s ease, border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.customer-account-page .customer-logout-btn svg {
  transition: transform 0.4s var(--ease);
}
.customer-account-page .customer-logout-btn:hover {
  color: #ffffff;
  background: var(--red-1);
  border-color: var(--red-1);
  box-shadow: 0 16px 26px -14px rgba(179, 18, 31, 0.95);
}
.customer-account-page .customer-logout-btn:hover svg {
  transform: translateX(4px);
}

/* ---------- Keyframes ---------- */
@keyframes ac-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ac-alert {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ac-underline {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes ac-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(1.12); }
}
@keyframes ac-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

.customer-account-page a:focus-visible,
.customer-account-page button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

/* ---------- Responsive ---------- */
@media (max-width: 640px) {
  .customer-account-page {
    padding: 26px 12px 56px;
  }
  .customer-account-page .customer-section-card {
    padding: 18px;
    border-radius: 20px;
  }
  .customer-account-page .customer-section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .customer-account-page .address-form {
    padding: 16px;
  }
  .customer-account-page .address-form-grid {
    grid-template-columns: 1fr;
  }
  .customer-account-page .customer-address-grid {
    grid-template-columns: 1fr;
  }
  .customer-account-page .account-form-actions > * {
    flex: 1 1 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .customer-account-page *,
  .customer-account-page *::before,
  .customer-account-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .customer-account-page .customer-section-card,
  .customer-account-page .customer-address-card,
  .customer-account-page .customer-logout-btn {
    opacity: 1;
  }
}
`;

const formatOrderMoney = (value) =>
  value == null
    ? "Awaiting quote"
    : `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatOrderStatus = (value) =>
  String(value || "pending").replaceAll("_", " ");

const emptyAddress = {
  full_name: "",
  mobile: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  address_type: "home",
  is_default: false
};

export default function CustomerAccount() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    mobile: ""
  });

  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile and addresses
  async function loadAccount() {
    try {
      const [profileData, addressData] = await Promise.all([
        customerApiRequest("/customer/me"),
        customerApiRequest("/customer/addresses")
      ]);

      setCustomer(profileData.customer);
      setAddresses(addressData.addresses || []);

      // Load order history independently so an order API issue does not
      // prevent the profile and saved addresses from appearing.
      setOrdersLoading(true);
      setOrdersError("");
      customerApiRequest("/orders/mine")
        .then((ordersData) => setOrders(ordersData.orders || []))
        .catch((orderError) => setOrdersError(orderError.message || "Unable to load orders."))
        .finally(() => setOrdersLoading(false));

      setProfileForm({
        full_name: profileData.customer.full_name || "",
        mobile: profileData.customer.mobile || ""
      });

      const oldCustomer = JSON.parse(
        localStorage.getItem("customer_data") || "{}"
      );

      saveCustomerSession(
        getCustomerToken(),
        { ...oldCustomer, ...profileData.customer }
      );

    } catch (err) {
      if (
        err.message.toLowerCase().includes("token") ||
        err.message.toLowerCase().includes("session")
      ) {
        clearCustomerSession();
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getCustomerToken()) {
      navigate("/login", { replace: true });
      return;
    }

    loadAccount();
  }, []);

  // Update profile form
  function handleProfileChange(event) {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value
    });
  }

  // Save profile
  async function handleProfileSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    setSavingProfile(true);

    try {
      const data = await customerApiRequest("/customer/me", {
        method: "PUT",
        body: JSON.stringify(profileForm)
      });

      setCustomer(data.customer);

      const oldCustomer = JSON.parse(
        localStorage.getItem("customer_data") || "{}"
      );

      saveCustomerSession(
        getCustomerToken(),
        { ...oldCustomer, ...data.customer }
      );

      setProfileForm({
        full_name: data.customer.full_name,
        mobile: data.customer.mobile || ""
      });

      setEditingProfile(false);
      setSuccess("Profile updated successfully.");

    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  function cancelProfileEdit() {
    setProfileForm({
      full_name: customer.full_name || "",
      mobile: customer.mobile || ""
    });

    setEditingProfile(false);
    setError("");
  }

  // Open new address form
  function openNewAddress() {
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddress,
      full_name: customer.full_name || "",
      mobile: customer.mobile || "",
      is_default: addresses.length === 0
    });

    setShowAddressForm(true);
    setError("");
    setSuccess("");
  }

  // Open existing address for editing
  function openEditAddress(address) {
    setEditingAddressId(address.id);

    setAddressForm({
      full_name: address.full_name || "",
      mobile: address.mobile || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      address_type: address.address_type || "home",
      is_default: Boolean(address.is_default)
    });

    setShowAddressForm(true);
    setError("");
    setSuccess("");
  }

  function handleAddressChange(event) {
    const { name, value, type, checked } = event.target;

    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value
    });
  }

  // Save new or edited address
  async function handleAddressSave(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSavingAddress(true);

    try {
      const endpoint = editingAddressId
        ? `/customer/addresses/${editingAddressId}`
        : "/customer/addresses";

      const data = await customerApiRequest(endpoint, {
        method: editingAddressId ? "PUT" : "POST",
        body: JSON.stringify(addressForm)
      });

      setSuccess(data.message);
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddress);

      await loadAddresses();

    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAddress(false);
    }
  }

  async function loadAddresses() {
    const data = await customerApiRequest("/customer/addresses");
    setAddresses(data.addresses || []);
  }

  // Set default address
  async function handleSetDefault(id) {
    setError("");
    setSuccess("");

    try {
      const data = await customerApiRequest(
        `/customer/addresses/${id}/default`,
        { method: "PATCH" }
      );

      await loadAddresses();
      setSuccess(data.message);

    } catch (err) {
      setError(err.message);
    }
  }

  // Delete address
  async function handleDeleteAddress(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const data = await customerApiRequest(
        `/customer/addresses/${id}`,
        { method: "DELETE" }
      );

      await loadAddresses();
      setSuccess(data.message);

    } catch (err) {
      setError(err.message);
    }
  }

  function cancelAddressForm() {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setError("");
  }

  function handleLogout() {
    clearCustomerSession();
    navigate("/", { replace: true });
  }

  function getAddressIcon(type) {
    if (type === "home") return <Home size={18} />;
    if (type === "work") return <Briefcase size={18} />;
    return <MapPin size={18} />;
  }

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <Navbar />
        <main className="customer-account-page">
          <p>Loading your account...</p>
        </main>
      </>
    );
  }

  if (!customer) return null;

  return (
    <>
      <style>{css}</style>
      <Navbar />

      <main className="customer-account-page">
        <div className="customer-account-layout">

          {/* Account heading */}
          <div className="account-page-heading">
            <h1>My Account</h1>
            <p>Manage your profile and delivery addresses.</p>
          </div>

          {error && (
            <div className="profile-alert profile-error">
              {error}
            </div>
          )}

          {success && (
            <div className="profile-alert profile-success">
              {success}
            </div>
          )}

          {/* Personal information */}
          <section className="customer-section-card">
            <div className="customer-section-heading">
              <div>
                <h2><User size={20} /> Personal Information</h2>
                <p>Your registered customer details.</p>
              </div>

              {!editingProfile && (
                <button
                  className="account-outline-btn"
                  onClick={() => {
                    setEditingProfile(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  <Edit3 size={16} /> Edit
                </button>
              )}
            </div>

            {!editingProfile ? (
              <div className="profile-information">
                <div className="profile-field">
                  <div className="profile-field-icon">
                    <User size={19} />
                  </div>
                  <div>
                    <small>Full Name</small>
                    <strong>{customer.full_name}</strong>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-field-icon">
                    <Mail size={19} />
                  </div>
                  <div>
                    <small>Email Address</small>
                    <strong>{customer.email}</strong>
                  </div>
                  <ShieldCheck size={17} className="verified-icon" />
                </div>

                <div className="profile-field">
                  <div className="profile-field-icon">
                    <Phone size={19} />
                  </div>
                  <div>
                    <small>Mobile Number</small>
                    <strong>{customer.mobile || "Not added"}</strong>
                  </div>
                </div>

                <p className="profile-member-date">
                  Customer since{" "}
                  {new Date(customer.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="account-form">
                <label>Full Name</label>
                <input
                  name="full_name"
                  value={profileForm.full_name}
                  onChange={handleProfileChange}
                  maxLength={150}
                  required
                />

                <label>Email Address</label>
                <input value={customer.email} disabled />

                <label>Mobile Number</label>
                <input
                  name="mobile"
                  type="tel"
                  value={profileForm.mobile}
                  onChange={handleProfileChange}
                  maxLength={20}
                  placeholder="Enter mobile number"
                />

                <div className="account-form-actions">
                  <button className="account-primary-btn" disabled={savingProfile}>
                    <Save size={16} />
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="account-outline-btn"
                    onClick={cancelProfileEdit}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Order history */}
          <section className="customer-section-card">
            <div className="customer-section-heading">
              <div>
                <h2><ShoppingBag size={20} /> My Orders</h2>
                <p>
                  {ordersLoading
                    ? "Loading your recent orders..."
                    : `${orders.length} order(s) placed`}
                </p>
              </div>

              <Link to="/account/orders" className="account-outline-btn" style={{ textDecoration: "none" }}>
                View All Orders <ChevronRight size={16} />
              </Link>
            </div>

            {ordersLoading ? (
              <p style={{ color: "var(--muted)", margin: 0 }}>Loading your order history...</p>
            ) : ordersError ? (
              <p className="account-order-error" role="alert">{ordersError}</p>
            ) : orders.length === 0 ? (
              <div className="account-orders-empty">
                <ShoppingBag size={32} />
                <h3>No orders yet</h3>
                <p>Your placed orders and delivery updates will appear here.</p>
                <Link to="/products" className="account-primary-btn" style={{ textDecoration: "none" }}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="account-orders-list">
                {orders.slice(0, 3).map((order) => (
                  <article className="account-order-card" key={order.id}>
                    <div className="account-order-top">
                      <div>
                        <div className="account-order-number">{order.order_number}</div>
                        <div className="account-order-meta">
                          Placed{" "}
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })
                            : "Date unavailable"}
                        </div>
                      </div>
                      <span className="account-order-status">
                        {formatOrderStatus(order.order_status)}
                      </span>
                    </div>

                    <div className="account-order-summary">
                      <div>
                        <small>Items subtotal</small>
                        <strong>{formatOrderMoney(order.subtotal)}</strong>
                      </div>
                      <div>
                        <small>Delivery charge</small>
                        <strong>
                          {order.shipping_status === "quoted"
                            ? formatOrderMoney(order.shipping_charge)
                            : "Awaiting quote"}
                        </strong>
                      </div>
                      <div>
                        <small>Final total</small>
                        <strong>{formatOrderMoney(order.total_amount)}</strong>
                      </div>
                    </div>

                    {order.shipping_status === "quoted" && order.quote_response === "pending" && (
                      <p className="account-order-notice">
                        Shipping quote received. Open the order to approve or reject it.
                      </p>
                    )}

                    <div className="account-order-bottom" style={{ marginTop: 14 }}>
                      <span className="account-order-meta">
                        {String(order.payment_method || "").toUpperCase()} · {formatOrderStatus(order.payment_status)}
                      </span>
                      <Link to={`/account/orders/${order.id}`} className="account-order-link">
                        View Details <ChevronRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Delivery addresses */}
          <section className="customer-section-card">
            <div className="customer-section-heading">
              <div>
                <h2><MapPin size={20} /> My Delivery Addresses</h2>
                <p>{addresses.length} saved address(es)</p>
              </div>

              {!showAddressForm && (
                <button
                  className="account-primary-btn account-add-btn"
                  onClick={openNewAddress}
                >
                  <Plus size={17} /> Add Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form
                onSubmit={handleAddressSave}
                className="account-form address-form"
              >
                <h3>
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h3>

                <div className="address-form-grid">
                  <div>
                    <label>Full Name *</label>
                    <input
                      name="full_name"
                      value={addressForm.full_name}
                      onChange={handleAddressChange}
                      maxLength={150}
                      required
                    />
                  </div>

                  <div>
                    <label>Mobile Number *</label>
                    <input
                      name="mobile"
                      type="tel"
                      value={addressForm.mobile}
                      onChange={handleAddressChange}
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="address-full-width">
                    <label>House / Flat / Building *</label>
                    <input
                      name="address_line1"
                      value={addressForm.address_line1}
                      onChange={handleAddressChange}
                      maxLength={255}
                      required
                    />
                  </div>

                  <div className="address-full-width">
                    <label>Street / Area / Landmark</label>
                    <input
                      name="address_line2"
                      value={addressForm.address_line2}
                      onChange={handleAddressChange}
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <label>City *</label>
                    <input
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label>State *</label>
                    <input
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label>PIN Code *</label>
                    <input
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label>Address Type</label>
                    <select
                      name="address_type"
                      value={addressForm.address_type}
                      onChange={handleAddressChange}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <label className="default-address-check">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={addressForm.is_default}
                    onChange={handleAddressChange}
                  />
                  Set as default delivery address
                </label>

                <div className="account-form-actions">
                  <button
                    className="account-primary-btn"
                    disabled={savingAddress}
                  >
                    <Save size={16} />
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>

                  <button
                    type="button"
                    className="account-outline-btn"
                    onClick={cancelAddressForm}
                    disabled={savingAddress}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showAddressForm && (
              <div className="no-addresses">
                <MapPin size={35} />
                <h3>No delivery addresses yet</h3>
                <p>Add an address for faster checkout and delivery.</p>
                <button
                  className="account-primary-btn"
                  onClick={openNewAddress}
                >
                  <Plus size={16} /> Add Your First Address
                </button>
              </div>
            )}

            <div className="customer-address-grid">
              {addresses.map((address) => (
                <article className="customer-address-card" key={address.id}>
                  <div className="address-card-top">
                    <div className="address-type-label">
                      {getAddressIcon(address.address_type)}
                      <strong>
                        {address.address_type?.toUpperCase()}
                      </strong>
                    </div>

                    {Boolean(address.is_default) && (
                      <span className="default-address-badge">
                        <Star size={12} /> Default
                      </span>
                    )}
                  </div>

                  <h3>{address.full_name}</h3>
                  <p className="address-mobile">
                    <Phone size={14} /> {address.mobile}
                  </p>

                  <p>{address.address_line1}</p>

                  {address.address_line2 && (
                    <p>{address.address_line2}</p>
                  )}

                  <p>
                    {address.city}, {address.state} - {address.pincode}
                  </p>

                  <div className="address-card-actions">
                    <button onClick={() => openEditAddress(address)}>
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      className="address-delete-action"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>

                    {!Boolean(address.is_default) && (
                      <button
                        className="address-default-action"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Star size={14} /> Set Default
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Logout */}
          <button className="customer-logout-btn" onClick={handleLogout}>
            <LogOut size={17} /> Logout
          </button>

        </div>
      </main>
    </>
  );
}