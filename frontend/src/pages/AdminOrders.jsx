
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const money = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const label = (v) => String(v || "—").replaceAll("_", " ");

const STATUSES = [
  "pending_confirmation",
  "confirmed",
  "processing",
  "packing",
  "ready_to_ship",
  "shipped",
  "delivered",
  "cancelled"
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/orders/admin/all");
      setOrders(data.orders || []);
    } catch (e) {
      setError(e.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(order, status) {
    if (status === order.order_status) return;

    setBusy(String(order.id));
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/orders/admin/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ order_status: status })
      });

      setSuccess(
        `Order ${order.order_number} updated to ${label(status)}.`
      );

      await loadOrders();
    } catch (e) {
      setError(e.message || "Unable to update order status.");
    } finally {
      setBusy("");
    }
  }

  const shown = orders.filter((o) =>
    filter === "all" ||
    o.order_status === filter ||
    o.shipping_status === filter
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fff7f7" }}>
      <Navbar admin />

      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "30px 18px 70px",
          color: "#351b20"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <div>
            <h1 style={{ color: "#9f1020", marginBottom: 5 }}>
              Order Management
            </h1>

            <p style={{ color: "#795c60", marginTop: 0 }}>
              Review orders, update fulfilment and track product-based
              delivery charges.
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            style={btnSecondary}
          >
            {loading ? "Refreshing…" : "Refresh orders"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            margin: "20px 0"
          }}
        >
          {["all", ...STATUSES].map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                ...filterBtn,
                background: filter === v ? "#c91f32" : "#fff",
                color: filter === v ? "#fff" : "#8f1826"
              }}
            >
              {v === "all" ? "All orders" : label(v)}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" style={alertError}>
            {error}
          </p>
        )}

        {success && (
          <p role="status" style={alertSuccess}>
            {success}
          </p>
        )}

        {loading ? (
          <p>Loading orders…</p>
        ) : !shown.length ? (
          <section style={panel}>
            No orders found for this filter.
          </section>
        ) : (
          shown.map((o) => (
            <article
              key={o.id}
              style={{ ...panel, marginBottom: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <strong
                    style={{ color: "#9f1020", fontSize: 17 }}
                  >
                    {o.order_number}
                  </strong>

                  <div style={muted}>
                    Order #{o.id} ·{" "}
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap"
                  }}
                >
                  <span style={pill}>
                    {label(o.order_status)}
                  </span>

                  <span style={pill}>
                    {label(o.shipping_status)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 12,
                  margin: "16px 0"
                }}
              >
                <div>
                  <small style={muted}>Customer</small>
                  <div>
                    <b>
                      {o.customer_name ||
                        `Customer #${o.customer_id}`}
                    </b>
                  </div>
                  <div style={muted}>
                    {o.customer_email || ""}
                  </div>
                  <div style={muted}>
                    {o.customer_mobile || ""}
                  </div>
                </div>

                <div>
                  <small style={muted}>Items subtotal</small>
                  <div>
                    <b>{money(o.subtotal)}</b>
                  </div>
                </div>

                <div>
                  <small style={muted}>
                    Product delivery charges
                  </small>
                  <div>
                    <b>{money(o.shipping_charge)}</b>
                  </div>
                  <small style={muted}>
                    Total: {money(o.total_amount)}
                  </small>
                </div>

                <div>
                  <small style={muted}>Payment</small>
                  <div>
                    <b>
                      {String(o.payment_method || "").toUpperCase()}
                    </b>{" "}
                    · {label(o.payment_status)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  flexWrap: "wrap",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid #f0dadd"
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  Order status

                  <select
                    value={o.order_status}
                    disabled={
                      busy === String(o.id) ||
                      ["delivered", "cancelled"].includes(
                        o.order_status
                      )
                    }
                    onChange={(e) =>
                      updateStatus(o, e.target.value)
                    }
                    style={inputStyle}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {label(s)}
                      </option>
                    ))}
                  </select>
                </label>

                <Link
                  to={`/admin/orders/${o.id}`}
                  style={assignLink}
                >
                  View / Assign Delivery →
                </Link>

                {busy === String(o.id) && (
                  <small style={muted}>
                    Updating status…
                  </small>
                )}
              </div>

              {o.order_status === "packing" && (
                <p style={packingNotice}>
                  Packing has started. Customer cancellation is locked.
                </p>
              )}
            </article>
          ))
        )}
      </main>
    </div>
  );
}

const panel = {
  background: "#fff",
  border: "1px solid #f0cbd0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 25px rgba(110,20,30,.04)"
};

const muted = {
  color: "#795c60",
  fontSize: 12
};

const pill = {
  padding: "6px 10px",
  borderRadius: 30,
  background: "#fff0f1",
  color: "#9f1020",
  fontSize: 12,
  fontWeight: 700
};

const inputStyle = {
  display: "block",
  marginTop: 6,
  padding: "9px 10px",
  border: "1px solid #e7c6ca",
  borderRadius: 8,
  minWidth: 170,
  background: "#fff"
};

const btnSecondary = {
  border: "1px solid #e7c6ca",
  borderRadius: 9,
  background: "#fff",
  color: "#9f1020",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer"
};

const filterBtn = {
  border: "1px solid #e7c6ca",
  borderRadius: 20,
  padding: "8px 12px",
  cursor: "pointer",
  textTransform: "capitalize"
};

const assignLink = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 8,
  background: "#9f1020",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 13
};

const alertError = {
  padding: 12,
  background: "#fff0f1",
  color: "#9f1020",
  borderRadius: 9
};

const alertSuccess = {
  padding: 12,
  background: "#effaf3",
  color: "#176b3a",
  borderRadius: 9
};

const packingNotice = {
  padding: 10,
  background: "#fff8e8",
  color: "#75521b",
  borderRadius: 8,
  marginBottom: 0
};
