import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/* ---------- UI styles only (red & white theme) ---------- */
const css = `
.dd {
  --a1: #e11d2e;
  --a2: #b3121f;
  --a3: #7a0b14;
  --soft: #fdecee;
  --line: #f3d3d6;
  --ink: #3b1f23;
  --muted: #7c5b5f;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 100vh;
  background: #fffafa;
  color: var(--ink);
  font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}
.dd *, .dd *::before, .dd *::after { box-sizing: border-box; }
.dd-wrap { max-width: 1140px; margin: 0 auto; padding: 24px 20px 64px; }

/* header */
.dd-header {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 26px 28px;
  margin-bottom: 28px;
  border-radius: 24px;
  color: #fff;
  background: linear-gradient(135deg, var(--a1) 0%, var(--a2) 55%, var(--a3) 100%);
  box-shadow: 0 30px 60px -36px rgba(122, 11, 20, 0.8);
}
.dd-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at 85% 50%, #000 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 85% 50%, #000 0%, transparent 70%);
  pointer-events: none;
}
.dd-header > * { position: relative; }
.dd-header h1 {
  margin: 0 0 6px;
  font-size: clamp(22px, 3.4vw, 30px);
  letter-spacing: -0.03em;
}
.dd-header p { margin: 0; color: rgba(255,255,255,0.82); font-size: 14px; }
.dd-logout {
  padding: 11px 20px;
  border: 1.5px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background .25s ease, color .25s ease, transform .3s var(--ease);
}
.dd-logout:hover { background: #fff; color: var(--a2); transform: translateY(-2px); }
.dd-logout:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

.dd-alert {
  margin: 0 0 20px;
  padding: 13px 16px;
  border-radius: 12px;
  background: #fff0f1;
  border: 1px solid #f7c9ce;
  color: var(--a2);
  font-size: 13px;
  font-weight: 600;
}

.dd-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  color: var(--a3);
  font-size: 20px;
  letter-spacing: -0.02em;
}
.dd-count {
  padding: 3px 11px;
  border-radius: 999px;
  background: var(--soft);
  border: 1px solid #f7c9ce;
  color: var(--a2);
  font-size: 12px;
  font-weight: 800;
}
.dd-empty {
  padding: 50px 20px;
  text-align: center;
  background: #fff;
  border: 1.5px dashed var(--line);
  border-radius: 16px;
  color: var(--muted);
}

/* cards */
.dd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  align-items: start;
}
.dd-card {
  padding: 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  transition: transform .3s var(--ease), box-shadow .3s ease, border-color .25s ease;
}
.dd-card:hover {
  transform: translateY(-3px);
  border-color: #eba5ab;
  box-shadow: 0 24px 40px -30px rgba(179, 18, 31, 0.7);
}
.dd-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.dd-card h3 {
  margin: 0;
  color: var(--ink);
  font-size: 17px;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}
.dd-total {
  display: block;
  margin-top: 4px;
  color: var(--a1);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.dd-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 5px 11px;
  border-radius: 999px;
  background: #f4f1f1;
  color: #7c6a6c;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
.dd-badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.dd-badge.shipped, .dd-badge.in_transit, .dd-badge.out_for_delivery { background: var(--soft); color: var(--a2); }
.dd-badge.delivered, .dd-badge.paid { background: #effaf3; color: #14753f; }
.dd-badge.delivery_failed { background: var(--a2); color: #fff; }

.dd-rows { display: grid; gap: 9px; }
.dd-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  font-size: 13px;
}
.dd-row span { color: var(--muted); font-weight: 600; flex-shrink: 0; }
.dd-row strong { text-align: right; font-weight: 700; overflow-wrap: anywhere; }

.dd-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--line);
}
.dd-section h4 {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 12px;
  color: var(--a2);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.dd-section h4::before { content: ""; width: 4px; height: 14px; border-radius: 4px; background: var(--a1); }

.dd-field {
  display: block;
  margin-bottom: 13px;
  color: var(--ink);
  font-size: 12.5px;
  font-weight: 700;
}
.dd-input {
  display: block;
  width: 100%;
  margin-top: 7px;
  padding: 12px 13px;
  border: 1.5px solid var(--line);
  border-radius: 11px;
  background: #fffafa;
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  outline: 0;
  transition: border-color .25s ease, box-shadow .3s ease, background .25s ease;
}
textarea.dd-input { min-height: 84px; resize: vertical; line-height: 1.5; }
.dd-input:hover { border-color: #eba5ab; }
.dd-input:focus { border-color: var(--a1); background: #fff; box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.12); }

.dd-btn {
  width: 100%;
  padding: 13px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--a1), var(--a2));
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 24px -14px rgba(179, 18, 31, 0.95);
  transition: transform .3s var(--ease), box-shadow .3s ease, opacity .2s ease;
}
.dd-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 28px -14px rgba(179, 18, 31, 1); }
.dd-btn:active:not(:disabled) { transform: scale(0.98); }
.dd-btn:disabled { opacity: .55; cursor: not-allowed; }
.dd-btn:focus-visible { outline: 2px solid var(--a1); outline-offset: 3px; }

.dd-note {
  margin: 14px 0 0;
  padding: 11px 13px;
  border-radius: 11px;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.5;
}
.dd-note.success { background: #effaf3; border: 1px solid #bfe8cf; color: #14753f; }
.dd-note.warning { background: #fff8e8; border: 1px solid #f3dfae; color: #8a5b00; }
.dd-note.error { background: #fff0f1; border: 1px solid #f7c9ce; color: var(--a2); }
.dd-section .dd-note:first-child { margin-top: 0; }

@media (max-width: 520px) {
  .dd-wrap { padding: 16px 14px 52px; }
  .dd-header { padding: 20px 18px; border-radius: 20px; }
  .dd-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .dd *, .dd *::before { animation: none !important; transition: none !important; }
}
`;

