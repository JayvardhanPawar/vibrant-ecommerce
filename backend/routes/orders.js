
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// ================= SHARED HELPERS =================

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function makeOrderNumber() {
  return `VI${Date.now()}${crypto.randomInt(1000, 9999)}`;
}

async function addStatusHistory(
  connection,
  orderId,
  oldStatus,
  newStatus,
  actorType,
  actorId,
  note
) {
  await connection.query(
    `INSERT INTO order_status_history
      (order_id, old_status, new_status, changed_by_type, changed_by, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      oldStatus || null,
      newStatus,
      actorType,
      actorId || null,
      note || null
    ]
  );
}

// Stock is deducted when an order is placed.
// Restore only inside a transaction after locking the order row.
async function restoreOrderStock(connection, orderId) {
  const [items] = await connection.query(
    `SELECT product_id, quantity
     FROM order_items
     WHERE order_id = ?
     FOR UPDATE`,
    [orderId]
  );

  for (const item of items) {
    await connection.query(
      `UPDATE products
       SET stock_quantity = stock_quantity + ?
       WHERE id = ?`,
      [Number(item.quantity), item.product_id]
    );
  }
}

async function lockOrder(connection, orderId) {
  const [rows] = await connection.query(
    "SELECT * FROM orders WHERE id = ? FOR UPDATE",
    [orderId]
  );

  return rows[0] || null;
}

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

// ================= CREATE CUSTOMER ORDER =================

router.post("/", requireCustomer, async (req, res) => {
  const addressId = validId(req.body.address_id);
  const paymentMethod = String(
    req.body.payment_method || ""
  ).toLowerCase();

  if (!addressId) {
    return res.status(400).json({
      message: "Please select a delivery address"
    });
  }

  if (!["cod", "razorpay"].includes(paymentMethod)) {
    return res.status(400).json({
      message: "Select a valid payment method"
    });
  }

  const cartItems = Array.isArray(req.body.items)
    ? req.body.items
    : [];

  if (!cartItems.length || cartItems.length > 50) {
    return res.status(400).json({
      message: "Your cart is empty or contains too many items"
    });
  }

  const quantities = new Map();

  for (const item of cartItems) {
    const id = validId(item.id);
    const quantity = Number(item.quantity);

    if (
      !id ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 100
    ) {
      return res.status(400).json({
        message: "Invalid product or quantity in cart"
      });
    }

    quantities.set(
      id,
      (quantities.get(id) || 0) + quantity
    );
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [addresses] = await connection.query(
      `SELECT id, full_name, mobile, address_line1,
              address_line2, city, state, pincode
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
      `SELECT id, name, price, stock_quantity, delivery_charge, sku
       FROM products
       WHERE id IN (${placeholders}) AND is_published = 1
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
      products.map((product) => [
        Number(product.id),
        product
      ])
    );

    let subtotal = 0;
    let deliveryTotal = 0;
    const orderLines = [];

    for (const [id, quantity] of quantities.entries()) {
      const product = productById.get(id);
      const price = Number(product.price);
      const stock = Number(product.stock_quantity);
      const deliveryCharge = Number(product.delivery_charge || 0);

      if (!Number.isFinite(price) || price < 0) {
        await connection.rollback();

        return res.status(400).json({
          message: `Invalid price for ${product.name}`
        });
      }

      if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
        await connection.rollback();
        return res.status(400).json({
          message: `Invalid delivery charge for ${product.name}`
        });
      }

      if (stock < quantity) {
        await connection.rollback();

        return res.status(409).json({
          message: `Insufficient stock for ${product.name}. Available: ${stock}`
        });
      }

      const lineSubtotal = Number((price * quantity).toFixed(2));
      const lineDelivery = Number((deliveryCharge * quantity).toFixed(2));
      subtotal += lineSubtotal;
      deliveryTotal += lineDelivery;

      orderLines.push({
        product,
        quantity,
        price,
        deliveryCharge,
        lineSubtotal,
        lineDelivery
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    deliveryTotal = Number(deliveryTotal.toFixed(2));
    const totalAmount = Number((subtotal + deliveryTotal).toFixed(2));

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
        (order_number, customer_id, address_id, shipping_address,
         subtotal, shipping_charge, total_amount,
         shipping_status, order_status,
         payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?,
               'quoted', 'pending_confirmation', ?, 'pending')`,
      [
        orderNumber,
        req.customerId,
        addressId,
        addressSnapshot,
        subtotal,
        deliveryTotal,
        totalAmount,
        paymentMethod
      ]
    );

    for (const line of orderLines) {
      await connection.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, sku,
           unit_price, quantity, line_total,
           delivery_charge_per_unit, delivery_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          line.product.id,
          line.product.name,
          line.product.sku || null,
          line.price,
          line.quantity,
          line.lineSubtotal,
          line.deliveryCharge,
          line.lineDelivery
        ]
      );

      // Reserve stock by deducting it at order placement.
      await connection.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - ?
         WHERE id = ?`,
        [line.quantity, line.product.id]
      );
    }

    await connection.query(
      `INSERT INTO payments
        (order_id, payment_method, amount, payment_status)
       VALUES (?, ?, ?, 'pending')`,
      [
        orderResult.insertId,
        paymentMethod,
        totalAmount
      ]
    );

    await addStatusHistory(
      connection,
      orderResult.insertId,
      null,
      "pending_confirmation",
      "customer",
      req.customerId,
      "Order placed"
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Your order has been placed successfully.",
      order: {
        id: orderResult.insertId,
        order_number: orderNumber,
        subtotal,
        shipping_charge: deliveryTotal,
        total_amount: totalAmount,
        shipping_status: "quoted",
        quote_response: "approved",
        order_status: "pending_confirmation",
        payment_method: paymentMethod,
        payment_status: "pending"
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Unable to place your order right now"
    });

  } finally {
    if (connection) connection.release();
  }
});

// ================= CUSTOMER MY ORDERS =================

router.get("/mine", requireCustomer, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, order_number, subtotal,
              shipping_charge, total_amount,
              shipping_status, order_status,
              payment_method, payment_status,
              quote_response, quote_expires_at,
              packing_started_at,
              cancellation_requested_at, created_at
       FROM orders
       WHERE customer_id = ?
       ORDER BY id DESC`,
      [req.customerId]
    );

    return res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Fetch customer orders error:", error);

    return res.status(500).json({
      message: "Unable to load your orders"
    });
  }
});

