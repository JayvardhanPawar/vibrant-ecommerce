
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// ================= CUSTOMER AUTHENTICATION =================

function requireCustomer(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to continue"
    });
  }

  try {
    const decoded = jwt.verify(
      authorization.slice(7),
      process.env.CUSTOMER_JWT_SECRET
    );

    if (decoded.type !== "customer" || !Number.isInteger(decoded.id)) {
      return res.status(401).json({
        message: "Invalid customer session"
      });
    }

    req.customerId = decoded.id;
    next();

  } catch {
    return res.status(401).json({
      message: "Your session has expired. Please log in again."
    });
  }
}

// ================= ORDER NUMBER =================

function makeOrderNumber() {
  return `VI${Date.now()}${crypto.randomInt(1000, 9999)}`;
}

// ================= CREATE CUSTOMER ORDER =================

// Create order from server-verified product prices and stock.
// Shipping remains unquoted until an administrator confirms it.

router.post("/", requireCustomer, async (req, res) => {
  const addressId = Number(req.body.address_id);
  const paymentMethod = String(req.body.payment_method || "").toLowerCase();

  if (!Number.isInteger(addressId) || addressId <= 0) {
    return res.status(400).json({
      message: "Please select a delivery address"
    });
  }

  if (!["cod", "razorpay"].includes(paymentMethod)) {
    return res.status(400).json({
      message: "Select a valid payment method"
    });
  }

  const cartItems = Array.isArray(req.body.items) ? req.body.items : [];

  if (!cartItems.length || cartItems.length > 50) {
    return res.status(400).json({
      message: "Your cart is empty or contains too many items"
    });
  }

  const quantities = new Map();

  for (const item of cartItems) {
    const id = Number(item.id);
    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 100
    ) {
      return res.status(400).json({
        message: "Invalid product or quantity in cart"
      });
    }

    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [addresses] = await connection.query(
      `SELECT id, full_name, mobile, address_line1, address_line2, city, state, pincode
       FROM customer_addresses
       WHERE id = ? AND customer_id = ?
       LIMIT 1`,
      [addressId, req.customerId]
    );

    if (!addresses.length) {
      await connection.rollback();

      return res.status(404).json({
        message: "Selected delivery address was not found"
      });
    }

    const ids = [...quantities.keys()];
    const placeholders = ids.map(() => "?").join(",");

    const [products] = await connection.query(
      `SELECT id, name, price, stock_quantity, sku
       FROM products
       WHERE id IN (${placeholders})
       FOR UPDATE`,
      ids
    );

    if (products.length !== ids.length) {
      await connection.rollback();

      return res.status(400).json({
        message: "One or more products are no longer available"
      });
    }

    const productById = new Map(
      products.map((p) => [Number(p.id), p])
    );

    let subtotal = 0;
    const orderLines = [];

    for (const [id, quantity] of quantities.entries()) {
      const product = productById.get(id);
      const price = Number(product.price);
      const stock = Number(product.stock_quantity);

      if (!Number.isFinite(price) || price < 0) {
        await connection.rollback();

        return res.status(400).json({
          message: `Invalid price for ${product.name}`
        });
      }

      if (stock < quantity) {
        await connection.rollback();

        return res.status(409).json({
          message: `Insufficient stock for ${product.name}. Available: ${stock}`
        });
      }

      subtotal += price * quantity;
      orderLines.push({ product, quantity, price });
    }

    const orderNumber = makeOrderNumber();
    const address = addresses[0];

    const addressSnapshot = [
      address.full_name,
      address.mobile,
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean).join(", ");

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (order_number, customer_id, address_id, shipping_address, subtotal,
        shipping_charge, total_amount, shipping_status, order_status,
        payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, 'pending_quote', 'pending_confirmation', ?, 'pending')`,
      [
        orderNumber,
        req.customerId,
        addressId,
        addressSnapshot,
        subtotal,
        paymentMethod
      ]
    );

    for (const line of orderLines) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          line.product.id,
          line.product.name,
          line.product.sku || null,
          line.price,
          line.quantity,
          line.price * line.quantity
        ]
      );

      // Reserve stock when the order is created.
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [line.quantity, line.product.id]
      );
    }

    await connection.query(
      `INSERT INTO payments
       (order_id, payment_method, amount, payment_status)
       VALUES (?, ?, ?, 'pending')`,
      [orderResult.insertId, paymentMethod, subtotal]
    );

    await connection.commit();

    res.status(201).json({
      success: true,

      message: paymentMethod === "cod"
        ? "Order request placed. Delivery charges will be confirmed by our team."
        : "Order request created. Online payment will be available after shipping charges are confirmed.",

      order: {
        id: orderResult.insertId,
        order_number: orderNumber,
        subtotal,
        shipping_charge: null,
        total_amount: null,
        shipping_status: "pending_quote",
        order_status: "pending_confirmation",
        payment_method: paymentMethod,
        payment_status: "pending"
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create order error:", error);

    res.status(500).json({
      message: "Unable to place your order right now"
    });

  } finally {
    if (connection) connection.release();
  }
});

// ================= CUSTOMER MY ORDERS =================

// Customer can only see their own orders.

router.get("/mine", requireCustomer, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, order_number, subtotal, shipping_charge, total_amount,
              shipping_status, order_status, payment_method, payment_status,
              quote_response, created_at
       FROM orders
       WHERE customer_id = ?
       ORDER BY id DESC`,
      [req.customerId]
    );

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Fetch customer orders error:", error);

    res.status(500).json({
      message: "Unable to load your orders"
    });
  }
});