const money = v =>
  `₹${Number(v || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const nextStatuses = {
  ready_to_ship: ["shipped"],
  shipped: ["in_transit", "out_for_delivery", "delivered", "delivery_failed"],
  in_transit: ["out_for_delivery", "delivered", "delivery_failed"],
  out_for_delivery: ["delivered", "delivery_failed"],
  delivery_failed: ["out_for_delivery"]
};

const statusLabels = {
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delivery_failed: "Delivery failed"
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [forms, setForms] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [me, data] = await Promise.all([
        apiRequest("/delivery/me"),
        apiRequest("/delivery/my-orders")
      ]);

      setStaff(me.staff);
      setOrders(data.orders || []);
      setError("");
    } catch (e) {
      setError(e.message);

      if (/login|session|expired/i.test(e.message)) {
        navigate("/delivery/login", { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  function updateForm(id, key, value) {
    setForms(old => ({
      ...old,
      [id]: {
        ...(old[id] || {}),
        [key]: value
      }
    }));
  }

  async function updateDeliveryStatus(order) {
    const form = forms[order.id] || {};
    const status = form.nextStatus;

    if (!status) {
      setError("Please select a delivery status.");
      return;
    }

    if (
      status === "delivered" &&
      !["yes", "no"].includes(form.paymentReceived)
    ) {
      setError("Please confirm whether payment was received.");
      return;
    }

    if (
      (status === "delivery_failed" ||
        (status === "delivered" && form.paymentReceived === "no")) &&
      !String(form.statusNote || "").trim()
    ) {
      setError("Please enter a reason or note.");
      return;
    }

    setBusyId(order.id);
    setError("");

    try {
      await apiRequest(
        `/delivery/orders/${order.id}/delivery-status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            shipping_status: status,
            payment_received:
              status === "delivered"
                ? form.paymentReceived === "yes"
                : undefined,
            note: form.statusNote || ""
          })
        }
      );

      setForms(old => ({
        ...old,
        [order.id]: {}
      }));

      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function submitCollection(order) {
    const form = forms[order.id] || {};

    setBusyId(order.id);
    setError("");

    try {
      await apiRequest(`/delivery/orders/${order.id}/collection`, {
        method: "POST",
        body: JSON.stringify({
          amount: form.amount ?? order.total_amount,
          collection_method: form.method || "cash",
          transaction_reference: form.reference || "",
          collection_note: form.note || ""
        })
      });

      await load();

      setForms(old => ({
        ...old,
        [order.id]: {
          ...old[order.id],
          submitted: true
        }
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await apiRequest("/delivery/logout", {
      method: "POST"
    }).catch(() => {});

    navigate("/delivery/login", { replace: true });
  }

  return (
    <main className="dd">
      <style>{css}</style>

      <div className="dd-wrap">
        <header className="dd-header">
          <div>
            <h1>Delivery Dashboard</h1>
            <p>
              {staff
                ? `Welcome, ${staff.full_name}`
                : "Loading staff profile…"}
            </p>
          </div>

          <button onClick={logout} className="dd-logout">
            Logout
          </button>
        </header>

        {error && <p role="alert" className="dd-alert">{error}</p>}

        <h2 className="dd-title">
          My assigned COD orders
          <span className="dd-count">{orders.length}</span>
        </h2>

        {!orders.length && (
          <p className="dd-empty">No assigned COD orders found.</p>
        )}

        <div className="dd-grid">
          {orders.map(order => {
            const form = forms[order.id] || {};

            const delivered =
              order.order_status === "delivered" &&
              order.shipping_status === "delivered";

            const submitted = [
              "submitted",
              "verified"
            ].includes(order.collection_status);

            const canCollect =
              delivered &&
              Number(order.delivery_payment_received) === 1 &&
              order.payment_status !== "paid" &&
              !submitted;

            const available = nextStatuses[order.shipping_status] || [];

            return (
              <section key={order.id} className="dd-card">
                <div className="dd-card-top">
                  <div>
                    <h3>{order.order_number}</h3>
                    <span className="dd-total">{money(order.total_amount)}</span>
                  </div>

                  <span className={`dd-badge ${order.shipping_status}`}>
                    {statusLabels[order.shipping_status] ||
                      order.shipping_status}
                  </span>
                </div>

                <div className="dd-rows">
                  <div className="dd-row">
                    <span>Payment status</span>
                    <strong>{order.payment_status}</strong>
                  </div>

                  <div className="dd-row">
                    <span>Address</span>
                    <strong>{order.shipping_address}</strong>
                  </div>
                </div>

                {!delivered && available.length > 0 && (
                  <div className="dd-section">
                    <h4>Update delivery status</h4>

                    <label className="dd-field">
                      New status
                      <select
                        className="dd-input"
                        value={form.nextStatus || ""}
                        onChange={e =>
                          updateForm(
                            order.id,
                            "nextStatus",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select status</option>
                        {available.map(status => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </label>

                    {form.nextStatus === "delivered" && (
                      <label className="dd-field">
                        Was payment received?
                        <select
                          className="dd-input"
                          value={form.paymentReceived || ""}
                          onChange={e =>
                            updateForm(
                              order.id,
                              "paymentReceived",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select answer</option>
                          <option value="yes">Yes, received</option>
                          <option value="no">No, not received</option>
                        </select>
                      </label>
                    )}

                    {(form.nextStatus === "delivery_failed" ||
                      (form.nextStatus === "delivered" &&
                        form.paymentReceived === "no")) && (
                      <label className="dd-field">
                        Reason / Note
                        <textarea
                          className="dd-input"
                          value={form.statusNote || ""}
                          onChange={e =>
                            updateForm(
                              order.id,
                              "statusNote",
                              e.target.value
                            )
                          }
                          placeholder="Enter reason or details"
                        />
                      </label>
                    )}

                    <button
                      disabled={
                        busyId === order.id ||
                        !form.nextStatus
                      }
                      className="dd-btn"
                      onClick={() => updateDeliveryStatus(order)}
                    >
                      {busyId === order.id
                        ? "Updating…"
                        : "Update delivery"}
                    </button>
                  </div>
                )}

                {delivered && (
                  <div className="dd-section">
                    <p className="dd-note success">
                      Order delivered.
                    </p>

                    <div className="dd-rows" style={{ marginTop: 12 }}>
                      <div className="dd-row">
                        <span>Payment received by staff</span>
                        <strong>
                          {Number(order.delivery_payment_received) === 1
                            ? "Yes"
                            : "No"}
                        </strong>
                      </div>

                      {order.delivery_payment_note && (
                        <div className="dd-row">
                          <span>Staff note</span>
                          <strong>{order.delivery_payment_note}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {order.collection_status && (
                  <div className="dd-rows" style={{ marginTop: 14 }}>
                    <div className="dd-row">
                      <span>Collection</span>
                      <strong>
                        {order.collection_status}
                        {order.collection_method
                          ? ` (${order.collection_method})`
                          : ""}
                      </strong>
                    </div>
                  </div>
                )}

                {order.collection_status === "rejected" && (
                  <p className="dd-note error">
                    Previous payment submission rejected.
                    You may submit again.
                  </p>
                )}

                {canCollect && (
                  <div className="dd-section">
                    <h4>Submit received payment</h4>

                    <label className="dd-field">
                      Amount
                      <input
                        className="dd-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.amount ?? order.total_amount ?? ""}
                        onChange={e =>
                          updateForm(order.id, "amount", e.target.value)
                        }
                      />
                    </label>

                    <label className="dd-field">
                      Method
                      <select
                        className="dd-input"
                        value={form.method || "cash"}
                        onChange={e =>
                          updateForm(order.id, "method", e.target.value)
                        }
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                      </select>
                    </label>

                    {form.method === "upi" && (
                      <label className="dd-field">
                        UPI transaction reference
                        <input
                          className="dd-input"
                          value={form.reference || ""}
                          onChange={e =>
                            updateForm(order.id, "reference", e.target.value)
                          }
                        />
                      </label>
                    )}

                    <label className="dd-field">
                      Note (optional)
                      <textarea
                        className="dd-input"
                        value={form.note || ""}
                        onChange={e =>
                          updateForm(order.id, "note", e.target.value)
                        }
                      />
                    </label>

                    <button
                      disabled={busyId === order.id}
                      className="dd-btn"
                      onClick={() => submitCollection(order)}
                    >
                      {busyId === order.id
                        ? "Submitting…"
                        : "Submit payment collection"}
                    </button>
                  </div>
                )}

                {Number(order.delivery_payment_received) === 0 &&
                  delivered && (
                    <p className="dd-note warning">
                      Payment was not received. Admin must follow up.
                    </p>
                  )}

                {submitted && (
                  <p className="dd-note warning">
                    Payment submitted. Awaiting admin verification.
                  </p>
                )}

                {order.payment_status === "paid" && (
                  <p className="dd-note success">
                    Payment verified by admin.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}