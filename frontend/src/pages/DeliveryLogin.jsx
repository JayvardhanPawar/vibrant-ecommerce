import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, ArrowLeft } from "lucide-react";
import { apiRequest } from "../services/api";

/* ---------- UI styles only (red & white theme) ---------- */
const css = `
.dlg {
  --a1: #e11d2e;
  --a2: #b3121f;
  --a3: #7a0b14;
  --soft: #fdecee;
  --line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 18px;
  font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--ink);
  background: linear-gradient(135deg, var(--a1) 0%, var(--a2) 55%, var(--a3) 100%);
}
.dlg *, .dlg *::before, .dlg *::after { box-sizing: border-box; }
.dlg::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 50% 45%, #000 0%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 45%, #000 0%, transparent 72%);
}
.dlg-orb {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.dlg-orb.a { width: 360px; height: 360px; top: -120px; left: -90px; background: #ff6b76; opacity: .45; }
.dlg-orb.b { width: 340px; height: 340px; bottom: -140px; right: -80px; background: #fff; opacity: .2; }

.dlg-card {
  width: 100%;
  max-width: 430px;
  display: grid;
  gap: 18px;
  padding: 34px 30px 28px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 40px 80px -30px rgba(40, 0, 6, 0.7);
  animation: dlg-in 0.8s var(--ease) both;
}
@keyframes dlg-in {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
.dlg-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin: 0 auto;
  border-radius: 17px;
  color: #fff;
  background: linear-gradient(135deg, var(--a1), var(--a2));
  box-shadow: 0 16px 28px -14px rgba(225, 29, 46, 0.95);
}
.dlg-card h1 {
  margin: 0;
  text-align: center;
  color: var(--a3);
  font-size: 24px;
  letter-spacing: -0.03em;
}
.dlg-sub {
  margin: -6px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.dlg-error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff0f1;
  border: 1px solid #f7c9ce;
  color: var(--a2);
  font-size: 13px;
  font-weight: 600;
}
.dlg-field {
  display: block;
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
}
.dlg-field input {
  display: block;
  width: 100%;
  margin-top: 7px;
  padding: 13px 14px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: #fffafa;
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  outline: 0;
  transition: border-color .25s ease, box-shadow .3s ease, background .25s ease;
}
.dlg-field input:hover { border-color: #eba5ab; }
.dlg-field input:focus {
  border-color: var(--a1);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.12);
}
.dlg-btn {
  padding: 14px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--a1), var(--a2));
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 28px -14px rgba(179, 18, 31, 0.95);
  transition: transform .3s var(--ease), box-shadow .3s ease, opacity .2s ease;
}
.dlg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 20px 32px -14px rgba(179, 18, 31, 1); }
.dlg-btn:active:not(:disabled) { transform: scale(0.98); }
.dlg-btn:disabled { opacity: .65; cursor: not-allowed; }
.dlg-btn:focus-visible { outline: 2px solid var(--a1); outline-offset: 3px; }
.dlg-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: color .25s ease, gap .3s var(--ease);
}
.dlg-back:hover { color: var(--a1); gap: 10px; }
@media (max-width: 480px) {
  .dlg-card { padding: 28px 20px 24px; border-radius: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .dlg *, .dlg *::before { animation: none !important; transition: none !important; }
}
`;

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiRequest("/delivery/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      navigate("/delivery/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="dlg">
    <style>{css}</style>
    <span className="dlg-orb a" aria-hidden="true" />
    <span className="dlg-orb b" aria-hidden="true" />

    <form onSubmit={submit} className="dlg-card">
      <span className="dlg-icon" aria-hidden="true"><Truck size={28} /></span>
      <h1>Delivery Staff Login</h1>
      <p className="dlg-sub">Sign in to view your assigned COD deliveries.</p>
      {error && <p role="alert" className="dlg-error">{error}</p>}
      <label className="dlg-field">Username<input required value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
      <label className="dlg-field">Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
      <button disabled={busy} className="dlg-btn">{busy ? "Signing in…" : "Sign in"}</button>
      <Link to="/" className="dlg-back"><ArrowLeft size={15} /> Back to store</Link>
    </form>
  </main>;
}