// ================= CUSTOMER ORDER DETAILS =================

router.get("/:id", requireCustomer, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, order_number, shipping_address, subtotal, shipping_charge,
              total_amount, shipping_status, order_status, payment_method,
              payment_status, quote_response, created_at
       FROM orders
       WHERE id = ? AND customer_id = ?
       LIMIT 1`,
      [req.params.id, req.customerId]
    );

    if (!orders.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const [items] = await db.query(
      `SELECT product_id, product_name, sku, unit_price, quantity, line_total
       FROM order_items
       WHERE order_id = ?`,
      [orders[0].id]
    );

    res.json({
      success: true,
      order: {
        ...orders[0],
        items
      }
    });

  } catch (error) {
    console.error("Fetch order details error:", error);

    res.status(500).json({
      message: "Unable to load order details"
    });
  }
});

// ================= ADMIN ORDER MANAGEMENT =================

// IMPORTANT:
// Admin authentication supports both HttpOnly cookies and Bearer tokens.
// This matches the authentication method used in server.js.

function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization;

  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  const cookiePart = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("admin_session="));

  let cookieToken = null;

  try {
    cookieToken = cookiePart
      ? decodeURIComponent(
          cookiePart.slice("admin_session=".length)
        )
      : null;

  } catch {
    return res.status(401).json({
      message: "Invalid admin session cookie"
    });
  }

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      message: "Admin authentication required"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id || !decoded.username) {
      return res.status(401).json({
        message: "Invalid admin session"
      });
    }

    req.admin = decoded;
    next();

  } catch {
    return res.status(401).json({
      message: "Invalid or expired admin session"
    });
  }
}

// ================= ADMIN: VIEW ALL ORDERS =================

router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.order_number, o.customer_id, o.address_id,
              o.subtotal, o.shipping_charge, o.total_amount,
              o.shipping_status, o.order_status, o.payment_method,
              o.payment_status, o.quote_response, o.created_at,
              c.full_name AS customer_name, c.email AS customer_email,
              c.mobile AS customer_mobile
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       ORDER BY o.id DESC`
    );

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Admin list orders error:", error);

    res.status(500).json({
      message: "Unable to load orders. Check that the order migration has been applied."
    });
  }
});

// ================= ADMIN: ORDER DETAILS =================

router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.full_name AS customer_name, c.email AS customer_email,
              c.mobile AS customer_mobile
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const [items] = await db.query(
      `SELECT product_id, product_name, sku, unit_price, quantity, line_total
       FROM order_items
       WHERE order_id = ?
       ORDER BY id`,
      [rows[0].id]
    );

    res.json({
      success: true,
      order: {
        ...rows[0],
        items
      }
    });

  } catch (error) {
    console.error("Admin order detail error:", error);

    res.status(500).json({
      message: "Unable to load order details"
    });
  }
});

// ================= ADMIN: SAVE SHIPPING QUOTE =================

// Admin sets the shipping quote. Total is computed on the server.