// ================= CUSTOMER ORDER DETAILS =================

router.get("/:id", requireCustomer, async (req, res) => {
  const orderId = validId(req.params.id);

  if (!orderId) {
    return res.status(400).json({
      message: "Invalid order ID"
    });
  }

  try {
    const [orders] = await db.query(
      `SELECT id, order_number, shipping_address,
              subtotal, shipping_charge, total_amount,
              shipping_status, order_status,
              payment_method, payment_status,
              quote_response, quote_expires_at,
              packing_started_at, cancellation_reason,
              cancellation_requested_at,
              cancellation_reviewed_at,
              shipped_at, delivered_at, created_at
       FROM orders
       WHERE id = ? AND customer_id = ?
       LIMIT 1`,
      [orderId, req.customerId]
    );

    if (!orders.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const [items] = await db.query(
      `SELECT product_id, product_name, sku,
              unit_price, quantity, line_total,
              delivery_charge_per_unit, delivery_total
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    );

    const [history] = await db.query(
      `SELECT old_status, new_status, changed_by_type,
              note, created_at
       FROM order_status_history
       WHERE order_id = ?
       ORDER BY id ASC`,
      [orderId]
    );

    const [cancellationRequests] = await db.query(
      `SELECT
          id,
          order_id,
          customer_id,
          reason,
          status AS request_status,
          admin_note,
          reviewed_by,
          created_at,
          reviewed_at
       FROM order_cancellation_requests
       WHERE order_id = ? AND customer_id = ?
       ORDER BY id DESC`,
      [orderId, req.customerId]
    );

    return res.json({
      success: true,
      order: {
        ...orders[0],
        items,
        history,
        cancellation_requests: cancellationRequests
      }
    });

  } catch (error) {
    console.error("Fetch order details error:", error);

    return res.status(500).json({
      message: "Unable to load order details"
    });
  }
});




// ================= CUSTOMER: CANCEL BEFORE PACKING =================

router.post("/:id/cancel", requireCustomer, async (req, res) => {
  const orderId = validId(req.params.id);

  const reason = String(
    req.body.reason || "Customer requested cancellation"
  ).trim().slice(0, 500);

  if (!orderId) {
    return res.status(400).json({
      message: "Invalid order ID"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const order = await lockOrder(connection, orderId);

    if (
      !order ||
      Number(order.customer_id) !== Number(req.customerId)
    ) {
      await connection.rollback();

      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.order_status === "cancelled") {
      await connection.rollback();

      return res.status(409).json({
        message: "This order is already cancelled"
      });
    }

    if (
      ["packing", "ready_to_ship", "shipped", "delivered"]
        .includes(order.order_status) ||
      order.packing_started_at
    ) {
      await connection.rollback();

      return res.status(409).json({
        message: "Orders cannot be cancelled after packing has started."
      });
    }

    const oldStatus = order.order_status;

    await restoreOrderStock(connection, orderId);

    await connection.query(
      `UPDATE orders
       SET order_status = 'cancelled',
           cancellation_reason = ?,
           cancellation_requested_at = NOW(),
           cancellation_reviewed_at = NOW()
       WHERE id = ?`,
      [reason || "Customer requested cancellation", orderId]
    );

    await connection.query(
      `UPDATE order_shipping_quotes
       SET quote_status = 'superseded'
       WHERE order_id = ? AND quote_status = 'sent'`,
      [orderId]
    );

    await addStatusHistory(
      connection,
      orderId,
      oldStatus,
      "cancelled",
      "customer",
      req.customerId,
      reason
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Your order has been cancelled."
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Customer cancel order error:", error);

    return res.status(500).json({
      message: "Unable to cancel this order"
    });

  } finally {
    if (connection) connection.release();
  }
});

// ================= CUSTOMER: REQUEST CANCELLATION AFTER PACKING =================

router.post("/:id/cancellation-request", requireCustomer, async (req, res) => {
  return res.status(409).json({
    message: "Cancellation is unavailable after packing has started."
  });
});




// ================= ADMIN AUTHENTICATION =================

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
      `SELECT
          o.id,
          o.order_number,
          o.customer_id,
          o.address_id,
          o.subtotal,
          o.shipping_charge,
          o.total_amount,
          o.shipping_status,
          o.order_status,
          o.payment_method,
          o.payment_status,
          o.quote_response,
          o.quote_expires_at,
          o.packing_started_at,
          o.cancellation_requested_at,
          o.created_at,
          c.full_name AS customer_name,
          c.email AS customer_email,
          c.mobile AS customer_mobile,
          (
            SELECT COUNT(*)
            FROM order_cancellation_requests cr
            WHERE cr.order_id = o.id
              AND cr.status = 'pending'
          ) AS pending_cancellation_requests
       FROM orders o
       LEFT JOIN customers c
          ON c.id = o.customer_id
       ORDER BY o.id DESC`
    );

    return res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Admin list orders error:", error);

    return res.status(500).json({
      message: "Unable to load orders",
      error: error.message
    });
  }
});


// ================= ADMIN: ORDER DETAILS =================

router.get("/admin/:id", requireAdmin, async (req, res) => {
  const orderId = validId(req.params.id);

  if (!orderId) {
    return res.status(400).json({
      message: "Invalid order ID"
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT o.*, c.full_name AS customer_name,
              c.email AS customer_email,
              c.mobile AS customer_mobile
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ?
       LIMIT 1`,
      [orderId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const [items] = await db.query(
      `SELECT product_id, product_name, sku,
              unit_price, quantity, line_total,
              delivery_charge_per_unit, delivery_total
       FROM order_items
       WHERE order_id = ?
       ORDER BY id`,
      [orderId]
    );

    // Delivery charges are stored in order_items.
    // No shipping quote query is required.
    const quotes = [];

    const [history] = await db.query(
      `SELECT old_status, new_status, changed_by_type,
              changed_by, note, created_at
       FROM order_status_history
       WHERE order_id = ?
       ORDER BY id ASC`,
      [orderId]
    );

    const [cancellationRequests] = await db.query(
      `SELECT
         id,
         customer_id,
         reason,
         status AS request_status,
         admin_note,
         reviewed_by,
         reviewed_at,
         created_at
       FROM order_cancellation_requests
       WHERE order_id = ?
       ORDER BY id DESC`,
      [orderId]
    );

    return res.json({
      success: true,
      order: {
        ...rows[0],
        items,
        quotes,
        history,
        cancellation_requests: cancellationRequests
      }
    });

  } catch (error) {
    console.error("Admin order detail error:", error);

    return res.status(500).json({
      message: "Unable to load order details"
    });
  }
});


// Helper to retrieve cancellation requests using the shared pool.
async function connectionQueryCancellation(orderId) {
  return db.query(
    `SELECT
       id,
       customer_id,
       reason,
       status AS request_status,
       admin_note,
       reviewed_by,
       reviewed_at,
       created_at
     FROM order_cancellation_requests
     WHERE order_id = ?
     ORDER BY id DESC`,
    [orderId]
  );
}

// ================= ADMIN: SAVE SHIPPING QUOTE =================

router.patch("/admin/:id/quote", requireAdmin, async (req, res) => {
  return res.status(410).json({
    message: "Shipping quotes are no longer used. Delivery charges are set on products."
  });
});




// ================= ADMIN: UPDATE ORDER STATUS =================

router.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  const orderId = validId(req.params.id);
  const status = String(req.body.order_status || "");
  const trackingNumber = String(
    req.body.tracking_number || ""
  ).trim().slice(0, 150);

  const transitions = {
    confirmed: [
      "pending_confirmation",
      "pending_review"
    ],
    processing: ["confirmed"],
    packing: ["processing"],
    ready_to_ship: ["packing"],
    shipped: ["ready_to_ship"],
    delivered: ["shipped"]
  };

  const allowedStatuses = [
    ...Object.keys(transitions),
    "cancelled"
  ];

  if (!orderId) {
    return res.status(400).json({
      message: "Invalid order ID"
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const order = await lockOrder(connection, orderId);

    if (!order) {
      await connection.rollback();

      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (
      order.order_status === "cancelled" ||
      order.order_status === "delivered"
    ) {
      await connection.rollback();

      return res.status(409).json({
        message: "This order is already in a final state"
      });
    }

    const oldStatus = order.order_status;

    if (status === "cancelled") {
      if (
        ["packing", "ready_to_ship", "shipped", "delivered", "cancelled"]
          .includes(order.order_status) ||
        order.packing_started_at
      ) {
        await connection.rollback();

        return res.status(409).json({
          message: "Order cannot be cancelled after packing has started."
        });
      }

      await restoreOrderStock(connection, orderId);

      await connection.query(
        `UPDATE orders
         SET order_status = 'cancelled',
             cancellation_reviewed_at = NOW(),
             cancellation_reviewed_by = ?,
             cancellation_reason = COALESCE(
               cancellation_reason,
               'Cancelled by administrator'
             )
         WHERE id = ?`,
        [req.admin.id, orderId]
      );

      await connection.query(
        `UPDATE order_cancellation_requests
         SET status = 'approved',
             reviewed_by = ?,
             reviewed_at = NOW(),
             admin_note = COALESCE(
               admin_note,
               'Approved by administrator'
             )
         WHERE order_id = ?
           AND status = 'pending'`,
        [req.admin.id, orderId]
      );

      await addStatusHistory(
        connection,
        orderId,
        oldStatus,
        "cancelled",
        "admin",
        req.admin.id,
        "Order cancelled by administrator"
      );

    } else {
      const allowedPrevious = transitions[status];

      if (!allowedPrevious.includes(oldStatus)) {
        await connection.rollback();

        return res.status(409).json({
          message: `Cannot move order from '${oldStatus}' to '${status}'. Follow the order workflow.`
        });
      }

      if (
        status === "confirmed" &&
        order.payment_method === "razorpay" &&
        order.payment_status !== "paid"
      ) {
        await connection.rollback();

        return res.status(409).json({
          message: "Online payment must be completed before confirming this order."
        });
      }

      if (status === "packing") {
        await connection.query(
          `UPDATE orders
           SET packing_started_at = NOW()
           WHERE id = ?`,
          [orderId]
        );
      }

      if (status === "shipped") {
        await connection.query(
          `UPDATE orders
           SET shipped_at = NOW(),
               shipping_status = 'shipped'
           WHERE id = ?`,
          [orderId]
        );
      }

      if (status === "ready_to_ship") {
        await connection.query(
          `UPDATE orders
           SET shipping_status = 'ready_to_ship'
           WHERE id = ?`,
          [orderId]
        );
      }

      if (status === "delivered") {
        await connection.query(
          `UPDATE orders
           SET delivered_at = NOW(),
               shipping_status = 'delivered'
           WHERE id = ?`,
          [orderId]
        );
      }

      await connection.query(
        `UPDATE orders
         SET order_status = ?
         WHERE id = ?`,
        [status, orderId]
      );

      await addStatusHistory(
        connection,
        orderId,
        oldStatus,
        status,
        "admin",
        req.admin.id,
        trackingNumber
          ? `Status updated. Tracking: ${trackingNumber}`
          : "Order status updated by administrator"
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Order status updated",
      order_status: status
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Unable to update order status"
    });

  } finally {
    if (connection) connection.release();
  }
});




// ================= ADMIN: REVIEW CANCELLATION REQUEST =================

router.patch("/admin/:id/cancellation", requireAdmin, async (req, res) => {
  const orderId = validId(req.params.id);
  const requestId = validId(req.body.request_id);
  const action = String(req.body.action || "").toLowerCase();

  const adminNote = String(
    req.body.admin_note || ""
  ).trim().slice(0, 1000) || null;

  if (!orderId) {
    return res.status(400).json({
      message: "Invalid order ID"
    });
  }

  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({
      message: "Action must be approved or rejected"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const order = await lockOrder(connection, orderId);

    if (!order) {
      await connection.rollback();

      return res.status(404).json({
        message: "Order not found"
      });
    }

    const requestSql = requestId
      ? `SELECT *
         FROM order_cancellation_requests
         WHERE id = ?
           AND order_id = ?
           AND status = 'pending'
         FOR UPDATE`
      : `SELECT *
         FROM order_cancellation_requests
         WHERE order_id = ?
           AND status = 'pending'
         ORDER BY id DESC
         LIMIT 1
         FOR UPDATE`;

    const requestParams = requestId
      ? [requestId, orderId]
      : [orderId];

    const [requests] = await connection.query(
      requestSql,
      requestParams
    );

    if (!requests.length) {
      await connection.rollback();

      return res.status(404).json({
        message: "Pending cancellation request not found"
      });
    }

    const cancellation = requests[0];

    if (action === "approved") {
      if (
        ["packing", "ready_to_ship", "shipped", "delivered", "cancelled"]
          .includes(order.order_status) ||
        order.packing_started_at
      ) {
        await connection.rollback();

        return res.status(409).json({
          message: "Cancellation cannot be approved after packing has started."
        });
      }

      await restoreOrderStock(connection, orderId);

      await connection.query(
        `UPDATE orders
         SET order_status = 'cancelled',
             cancellation_reviewed_at = NOW(),
             cancellation_reviewed_by = ?,
             cancellation_reason = ?
         WHERE id = ?`,
        [
          req.admin.id,
          cancellation.reason,
          orderId
        ]
      );

      await connection.query(
        `UPDATE order_cancellation_requests
         SET status = 'approved',
             admin_note = ?,
             reviewed_by = ?,
             reviewed_at = NOW()
         WHERE id = ?`,
        [
          adminNote,
          req.admin.id,
          cancellation.id
        ]
      );

      await addStatusHistory(
        connection,
        orderId,
        order.order_status,
        "cancelled",
        "admin",
        req.admin.id,
        "Cancellation request approved"
      );

    } else {
      await connection.query(
        `UPDATE order_cancellation_requests
         SET status = 'rejected',
             admin_note = ?,
             reviewed_by = ?,
             reviewed_at = NOW()
         WHERE id = ?`,
        [
          adminNote,
          req.admin.id,
          cancellation.id
        ]
      );

      await connection.query(
        `UPDATE orders
         SET cancellation_reviewed_at = NOW(),
             cancellation_reviewed_by = ?
         WHERE id = ?`,
        [req.admin.id, orderId]
      );

      await addStatusHistory(
        connection,
        orderId,
        order.order_status,
        order.order_status,
        "admin",
        req.admin.id,
        "Cancellation request rejected"
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: action === "approved"
        ? "Cancellation approved. Order cancelled."
        : "Cancellation request rejected.",
      request_status: action
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Review cancellation request error:", error);

    return res.status(500).json({
      message: "Unable to review cancellation request"
    });

  } finally {
    if (connection) connection.release();
  }
});

// ================= CUSTOMER: SHIPPING QUOTE RESPONSE =================

router.post("/:id/quote-response", requireCustomer, async (req, res) => {
  return res.status(410).json({
    message: "Delivery charges are calculated automatically from product settings. Quote approval is no longer required."
  });
});

module.exports = router;
