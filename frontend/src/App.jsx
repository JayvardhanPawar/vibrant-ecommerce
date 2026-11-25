
import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerAccount from "./pages/CustomerAccount";
import Footer from "./components/Footer";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("admin_token");

  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* STOREFRONT */}
        <Route path="/" element={<Home />} />

        {/* PRODUCT CATALOGUE */}
        <Route path="/products" element={<Products />} />

        {/* PRODUCT DETAILS */}
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* SHOPPING CART */}
        <Route path="/cart" element={<CartPage />} />

        {/* CUSTOMER AUTHENTICATION */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/account" element={<CustomerAccount />} />

        {/* CUSTOMER SUPPORT */}
        <Route path="/contact" element={<Contact />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* INVALID ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}