router.patch("/admin/:id/quote", requireAdmin, async (req, res) => {
  const shipping = Number(req.body.shipping_charge);

  if (
    !Number.isFinite(shipping) ||
    shipping < 0 ||
    shipping > 1000000
  ) {
    return res.status(400).json({
      message: "Enter a valid shipping charge"
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, subtotal, order_status
       FROM orders
       WHERE id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (["cancelled", "delivered"].includes(rows[0].order_status)) {
      return res.status(409).json({
        message: "Shipping quote cannot be changed for this order"
      });
    }

    const total = Number(
      (Number(rows[0].subtotal) + shipping).toFixed(2)
    );

    await db.query(
      `UPDATE orders
       SET shipping_charge = ?, total_amount = ?, shipping_status = 'quoted',
           quote_response = 'pending', order_status = 'pending_confirmation'
       WHERE id = ?`,
      [shipping, total, req.params.id]
    );

    await db.query(
      `UPDATE payments
       SET amount = ?
       WHERE order_id = ? AND payment_status = 'pending'`,
      [total, req.params.id]
    );

    res.json({
      success: true,
      message: "Shipping quote saved and sent for customer approval",
      shipping_charge: shipping,
      total_amount: total
    });

  } catch (error) {
    console.error("Save shipping quote error:", error);

    res.status(500).json({
      message: "Unable to save shipping quote"
    });
  }
});

// ================= ADMIN: UPDATE ORDER STATUS =================

// Admin updates fulfilment status; customer quote approval is a separate action.

router.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  const allowed = [
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];

  const status = String(req.body.order_status || "");

  if (!allowed.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status"
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, quote_response, shipping_status, order_status
       FROM orders
       WHERE id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (
      status !== "cancelled" &&
      rows[0].quote_response !== "approved"
    ) {
      return res.status(409).json({
        message: "Customer must approve the shipping quote before confirming or processing this order"
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (
        status === "cancelled" &&
        rows[0].order_status !== "cancelled"
      ) {
        const [items] = await connection.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
          [req.params.id]
        );

        for (const item of items) {
          await connection.query(
            "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
            [item.quantity, item.product_id]
          );
        }
      }

      await connection.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [status, req.params.id]
      );

      await connection.commit();

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;

    } finally {
      connection.release();
    }

    res.json({
      success: true,
      message: "Order status updated"
    });

  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      message: "Unable to update order status"
    });
  }
});

// ================= CUSTOMER: SHIPPING QUOTE RESPONSE =================

// Customer accepts or rejects the quoted delivery charge.

router.post("/:id/quote-response", requireCustomer, async (req, res) => {
  const response = String(req.body.response || "");

  if (!["approved", "rejected"].includes(response)) {
    return res.status(400).json({
      message: "Invalid quote response"
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, shipping_status, quote_response, order_status, payment_method
       FROM orders
       WHERE id = ? AND customer_id = ?
       LIMIT 1`,
      [req.params.id, req.customerId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const order = rows[0];

    if (order.shipping_status !== "quoted") {
      return res.status(409).json({
        message: "Shipping quote is not available yet"
      });
    }

    if (order.order_status === "cancelled") {
      return res.status(409).json({
        message: "This order has already been cancelled"
      });
    }

    if (order.quote_response !== "pending") {
      return res.status(409).json({
        message: "You have already responded to this quote"
      });
    }

    const nextStatus = response === "approved"
      ? (
          order.payment_method === "cod"
            ? "confirmed"
            : "pending_confirmation"
        )
      : "cancelled";

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (response === "rejected") {
        const [items] = await connection.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
          [req.params.id]
        );

        for (const item of items) {
          await connection.query(
            "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
            [item.quantity, item.product_id]
          );
        }
      }

      await connection.query(
        `UPDATE orders
         SET quote_response = ?, order_status = ?
         WHERE id = ? AND customer_id = ?`,
        [
          response,
          nextStatus,
          req.params.id,
          req.customerId
        ]
      );

      await connection.commit();

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;

    } finally {
      connection.release();
    }

    res.json({
      success: true,

      message: response === "approved"
        ? (
            order.payment_method === "cod"
              ? "Quote approved. Your COD order is confirmed."
              : "Quote approved. Online payment must be completed before confirmation."
          )
        : "Shipping quote rejected. Your order has been cancelled."
    });

  } catch (error) {
    console.error("Customer quote response error:", error);

    res.status(500).json({
      message: "Unable to submit your quote response"
    });
  }
});

// ================= EXPORT ROUTER =================

module.exports = router;
