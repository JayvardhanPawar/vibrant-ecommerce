import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const money = v => v == null ? "—" : `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [staff, setStaff] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([
        apiRequest(`/orders/admin/${id}`),
        apiRequest("/delivery/admin/staff")
      ]);
      setOrder(d.order);
      setStaff(s.staff || []);
      setAssignedStaff(d.order.delivery_staff_id ? String(d.order.delivery_staff_id) : "");
      setError("");
    } catch (e) { setError(e.message); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function assign() {
    setSaving(true); setError(""); setMessage("");
    try {
      await apiRequest(`/delivery/admin/orders/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ delivery_staff_id: assignedStaff || null })
      });
      setMessage("Delivery assignment updated.");
      await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return <div style={{ minHeight: "100vh", background: "#fff7f7" }}>
    <Navbar admin />
    <main style={{ maxWidth: 950, margin: "0 auto", padding: "30px 18px", color: "#351b20" }}>
      <Link to="/admin/orders" style={{ color: "#a31324" }}>← Back to orders</Link>
      {error && <p role="alert" style={{ color: "#a31324" }}>{error}</p>}
      {message && <p style={{ color: "#167344" }}>{message}</p>}
      {!order && !error && <p>Loading order…</p>}
      {order && <section style={{ background: "#fff", border: "1px solid #f0cbd0", borderRadius: 16, padding: 24, marginTop: 18 }}>
        <h1 style={{ color: "#9f1020" }}>{order.order_number}</h1>
        <h3>Customer</h3>
        <p>{order.customer_name} · {order.customer_email} · {order.customer_mobile}</p>
        <h3>Delivery address</h3><p>{order.shipping_address}</p>
        <h3>Products</h3>
        {order.items.map((i, index) => (
          <div key={`${i.product_id}-${index}`} style={{ ...line, alignItems: "flex-start" }}>
            <span>
              <b>{i.product_name}</b> × {i.quantity} {i.sku ? `(${i.sku})` : ""}
              <small style={{ display: "block", color: "#795c60", marginTop: 5 }}>
                Item: {money(i.unit_price)} each · Delivery: {money(i.delivery_charge_per_unit)} per unit × {i.quantity} = {money(i.delivery_total)}
              </small>
            </span>
            <b>{money(i.line_total)}</b>
          </div>
        ))}
        <div style={line}><span>Subtotal</span><b>{money(order.subtotal)}</b></div>
        <div style={line}><span>Product delivery charges</span><b>{money(order.shipping_charge)}</b></div>
        <h2>Total: {money(order.total_amount)}</h2>
        <p>Order: {order.order_status} · Shipping: {order.shipping_status} · Quote response: {order.quote_response}</p>
        <p>Payment: {order.payment_method} · {order.payment_status}</p>

        {order.payment_method === "cod" && <section style={assignment}>
          <h3>Delivery assignment</h3>
          <select value={assignedStaff} onChange={e => setAssignedStaff(e.target.value)} style={select}>
            <option value="">Unassigned</option>
            {staff.filter(person => person.is_active).map(person =>
              <option key={person.id} value={person.id}>{person.full_name} — {person.mobile}</option>
            )}
          </select>
          <button disabled={saving || order.order_status === "delivered" || order.order_status === "cancelled"} onClick={assign} style={button}>
            {saving ? "Saving…" : "Save assignment"}
          </button>
          {(order.order_status === "delivered" || order.order_status === "cancelled") && <p>Assignment is locked for delivered or cancelled orders.</p>}
          <p><Link to="/admin/cod-collections">Review COD collections →</Link></p>
        </section>}
      </section>}
    </main>
  </div>;
}
const line = { display: "flex", justifyContent: "space-between", gap: 12, padding: 12, borderBottom: "1px solid #f2e2e4" };
const assignment = { marginTop: 24, padding: 18, background: "#fff8f0", border: "1px solid #f0d7b5", borderRadius: 12 };
const select = { display: "block", width: "100%", maxWidth: 420, padding: 10, margin: "10px 0", borderRadius: 8, border: "1px solid #d9b9bd" };
const button = { padding: 10, border: 0, borderRadius: 8, background: "#9f1020", color: "#fff", cursor: "pointer" };
