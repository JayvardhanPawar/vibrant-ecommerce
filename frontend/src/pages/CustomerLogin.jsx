import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import Navbar from "../components/Navbar";
import { customerApiRequest, saveCustomerSession } from "../services/customerApi";

const css = `
.customer-auth-page {
  --red-1: #e11d2e;
  --red-2: #b3121f;
  --red-3: #7a0b14;
  --red-soft: #fdecee;
  --red-line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  min-height: calc(100vh - 124px);
  padding: 48px 16px 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fff6f6 0%, #ffffff 100%);
  color: var(--ink);
}
.customer-auth-page *,
.customer-auth-page *::before,
.customer-auth-page *::after {
  box-sizing: border-box;
}

/* soft animated background shapes */
.customer-auth-page::before,
.customer-auth-page::after {
  content: "";
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(60px);
}
.customer-auth-page::before {
  width: 360px;
  height: 360px;
  top: -120px;
  left: -100px;
  background: rgba(225, 29, 46, 0.22);
  animation: au-orb 14s ease-in-out infinite;
}
.customer-auth-page::after {
  width: 320px;
  height: 320px;
  bottom: -120px;
  right: -80px;
  background: rgba(255, 107, 118, 0.25);
  animation: au-orb 17s ease-in-out infinite reverse;
}

/* ---------- Card ---------- */
.customer-auth-page .customer-auth-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 38px 34px 32px;
  background: #ffffff;
  border: 1px solid var(--red-line);
  border-top: 4px solid var(--red-1);
  border-radius: 28px;
  box-shadow: 0 40px 70px -40px rgba(179, 18, 31, 0.7);
  animation: au-card-in 0.9s var(--ease) both;
}
.customer-auth-page .customer-auth-icon {
  position: relative;
  width: 62px;
  height: 62px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, var(--red-1), var(--red-2));
  border-radius: 20px;
  box-shadow: 0 16px 28px -12px rgba(179, 18, 31, 0.9);
  animation: au-float 4.5s ease-in-out infinite;
}
.customer-auth-page .customer-auth-icon::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--red-1);
  animation: au-ring 2.6s ease-out infinite;
}
.customer-auth-page .customer-auth-card h1 {
  margin: 0 0 8px;
  color: var(--red-3);
  text-align: center;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.customer-auth-page .customer-auth-subtitle {
  margin: 0 0 26px;
  color: var(--muted);
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
}

/* ---------- Form ---------- */
.customer-auth-page form > * {
  opacity: 0;
  animation: au-rise 0.6s var(--ease) forwards;
}
.customer-auth-page form > *:nth-child(1)  { animation-delay: 0.20s; }
.customer-auth-page form > *:nth-child(2)  { animation-delay: 0.26s; }
.customer-auth-page form > *:nth-child(3)  { animation-delay: 0.32s; }
.customer-auth-page form > *:nth-child(4)  { animation-delay: 0.38s; }
.customer-auth-page form > *:nth-child(5)  { animation-delay: 0.44s; }
.customer-auth-page form > *:nth-child(6)  { animation-delay: 0.50s; }
.customer-auth-page form > *:nth-child(7)  { animation-delay: 0.56s; }
.customer-auth-page form > *:nth-child(8)  { animation-delay: 0.62s; }
.customer-auth-page form > *:nth-child(9)  { animation-delay: 0.68s; }
.customer-auth-page form > *:nth-child(10) { animation-delay: 0.74s; }
.customer-auth-page form > *:nth-child(n+11) { animation-delay: 0.8s; }

.customer-auth-page form label {
  display: block;
  margin: 16px 0 8px;
  color: var(--red-2);
  font-size: 13px;
  font-weight: 750;
}
.customer-auth-page form label span {
  color: var(--muted);
  font-weight: 500;
}
.customer-auth-page .customer-input {
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
.customer-auth-page .customer-input svg {
  flex: none;
  transition: transform 0.4s var(--ease);
}
.customer-auth-page .customer-input:hover {
  border-color: #eba5ab;
}
.customer-auth-page .customer-input:focus-within {
  color: var(--red-1);
  background: #ffffff;
  border-color: var(--red-1);
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.13), 0 14px 26px -18px rgba(225, 29, 46, 0.7);
}
.customer-auth-page .customer-input:focus-within svg {
  transform: scale(1.15) rotate(-8deg);
}
.customer-auth-page .customer-input input {
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
.customer-auth-page .customer-input input::placeholder {
  color: #b48a8f;
}

.customer-auth-page .error-message {
  margin: 16px 0 0;
  padding: 11px 14px;
  color: var(--red-3);
  background: #fff1f2;
  border: 1px solid #f0a0a8;
  border-left: 4px solid var(--red-1);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  animation: au-shake 0.45s ease both;
}

/* ---------- Button ---------- */
.customer-auth-page .customer-primary-btn {
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
.customer-auth-page .customer-primary-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: au-sheen 4.5s ease-in-out infinite 1.5s;
}
.customer-auth-page .customer-primary-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 22px 34px -14px rgba(179, 18, 31, 1);
}
.customer-auth-page .customer-primary-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.customer-auth-page .customer-primary-btn:disabled {
  opacity: 0.85;
  cursor: progress;
}
.customer-auth-page .customer-primary-btn:disabled::before {
  content: "";
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: au-spin 0.7s linear infinite;
}

/* ---------- Footer link ---------- */
.customer-auth-page .customer-auth-footer {
  margin: 24px 0 0;
  color: var(--muted);
  text-align: center;
  font-size: 13.5px;
}
.customer-auth-page .customer-auth-footer a {
  position: relative;
  color: var(--red-1);
  font-weight: 750;
  text-decoration: none;
}
.customer-auth-page .customer-auth-footer a::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--red-1);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease);
}
.customer-auth-page .customer-auth-footer a:hover::after {
  transform: scaleX(1);
}

/* ---------- Keyframes ---------- */
@keyframes au-card-in {
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}
@keyframes au-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
@keyframes au-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes au-ring {
  0%   { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}
@keyframes au-orb {
  0%, 100% { transform: translate(0, 0); }
  50%      { transform: translate(30px, 24px); }
}
@keyframes au-sheen {
  0%, 60% { transform: translateX(-120%); }
  100%    { transform: translateX(120%); }
}
@keyframes au-shake {
  0%   { opacity: 0; transform: translateX(-8px); }
  30%  { opacity: 1; transform: translateX(7px); }
  60%  { transform: translateX(-4px); }
  100% { transform: none; }
}
@keyframes au-spin {
  to { transform: rotate(360deg); }
}

.customer-auth-page a:focus-visible,
.customer-auth-page button:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .customer-auth-page {
    padding: 28px 14px 48px;
    align-items: flex-start;
  }
  .customer-auth-page .customer-auth-card {
    padding: 30px 22px 26px;
    border-radius: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .customer-auth-page *,
  .customer-auth-page *::before,
  .customer-auth-page *::after {
    animation: none !important;
    transition: none !important;
  }
  .customer-auth-page form > * {
    opacity: 1;
  }
}
`;

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await customerApiRequest("/customer/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      saveCustomerSession(data.token, data.customer);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <Navbar />
      <main className="customer-auth-page">
        <section className="customer-auth-card">
          <div className="customer-auth-icon">
            <LogIn size={26} />
          </div>

          <h1>Welcome back</h1>
          <p className="customer-auth-subtitle">
            Login to your customer account.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email address</label>
            <div className="customer-input">
              <Mail size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="customer-input">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button className="customer-primary-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="customer-auth-footer">
            New customer? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
    </>
  );
}