import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { customerApiRequest, getCustomerToken } from "../services/customerApi";
import { API_URL } from "../services/api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!getCustomerToken()) {
      navigate("/login?redirect=/checkout", { replace: true });
      return;
    }
    if (!cart.length) {
      navigate("/cart", { replace: true });
      return;
    }
    customerApiRequest("/customer/addresses")
      .then((data) => {
        const rows = data.addresses || [];
        setAddresses(rows);
        const preferred = rows.find((a) => a.is_default) || rows[0];
        if (preferred) setAddressId(String(preferred.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate, cart.length]);

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    if (!addressId) {
      setError("Please add a delivery address in your account before checkout.");
      return;
    }
    setPlacing(true);
    try {
      const data = await customerApiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          address_id: Number(addressId),
          payment_method: paymentMethod,
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity }))
        })
      });
      clearCart();
      setSuccess(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  const selectedAddress = addresses.find((a) => String(a.id) === String(addressId));

  return (
    <div style={{ minHeight: "100vh", background: "#fff7f7", color: "#351b20" }}>
      <Navbar />
      <main style={{ maxWidth: 1050, margin: "0 auto", padding: "36px 18px 70px" }}>
        <h1 style={{ color: "#9f1020" }}>Checkout</h1>
        <p style={{ color: "#795c60" }}>Confirm your delivery details and payment preference.</p>

        {loading ? <p>Loading your saved addresses…</p> : success ? (
          <section style={{ background: "#fff", border: "1px solid #f0cbd0", borderRadius: 18, padding: 28 }}>
            <h2>Order request received</h2>
            <p>Your order number is <strong>{success.order_number}</strong>.</p>
            <p>Items subtotal: <strong>{money(success.subtotal)}</strong></p>
            <p>Shipping: <strong>To be confirmed by our team</strong></p>
            <p>{success.payment_method === "cod"
              ? "Your COD request is recorded. Our team will confirm the delivery charge and order."
              : "Your order is recorded. We will confirm the delivery charge and then provide the secure online payment step."}</p>
            <button onClick={() => navigate("/account/orders")} style={buttonStyle}>View my orders</button>
            <Link to="/products" style={{ marginLeft: 16, color: "#a31324" }}>Continue shopping</Link>
          </section>
        ) : (
          <form onSubmit={placeOrder} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(280px,.8fr)", gap: 22, alignItems: "start" }}>
            <section style={panelStyle}>
              <h2>1. Delivery address</h2>
              {addresses.length ? addresses.map((a) => (
                <label key={a.id} style={{ display: "flex", gap: 10, padding: 14, border: addressId === String(a.id) ? "2px solid #d5283a" : "1px solid #ead4d7", borderRadius: 12, marginBottom: 10, cursor: "pointer" }}>
                  <input type="radio" name="address" value={a.id} checked={addressId === String(a.id)} onChange={() => setAddressId(String(a.id))} />
                  <span>
                    <strong>{a.full_name} · {a.mobile}</strong><br />
                    {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ""}, {a.city}, {a.state} - {a.pincode}
                    {a.is_default ? <small style={{ display: "block", color: "#13804a" }}>Default address</small> : null}
                  </span>
                </label>
              )) : (
                <p>You haven't saved a delivery address yet. Add one from your account, then return to checkout.</p>
              )}
              <Link to="/account" style={{ color: "#a31324" }}>Manage delivery addresses</Link>

              <h2 style={{ marginTop: 28 }}>2. Payment method</h2>
              <label style={choiceStyle}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                Cash on Delivery
              </label>
              <label style={choiceStyle}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} />
                Online payment (Razorpay) — available after shipping quote
              </label>
              <p style={{ color: "#795c60", fontSize: 13 }}>Shipping charges are confirmed manually by our team. Online payment is not collected until the final amount is confirmed.</p>
            </section>

            <aside style={panelStyle}>
              <h2>Order summary</h2>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0e1e3" }}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
                <span>Subtotal</span><strong>{money(cartTotal)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <span>Shipping</span><strong>To be confirmed</strong>
              </div>
              <p style={{ fontSize: 12, color: "#795c60" }}>Final payable total will be shared after shipping calculation.</p>
              {error && <p role="alert" style={{ color: "#b42332" }}>{error}</p>}
              <button disabled={placing || !addresses.length} type="submit" style={{ ...buttonStyle, width: "100%", opacity: placing || !addresses.length ? .6 : 1 }}>
                {placing ? "Placing order…" : "Place order"}
              </button>
              <Link to="/cart" style={{ display: "block", marginTop: 14, color: "#a31324" }}>Back to cart</Link>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

const panelStyle = { background: "#fff", border: "1px solid #f0cbd0", borderRadius: 18, padding: 22, boxShadow: "0 12px 30px rgba(110,20,30,.05)" };
const choiceStyle = { display: "flex", gap: 10, alignItems: "center", padding: 12, border: "1px solid #ead4d7", borderRadius: 10, margin: "8px 0" };
const buttonStyle = { background: "#c91f32", color: "#fff", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 700, cursor: "pointer" };
