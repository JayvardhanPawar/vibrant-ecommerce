import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LockKeyhole, User, ShoppingBag } from "lucide-react";
import { apiRequest } from "../services/api";

const css = `
.login-page {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--red-1) 0%, var(--red-2) 55%, var(--red-3) 100%);
}
.login-page *,
.login-page *::before,
.login-page *::after {
  box-sizing: border-box;
}

/* animated grid + glow behind the card */
.login-page::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 50% 50%, #000 0%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 0%, transparent 72%);
  animation: al-grid 24s linear infinite;
}
.login-page::after {
  content: "";
  position: absolute;
  z-index: -1;
  width: 460px;
  height: 460px;
  top: -140px;
  right: -100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  filter: blur(70px);
  animation: al-orb 14s ease-in-out infinite;
}

/* ---------- Card ---------- */
.login-page .login-card {
  position: relative;
  width: 100%;
  max-width: 430px;
  padding: 38px 34px 28px;
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 50px 90px -40px rgba(40, 0, 6, 0.85);
  animation: al-card-in 0.9s var(--ease) both;
}
.login-page .login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-bottom: 24px;
  color: var(--red-3);
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.5px;
  text-decoration: none;
  animation: al-rise 0.7s var(--ease) 0.15s both;
}
.login-page .login-brand svg {
  padding: 8px;
  box-sizing: content-box;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 12px;
  box-shadow: 0 10px 20px -10px rgba(179, 18, 31, 0.9);
  transition: transform 0.5s var(--ease);
}
.login-page .login-brand:hover svg {
  transform: rotate(-10deg) scale(1.08);
}
.login-page .login-brand .brand-accent {
  color: var(--red-1);
}

.login-page .login-heading {
  margin-bottom: 22px;
  text-align: center;
  animation: al-rise 0.7s var(--ease) 0.22s both;
}
.login-page .login-icon {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--red-1);
  background: var(--red-soft);
  border: 1px solid #f7c9ce;
  border-radius: 20px;
  animation: al-float 4.5s ease-in-out infinite;
}
.login-page .login-icon::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--red-1);
  animation: al-ring 2.6s ease-out infinite;
}
.login-page .login-heading h2 {
  margin: 0 0 6px;
  color: var(--red-3);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.login-page .login-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

/* ---------- Form ---------- */
.login-page form > * {
  opacity: 0;
  animation: al-rise 0.6s var(--ease) forwards;
}
.login-page form > *:nth-child(1) { animation-delay: 0.30s; }
.login-page form > *:nth-child(2) { animation-delay: 0.36s; }
.login-page form > *:nth-child(3) { animation-delay: 0.42s; }
.login-page form > *:nth-child(4) { animation-delay: 0.48s; }
.login-page form > *:nth-child(5) { animation-delay: 0.54s; }
.login-page form > *:nth-child(n+6) { animation-delay: 0.6s; }

.login-page form label {
  display: block;
  margin: 16px 0 8px;
  color: var(--red-2);
  font-size: 13px;
  font-weight: 750;
}
.login-page .input-wrapper {
  display: flex;
  align-items: center;
  gap: 11px;
  height: 50px;
  padding: 0 16px;
  color: #b48a8f;
  background: #fff6f6;
  border: 1.5px solid var(--red-line);
  border-radius: 14px;
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.4s var(--ease),
    color 0.3s ease;
}
.login-page .input-wrapper svg {
  flex: none;
  transition: transform 0.4s var(--ease);
}
.login-page .input-wrapper:hover {
  border-color: #eba5ab;
}
.login-page .input-wrapper:focus-within {
  color: var(--red-1);
  background: #ffffff;
  border-color: var(--red-1);
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.13), 0 14px 26px -18px rgba(225, 29, 46, 0.7);
}
.login-page .input-wrapper:focus-within svg {
  transform: scale(1.15) rotate(-8deg);
}
.login-page .input-wrapper input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  color: var(--red-3);
  font-family: inherit;
  font-size: 14.5px;
  background: transparent;
  border: 0;
  outline: none;
  box-shadow: none;
}
.login-page .input-wrapper input::placeholder {
  color: #b48a8f;
}

.login-page .error-message {
  margin: 16px 0 0;
  padding: 11px 14px;
  color: var(--red-3);
  background: #fff1f2;
  border: 1px solid #f0a0a8;
  border-left: 4px solid var(--red-1);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  animation: al-shake 0.45s ease both;
}

.login-page .primary-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 52px;
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border: 0;
  border-radius: 14px;
  box-shadow: 0 16px 28px -14px rgba(179, 18, 31, 0.95);
  font-family: inherit;
  font-size: 15px;
  font-weight: 750;
  cursor: pointer;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease, opacity 0.3s ease;
}
.login-page .primary-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: al-sheen 4.5s ease-in-out infinite 1.5s;
}
.login-page .primary-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 22px 34px -14px rgba(179, 18, 31, 1);
}
.login-page .primary-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.login-page .primary-btn:disabled {
  opacity: 0.85;
  cursor: progress;
}
.login-page .primary-btn:disabled::before {
  content: "";
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: al-spin 0.7s linear infinite;
}

.login-page .back-link {
  display: block;
  margin-top: 22px;
  color: var(--red-2);
  text-align: center;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.35s var(--ease);
  animation: al-rise 0.6s var(--ease) 0.7s both;
}
.login-page .back-link:hover {
  color: var(--red-1);
  transform: translateX(-4px);
}

/* ---------- Keyframes ---------- */
@keyframes al-card-in {
  from { opacity: 0; transform: translateY(34px) scale(0.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes al-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
@keyframes al-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes al-ring {
  0%   { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}
@keyframes al-grid {
  to { background-position: 48px 48px; }
}
@keyframes al-orb {
  0%, 100% { transform: translate(0, 0); }
  50%      { transform: translate(-30px, 30px); }
}
@keyframes al-sheen {
  0%, 60% { transform: translateX(-120%); }
  100%    { transform: translateX(120%); }
}
@keyframes al-shake {
  0%   { opacity: 0; transform: translateX(-8px); }
  30%  { opacity: 1; transform: translateX(7px); }
  60%  { transform: translateX(-4px); }
  100% { transform: none; }
}
@keyframes al-spin {
  to { transform: rotate(360deg); }
}

.login-page a:focus-visible,
.login-page button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .login-page .login-card {
    padding: 30px 22px 24px;
    border-radius: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-page *,
  .login-page *::before,
  .login-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .login-page form > *,
  .login-page .login-brand,
  .login-page .login-heading,
  .login-page .back-link {
    opacity: 1;
  }
}
`;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("admin_token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <style>{css}</style>
      <div className="login-card">
        <Link to="/" className="brand login-brand">
          <ShoppingBag size={26} />
          <span>
            Vibrant<span className="brand-accent">Infotech</span>
          </span>
        </Link>

        <div className="login-heading">
          <div className="login-icon">
            <LockKeyhole size={25} />
          </div>
          <h2>Admin Login</h2>
          <p>Sign in to manage your products.</p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <div className="input-wrapper">
            <User size={18} />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <label>Password</label>
          <div className="input-wrapper">
            <LockKeyhole size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link to="/" className="back-link">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}