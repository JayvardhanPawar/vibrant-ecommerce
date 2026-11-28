import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const money = v => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function AdminCODCollections() {
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState("submitted");
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiRequest(`/delivery/admin/collections?status=${status}`);
      setCollections(data.collections || []);
      setError("");
    } catch (e) { setError(e.message); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function review(item, action) {
    setBusy(item.id);
    setError("");
    try {
      await apiRequest(`/delivery/admin/collections/${item.id}/${action}`, {
        method: "PATCH",
        body: JSON.stringify({ verification_note: notes[item.id] || "" })
      });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(null); }
  }

  return <div style={{ minHeight: "100vh", background: "#fff7f7" }}>
    <Navbar admin />
    <main style={s.main}>
      <h1>COD Collection Verification</h1>
      <p>Verify actual cash/UPI collection before payment status changes to paid.</p>
      <select value={status} onChange={e => setStatus(e.target.value)} style={s.select}>
        <option value="submitted">Awaiting verification</option>
        <option value="verified">Verified</option>
        <option value="rejected">Rejected</option>
      </select>
      {error && <p role="alert" style={s.error}>{error}</p>}
      {!collections.length && <p>No collection records in this view.</p>}
      {collections.map(item => <section key={item.id} style={s.card}>
        <div style={s.row}><h3>{item.order_number}</h3><b>{money(item.amount)}</b></div>
        <p><b>Staff:</b> {item.delivery_staff_name} ({item.delivery_staff_username})</p>
        <p><b>Method:</b> {item.collection_method} · <b>Reference:</b> {item.transaction_reference || "—"}</p>
        <p><b>Order total:</b> {money(item.total_amount)} · <b>Payment:</b> {item.payment_status}</p>
        <p><b>Order status:</b> {item.order_status}</p>
        {item.collection_note && <p><b>Staff note:</b> {item.collection_note}</p>}
        {item.verification_note && <p><b>Admin note:</b> {item.verification_note}</p>}
        {item.collection_status === "submitted" && <>
          <textarea placeholder="Verification/rejection note (optional)" style={s.textarea} value={notes[item.id] || ""} onChange={e => setNotes(old => ({ ...old, [item.id]: e.target.value }))} />
          <div style={s.row}>
            <button disabled={busy === item.id} style={s.verify} onClick={() => review(item, "verify")}>Verify collection</button>
            <button disabled={busy === item.id} style={s.reject} onClick={() => review(item, "reject")}>Reject</button>
          </div>
        </>}
      </section>)}
    </main>
  </div>;
}
const s = {
  main: { maxWidth: 1000, margin: "0 auto", padding: 24, color: "#351b20", fontFamily: "Arial,sans-serif" },
  card: { background: "#fff", border: "1px solid #f0cbd0", borderRadius: 12, padding: 18, marginTop: 14 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  select: { padding: 10, borderRadius: 8, border: "1px solid #d9b9bd" },
  textarea: { display: "block", width: "100%", minHeight: 70, boxSizing: "border-box", padding: 10, margin: "10px 0", border: "1px solid #d9b9bd", borderRadius: 8 },
  verify: { padding: 10, border: 0, borderRadius: 7, background: "#167344", color: "#fff", cursor: "pointer" },
  reject: { padding: 10, border: 0, borderRadius: 7, background: "#a31324", color: "#fff", cursor: "pointer" },
  error: { color: "#a31324" }
};
