import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Clock, XCircle, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import { customerApiRequest } from "../services/customerApi";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const humanize = (v) => String(v || "—").replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const dateText = (v) => v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleString("en-IN") : "—";

const canCancel = (order) =>
  !!order &&
  !["cancelled", "shipped", "delivered", "packing", "ready_to_ship"].includes(order.order_status) &&
  !order.packing_started_at;

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrder = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const data = await customerApiRequest(`/orders/${id}`);
      setOrder(data.order || null);
    } catch (e) {
      setError(e.message || "Unable to load order details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  async function cancelOrder() {
    setCancelling(true);
    setError("");
    setMessage("");
    try {
      const data = await customerApiRequest(`/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Customer requested cancellation" }),
      });
      setMessage(data.message || "Your order has been cancelled.");
      await loadOrder(true);
    } catch (e) {
      setError(e.message || "Unable to cancel this order.");
    } finally {
      setCancelling(false);
    }
  }

  const items = order?.items || [];
  const history = order?.history || [];
  const cancellationRequests = order?.cancellation_requests || [];

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <Link to="/account/orders" style={styles.back}><ArrowLeft size={17} /> Back to My Orders</Link>

        <div style={styles.headingRow}>
          <div>
            <span style={styles.eyebrow}>ORDER INFORMATION</span>
            <h1 style={styles.heading}>Order Details</h1>
            <p style={styles.muted}>Review your items, delivery information and order progress.</p>
          </div>
          <button onClick={() => loadOrder(true)} disabled={refreshing || loading} style={styles.refresh}>
            <RefreshCw size={16} /> {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <p role="alert" style={styles.error}>{error}</p>}
        {message && <p role="status" style={styles.success}>{message}</p>}
        {loading ? <section style={styles.panel}>Loading order details...</section> :
          !order && !error ? <section style={styles.panel}>
            <h2>Order not found</h2>
            <p style={styles.muted}>We couldn't find this order or you may not have permission to view it.</p>
          </section> : <>
            <section style={styles.panel}>
              <div style={styles.orderHead}>
                <div>
                  <small style={styles.small}>ORDER NUMBER</small>
                  <h2 style={styles.orderNumber}>{order.order_number}</h2>
                  <small style={styles.small}>Placed on {dateText(order.created_at)}</small>
                </div>
                <span style={styles.pill}>{humanize(order.order_status)}</span>
              </div>
              <div style={styles.summaryGrid}>
                <Summary icon={<Package size={18} />} label="Order status" value={humanize(order.order_status)} />
                <Summary icon={<CreditCard size={18} />} label="Payment" value={`${humanize(order.payment_method)} · ${humanize(order.payment_status)}`} />
                <Summary icon={<Truck size={18} />} label="Delivery status" value={humanize(order.shipping_status)} />
              </div>
            </section>

            <section style={styles.panel}>
              <SectionTitle icon={<Package size={19} />} title="Items ordered" />
              {items.length ? items.map((item, i) => (
                <div key={`${item.product_id}-${i}`} style={styles.itemRow}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={styles.itemName}>{item.product_name}</strong>
                    {item.sku && <small style={styles.small}>SKU: {item.sku}</small>}
                    <small style={styles.small}>{money(item.unit_price)} × {item.quantity}</small>
                    <small style={styles.small}>Delivery: {money(item.delivery_charge_per_unit)} per unit · {money(item.delivery_total)} total</small>
                  </div>
                  <strong style={styles.amount}>{money(item.line_total)}</strong>
                </div>
              )) : <p style={styles.muted}>No item details are available.</p>}

              <div style={styles.totals}>
                <div style={styles.totalRow}><span>Items subtotal</span><strong>{money(order.subtotal)}</strong></div>
                <div style={styles.totalRow}><span>Delivery charges</span><strong>{money(order.shipping_charge)}</strong></div>
                <div style={{ ...styles.totalRow, ...styles.grandTotal }}><span>Order total</span><strong>{money(order.total_amount)}</strong></div>
                <p style={styles.note}>Delivery charges are calculated from each product's delivery charge multiplied by the ordered quantity.</p>
              </div>
            </section>

            <section style={styles.panel}>
              <SectionTitle icon={<MapPin size={19} />} title="Delivery address" />
              <p style={styles.address}>{order.shipping_address || "Delivery address not available."}</p>
            </section>

            {history.length > 0 && <section style={styles.panel}>
              <SectionTitle icon={<Clock size={19} />} title="Order activity" />
              <div style={{ display: "grid", gap: 17 }}>
                {history.map((entry, i) => <div key={`${entry.created_at}-${i}`} style={styles.historyRow}>
                  <span style={styles.dot} />
                  <div>
                    <strong style={styles.itemName}>{humanize(entry.new_status)}</strong>
                    <p style={styles.historyText}>{entry.note || "Order status updated"}</p>
                    <small style={styles.small}>{dateText(entry.created_at)}{entry.changed_by_type ? ` · ${humanize(entry.changed_by_type)}` : ""}</small>
                  </div>
                </div>)}
              </div>
            </section>}

            {cancellationRequests.length > 0 && <section style={styles.panel}>
              <SectionTitle icon={<XCircle size={19} />} title="Cancellation requests" />
              {cancellationRequests.map(req => <div key={req.id} style={styles.itemRow}>
                <div>
                  <strong>{humanize(req.request_status)}</strong>
                  <p style={styles.historyText}>{req.reason}</p>
                  {req.admin_note && <p style={styles.historyText}>Admin note: {req.admin_note}</p>}
                  <small style={styles.small}>{dateText(req.created_at)}</small>
                </div>
              </div>)}
            </section>}

            {canCancel(order) && <section style={styles.cancelPanel}>
              <div>
                <strong>Need to cancel this order?</strong>
                <p style={{ ...styles.muted, margin: "5px 0 0" }}>You can cancel before packing starts. Once the order enters packing, cancellation is no longer available.</p>
              </div>
              <button onClick={cancelOrder} disabled={cancelling} style={styles.cancelButton}>
                <XCircle size={17} /> {cancelling ? "Cancelling..." : "Cancel order"}
              </button>
            </section>}

            {order.order_status === "cancelled" && <p style={styles.error}>This order has been cancelled.</p>}
          </>}
      </main>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return <h2 style={styles.sectionTitle}><span style={{ color: "#c91f32" }}>{icon}</span>{title}</h2>;
}
function Summary({ icon, label, value }) {
  return <div style={styles.summaryItem}>
    <span style={styles.summaryIcon}>{icon}</span>
    <div><small style={styles.small}>{label}</small><strong style={styles.summaryValue}>{value}</strong></div>
  </div>;
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #fff7f7 0%, #fff 420px)", color: "#351b20" },
  main: { width: "100%", maxWidth: 1000, margin: "0 auto", padding: "30px 18px 70px" },
  back: { display: "inline-flex", alignItems: "center", gap: 7, color: "#a31324", textDecoration: "none", fontWeight: 650, marginBottom: 20 },
  headingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 },
  eyebrow: { color: "#b3121f", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em" },
  heading: { margin: "8px 0 5px", color: "#7a0b14", fontSize: "clamp(26px, 4vw, 34px)" },
  muted: { color: "#795c60", fontSize: 14, lineHeight: 1.6 },
  small: { display: "block", color: "#866d71", fontSize: 12, marginTop: 5 },
  refresh: { display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #efcbd0", borderRadius: 10, padding: "10px 14px", background: "#fff", color: "#9f1020", fontWeight: 700, cursor: "pointer" },
  panel: { background: "#fff", padding: 22, border: "1px solid #f0cbd0", borderRadius: 16, marginTop: 18, boxShadow: "0 12px 30px rgba(110,20,30,.045)" },
  orderHead: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, paddingBottom: 18, borderBottom: "1px solid #f2e2e4" },
  orderNumber: { margin: "5px 0", color: "#9f1020", fontSize: 24 },
  pill: { display: "inline-flex", padding: "8px 13px", borderRadius: 30, background: "#fff0f1", color: "#9f1020", fontSize: 13, fontWeight: 750, textTransform: "capitalize" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, paddingTop: 18 },
  summaryItem: { display: "flex", alignItems: "center", gap: 11, padding: 12, background: "#fff8f8", border: "1px solid #f5e1e3", borderRadius: 12 },
  summaryIcon: { display: "grid", placeItems: "center", width: 38, height: 38, flex: "0 0 38px", borderRadius: 10, background: "#fdecee", color: "#b3121f" },
  summaryValue: { display: "block", marginTop: 4, color: "#492b30", fontSize: 13 },
  sectionTitle: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 18px", color: "#8f101d", fontSize: 18 },
  itemRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "14px 0", borderBottom: "1px solid #f2e2e4" },
  itemName: { display: "block", color: "#492b30", fontSize: 14 },
  amount: { color: "#8f101d", whiteSpace: "nowrap", fontSize: 14 },
  totals: { maxWidth: 460, marginLeft: "auto", paddingTop: 15 },
  totalRow: { display: "flex", justifyContent: "space-between", gap: 15, padding: "9px 0", color: "#65494e", fontSize: 14 },
  grandTotal: { marginTop: 5, paddingTop: 14, borderTop: "1px solid #edcbd0", color: "#8f101d", fontSize: 18, fontWeight: 800 },
  note: { margin: "8px 0 0", color: "#866d71", fontSize: 12, lineHeight: 1.6 },
  address: { margin: 0, lineHeight: 1.8, color: "#594247" },
  historyRow: { display: "grid", gridTemplateColumns: "12px minmax(0, 1fr)", gap: 12, alignItems: "start" },
  dot: { width: 10, height: 10, marginTop: 5, borderRadius: "50%", background: "#c91f32", boxShadow: "0 0 0 4px #fdecee" },
  historyText: { margin: "4px 0", color: "#795c60", fontSize: 13, lineHeight: 1.5 },
  cancelPanel: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginTop: 18, padding: 20, background: "#fff", border: "1px solid #f0cbd0", borderRadius: 16 },
  cancelButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #dcaab1", borderRadius: 10, padding: "11px 15px", background: "#fff", color: "#a31324", fontWeight: 750, cursor: "pointer" },
  error: { marginTop: 16, padding: 13, background: "#fff0f1", color: "#9f1020", borderRadius: 10, lineHeight: 1.5 },
  success: { marginTop: 16, padding: 13, background: "#effaf3", color: "#176b3a", borderRadius: 10, lineHeight: 1.5 },
};
