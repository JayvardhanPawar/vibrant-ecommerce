import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

export default function AdminDeliveryStaff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ full_name: "", mobile: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const data = await apiRequest("/delivery/admin/staff"); setStaff(data.staff || []); }
    catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await apiRequest("/delivery/admin/staff", { method: "POST", body: JSON.stringify(form) });
      setForm({ full_name: "", mobile: "", username: "", password: "" });
      setMessage("Delivery staff account created.");
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function toggle(person) {
    try {
      await apiRequest(`/delivery/admin/staff/${person.id}/status`, {
        method: "PATCH", body: JSON.stringify({ is_active: !person.is_active })
      });
      await load();
    } catch (e) { setError(e.message); }
  }

  const field = (key, label, type = "text") => <label>{label}
    <input required type={type} minLength={type === "password" ? 8 : undefined}
      value={form[key]} onChange={e => setForm(old => ({ ...old, [key]: e.target.value }))}
      style={s.input} />
  </label>;

  return <div style={{ minHeight: "100vh", background: "#fff7f7" }}>
    <Navbar admin />
    <main style={s.main}>
      <h1>Delivery Staff</h1>
      <form onSubmit={create} style={s.form}>
        <h2>Create delivery account</h2>
        {field("full_name", "Full name")}
        {field("mobile", "Mobile")}
        {field("username", "Username")}
        {field("password", "Temporary password (minimum 8 characters)", "password")}
        <button disabled={busy} style={s.button}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      {error && <p role="alert" style={s.error}>{error}</p>}
      {message && <p style={s.success}>{message}</p>}
      <h2>Existing staff</h2>
      {staff.map(person => <div key={person.id} style={s.person}>
        <div><b>{person.full_name}</b><div>{person.mobile} · @{person.username}</div></div>
        <button onClick={() => toggle(person)} style={s.secondary}>{person.is_active ? "Deactivate" : "Activate"}</button>
      </div>)}
    </main>
  </div>;
}
const s = {
  main: { maxWidth: 850, margin: "0 auto", padding: 24, color: "#351b20", fontFamily: "Arial,sans-serif" },
  form: { display: "grid", gap: 12, background: "#fff", border: "1px solid #f0cbd0", padding: 20, borderRadius: 12 },
  input: { display: "block", width: "100%", boxSizing: "border-box", padding: 10, marginTop: 5, border: "1px solid #d9b9bd", borderRadius: 7 },
  button: { padding: 11, border: 0, borderRadius: 7, background: "#9f1020", color: "#fff", cursor: "pointer" },
  person: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", background: "#fff", padding: 14, borderRadius: 9, marginTop: 8 },
  secondary: { padding: 9, border: "1px solid #d9b9bd", borderRadius: 7, background: "#fff", cursor: "pointer" },
  error: { color: "#a31324" }, success: { color: "#167344" }
};
