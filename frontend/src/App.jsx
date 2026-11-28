import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { apiRequest } from "./services/api";
import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import AdminCODCollections from "./pages/AdminCODCollections";
import AdminDeliveryStaff from "./pages/AdminDeliveryStaff";

import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerAccount from "./pages/CustomerAccount";
import Checkout from "./pages/Checkout";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerOrderDetail from "./pages/CustomerOrderDetail";

import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryDashboard from "./pages/DeliveryDashboard";

// Existing admin cookie session guard
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    let mounted = true;
    apiRequest("/admin/me")
      .then(() => {
        if (mounted) {
          localStorage.setItem("admin_session_active", "1");
          setStatus("valid");
        }
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem("admin_session_active");
          setStatus("invalid");
        }
      });
    return () => { mounted = false; };
  }, []);
  if (status === "checking") return <div style={{ padding: 32, textAlign: "center" }}>Checking admin session...</div>;
  return status === "valid" ? children : <Navigate to="/admin/login" replace />;
}

function DeliveryProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    let mounted = true;
    apiRequest("/delivery/me")
      .then(() => { if (mounted) setStatus("valid"); })
      .catch(() => { if (mounted) setStatus("invalid"); });
    return () => { mounted = false; };
  }, []);
  if (status === "checking") return <div style={{ padding: 32, textAlign: "center" }}>Checking delivery session...</div>;
  return status === "valid" ? children : <Navigate to="/delivery/login" replace />;
}

export default function App() {
  return <CartProvider><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<Checkout />} />

    <Route path="/login" element={<CustomerLogin />} />
    <Route path="/register" element={<CustomerRegister />} />
    <Route path="/account" element={<CustomerAccount />} />
    <Route path="/account/orders" element={<CustomerOrders />} />
    <Route path="/account/orders/:id" element={<CustomerOrderDetail />} />
    <Route path="/contact" element={<Contact />} />

    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/dashboard" element={<Navigate to="/admin/products/add" replace />} />
    <Route path="/admin/products/add" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/products" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
    <Route path="/admin/orders/:id" element={<ProtectedRoute><AdminOrderDetail /></ProtectedRoute>} />
    <Route path="/admin/delivery-staff" element={<ProtectedRoute><AdminDeliveryStaff /></ProtectedRoute>} />
    <Route path="/admin/cod-collections" element={<ProtectedRoute><AdminCODCollections /></ProtectedRoute>} />

    <Route path="/delivery/login" element={<DeliveryLogin />} />
    <Route path="/delivery/dashboard" element={<DeliveryProtectedRoute><DeliveryDashboard /></DeliveryProtectedRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></CartProvider>;
}
