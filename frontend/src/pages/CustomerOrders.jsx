import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { customerApiRequest, getCustomerToken } from "../services/customerApi";

const money = (n) => n == null ? "₹0" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const label = (v) => String(v || "").replaceAll("_", " ");

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCustomerToken()) {
      navigate("/login?redirect=/account/orders", { replace: true });
      return;
    }
    customerApiRequest("/orders/mine")
      .then((data) => setOrders(data.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  return <div style={{ minHeight: "100vh", background: "#fff7f7", color: "#351b20" }}>
    <Navbar />
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: "32px 18px 70px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ color: "#9f1020", marginBottom: 5 }}>My Orders</h1><p style={{ color: "#795c60", marginTop: 0 }}>View your purchases and order progress.</p></div>
        <Link to="/products" style={buttonLink}>Continue shopping</Link>
      </div>
      {error && <p role="alert" style={errorStyle}>{error}</p>}
      {loading ? <p>Loading your orders…</p> : !orders.length && !error ? <section style={panel}><h2>No orders yet</h2><p>Your placed orders will appear here.</p><Link to="/products" style={{ color: "#a31324" }}>Browse products</Link></section> : orders.map((o) =>
        <article key={o.id} style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div><strong style={{ color: "#9f1020", fontSize: 17 }}>{o.order_number}</strong><div style={muted}>Placed {new Date(o.created_at).toLocaleString()}</div></div>
            <span style={statusPill}>{label(o.order_status)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, margin: "16px 0" }}>
            <div><small style={muted}>Items subtotal</small><div><b>{money(o.subtotal)}</b></div></div>
            <div><small style={muted}>Delivery charge</small><div><b>{money(o.shipping_charge)}</b></div></div>
            <div><small style={muted}>Final total</small><div><b>{money(o.total_amount)}</b></div></div>
            <div><small style={muted}>Payment</small><div><b>{String(o.payment_method).toUpperCase()}</b> · {label(o.payment_status)}</div></div>
          </div>
          <Link to={`/account/orders/${o.id}`} style={{ color: "#a31324", fontWeight: 750 }}>View order details →</Link>
        </article>
      )}
    </main>
  </div>;
}
const panel = { background: "#fff", border: "1px solid #f0cbd0", borderRadius: 16, padding: 20, marginBottom: 14, boxShadow: "0 10px 25px rgba(110,20,30,.04)" };
const muted = { color: "#795c60", fontSize: 12 };
const statusPill = { alignSelf: "flex-start", padding: "7px 12px", borderRadius: 30, background: "#fff0f1", color: "#9f1020", fontSize: 12, fontWeight: 750, textTransform: "capitalize" };
const buttonLink = { background: "#c91f32", color: "#fff", padding: "10px 14px", borderRadius: 9, textDecoration: "none", fontWeight: 700 };
const quoteNotice = { padding: 12, background: "#fff8e8", borderRadius: 9, color: "#75521b" };
const approvedNotice = { padding: 12, background: "#effaf3", borderRadius: 9, color: "#176b3a" };
const errorStyle = { padding: 12, background: "#fff0f1", borderRadius: 9, color: "#9f1020" };
