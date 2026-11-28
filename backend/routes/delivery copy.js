
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

function validId(value) {
  const id = String(value ?? "");
  return /^\d{1,20}$/.test(id) && !/^0+$/.test(id) ? id : null;
}

function readCookie(req, name) {
  const part = (req.headers.cookie || "")
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!part) return null;

  try {
    return decodeURIComponent(part.slice(name.length + 1));
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = readCookie(req, "admin_session") || bearer;

  if (!token) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.username) {
      return res.status(401).json({ message: "Invalid admin session" });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin session" });
  }
}

function requireDelivery(req, res, next) {
  const token = readCookie(req, "delivery_session");

  if (!token) {
    return res.status(401).json({ message: "Delivery staff login required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.DELIVERY_JWT_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "delivery" || !decoded.id) {
      return res.status(401).json({ message: "Invalid delivery session" });
    }

    req.deliveryStaff = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Delivery session expired. Please log in again."
    });
  }
}

function setDeliveryCookie(res, token) {
  res.cookie("delivery_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
}

// Delivery staff authentication
router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const [rows] = await db.query(
      `SELECT id, full_name, username, password_hash, is_active
       FROM delivery_staff WHERE username = ? LIMIT 1`,
      [username]
    );

    const staff = rows[0];

    if (
      !staff ||
      !staff.is_active ||
      !(await bcrypt.compare(password, staff.password_hash))
    ) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      {
        id: String(staff.id),
        username: staff.username,
        type: "delivery"
      },
      process.env.DELIVERY_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setDeliveryCookie(res, token);

    return res.json({
      success: true,
      staff: {
        id: staff.id,
        full_name: staff.full_name,
        username: staff.username
      }
    });
  } catch (error) {
    console.error("Delivery login error:", error);
    return res.status(500).json({ message: "Unable to log in" });
  }
});

router.get("/me", requireDelivery, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, username, mobile
       FROM delivery_staff
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [req.deliveryStaff.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "Delivery account is inactive"
      });
    }

    return res.json({ success: true, staff: rows[0] });
  } catch (error) {
    console.error("Delivery session error:", error);
    return res.status(500).json({
      message: "Unable to check delivery session"
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("delivery_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/"
  });

  return res.json({ success: true });
});

// Delivery staff sees only orders assigned to their account.
router.get("/my-orders", requireDelivery, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.order_number, o.shipping_address, o.total_amount,
              o.order_status, o.shipping_status, o.payment_status,
              o.payment_method, o.delivered_at, o.created_at,
              cc.id AS collection_id, cc.amount AS collection_amount,
              cc.collection_method, cc.collection_status,
              cc.transaction_reference,
              cc.created_at AS collection_submitted_at
       FROM orders o
       LEFT JOIN cod_collections cc
         ON cc.id = (
           SELECT c2.id
           FROM cod_collections c2
           WHERE c2.order_id = o.id
           ORDER BY c2.id DESC
           LIMIT 1
         )
       WHERE o.delivery_staff_id = ?
         AND o.payment_method = 'cod'
       ORDER BY o.id DESC`,
      [req.deliveryStaff.id]
    );

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Delivery orders error:", error);
    return res.status(500).json({
      message: "Unable to load assigned orders"
    });
  }
});

// Submit collection; payment remains pending until admin verification.
router.post("/orders/:id/collection"
  
// Delivery staff updates delivery progress.
router.patch("/orders/:id/delivery-status", requireDelivery, async (req, res) => {
  const orderId = validId(req.params.id);
  const status = String(req.body.shipping_status || "");
  const paymentReceived = req.body.payment_received;
  const note = String(req.body.note || "").trim().slice(0, 500) || null;

  const transitions = {
    ready_to_ship: ["shipped"],
    shipped: ["in_transit", "out_for_delivery", "delivered", "delivery_failed"],
    in_transit: ["out_for_delivery", "delivered", "delivery_failed"],
    out_for_delivery: ["delivered", "delivery_failed"],
    delivery_failed: ["out_for_delivery"]
  };

  const allowedStatuses = [
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "delivery_failed"
  ];

  if (!orderId || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order or delivery status" });
  }

  if (status === "delivered" && ![true, false, 0, 1].includes(paymentReceived)) {
    return res.status(400).json({
      message: "Please confirm whether payment was received"
    });
  }

  if (status === "delivery_failed" && !note) {
    return res.status(400).json({
      message: "Please enter the reason for failed delivery"
    });
  }

  if (status === "delivered" && paymentReceived === false && !note) {
    return res.status(400).json({
      message: "Please enter why payment was not received"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, delivery_staff_id, payment_method, order_status,
              shipping_status
       FROM orders
       WHERE id = ?
       FOR UPDATE`,
      [orderId]
    );

    const order = rows[0];

    if (
      !order ||
      String(order.delivery_staff_id) !== String(req.deliveryStaff.id)
    ) {
      await connection.rollback();
      return res.status(404).json({ message: "Assigned order not found" });
    }

    if (order.payment_method !== "cod") {
      await connection.rollback();
      return res.status(409).json({
        message: "This delivery status endpoint is for COD orders"
      });
    }

    if (["cancelled", "delivered"].includes(order.order_status)) {
      await connection.rollback();
      return res.status(409).json({
        message: "This order is already in a final state"
      });
    }

    const oldStatus = order.shipping_status;

    if (!transitions[oldStatus]?.includes(status)) {
      await connection.rollback();
      return res.status(409).json({
        message: `Cannot change delivery status from '${oldStatus}' to '${status}'`
      });
    }

    if (status === "delivered") {
      await connection.query(
        `UPDATE orders
         SET shipping_status = 'delivered',
             order_status = 'delivered',
             delivered_at = NOW(),
             delivery_payment_received = ?,
             delivery_payment_note = ?
         WHERE id = ?`,
        [paymentReceived ? 1 : 0, note, orderId]
      );
    } else {
      await connection.query(
        `UPDATE orders
         SET shipping_status = ?,
             shipped_at = CASE
               WHEN ? = 'shipped' AND shipped_at IS NULL THEN NOW()
               ELSE shipped_at
             END
         WHERE id = ?`,
        [status, status, orderId]
      );
    }

    await connection.query(
      `INSERT INTO order_status_history
       (order_id, old_status, new_status, changed_by, changed_by_id, note)
       VALUES (?, ?, ?, 'delivery', ?, ?)`,
      [
        orderId,
        oldStatus,
        status,
        req.deliveryStaff.id,
        note
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: status === "delivered"
        ? "Order marked delivered. Payment remains subject to admin verification."
        : "Delivery status updated successfully",
      shipping_status: status
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Delivery status update error:", error);
    return res.status(500).json({
      message: "Unable to update delivery status"
    });
  } finally {
    if (connection) connection.release();
  }
});  ,
   requireDelivery, async (req, res) => {
  const orderId = validId(req.params.id);
  const amount = Number(req.body.amount);
  const method = String(req.body.collection_method || "").toLowerCase();
  const reference =
    String(req.body.transaction_reference || "").trim().slice(0, 150) || null;
  const note =
    String(req.body.collection_note || "").trim().slice(0, 2000) || null;

  if (!orderId) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Enter a valid collection amount"
    });
  }

  if (!["cash", "upi"].includes(method)) {
    return res.status(400).json({
      message: "Collection method must be cash or UPI"
    });
  }

  if (method === "upi" && !reference) {
    return res.status(400).json({
      message: "UPI transaction reference is required"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );

    const order = orders[0];

    if (
      !order ||
      String(order.delivery_staff_id) !== String(req.deliveryStaff.id)
    ) {
      await connection.rollback();
      return res.status(404).json({
        message: "Assigned order not found"
      });
    }

    if (order.payment_method !== "cod") {
      await connection.rollback();
      return res.status(409).json({
        message: "This is not a COD order"
      });
    }

    if (
      order.order_status !== "delivered" ||
      order.shipping_status !== "delivered"
    ) {
      await connection.rollback();
      return res.status(409).json({
        message: "Collection can be submitted only after delivery is marked delivered"
      });
    }

    if (order.payment_status === "paid") {
      await connection.rollback();
      return res.status(409).json({
        message: "This order is already paid"
      });
    }

    const expected = Number(order.total_amount);

    if (!Number.isFinite(expected) || Math.abs(amount - expected) > 0.009) {
      await connection.rollback();
      return res.status(400).json({
        message: `Collection amount must match the order total of ₹${expected.toFixed(2)}`
      });
    }

    const [existing] = await connection.query(
      `SELECT id, collection_status
       FROM cod_collections
       WHERE order_id = ?
         AND collection_status IN ('submitted', 'verified')
       LIMIT 1 FOR UPDATE`,
      [orderId]
    );

    if (existing.length) {
      await connection.rollback();

      return res.status(409).json({
        message:
          existing[0].collection_status === "verified"
            ? "A collection has already been verified for this order"
            : "A collection is already awaiting admin verification"
      });
    }

    const [insert] = await connection.query(
      `INSERT INTO cod_collections
       (order_id, delivery_staff_id, amount, collection_method,
        transaction_reference, collection_note, collection_status)
       VALUES (?, ?, ?, ?, ?, ?, 'submitted')`,
      [
        orderId,
        req.deliveryStaff.id,
        amount.toFixed(2),
        method,
        reference,
        note
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      collection_id: insert.insertId,
      message:
        "Collection submitted. Payment will be marked paid after admin verification."
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("COD collection submit error:", error);

    return res.status(500).json({
      message: "Unable to submit collection"
    });
  } finally {
    if (connection) connection.release();
  }
});

// Admin: delivery staff account management
router.get("/admin/staff", requireAdmin, async (req, res) => {
  try {
    const [staff] = await db.query(
      `SELECT id, full_name, mobile, username, is_active, created_at
       FROM delivery_staff
       ORDER BY full_name`
    );

    return res.json({ success: true, staff });
  } catch (error) {
    console.error("List delivery staff error:", error);

    return res.status(500).json({
      message: "Unable to load delivery staff"
    });
  }
});

router.post("/admin/staff", requireAdmin, async (req, res) => {
  const fullName = String(req.body.full_name || "").trim().slice(0, 150);
  const mobile = String(req.body.mobile || "").trim().slice(0, 20);
  const username = String(req.body.username || "").trim().slice(0, 100);
  const password = String(req.body.password || "");

  if (!fullName || !mobile || !username || password.length < 8) {
    return res.status(400).json({
      message:
        "Name, mobile, username and a password of at least 8 characters are required"
    });
  }

  try {
    const hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO delivery_staff
       (full_name, mobile, username, password_hash)
       VALUES (?, ?, ?, ?)`,
      [fullName, mobile, username, hash]
    );

    return res.status(201).json({
      success: true,
      staff: {
        id: result.insertId,
        full_name: fullName,
        mobile,
        username,
        is_active: 1
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "That delivery username already exists"
      });
    }

    console.error("Create delivery staff error:", error);

    return res.status(500).json({
      message: "Unable to create delivery staff account"
    });
  }
});

router.patch("/admin/staff/:id/status", requireAdmin, async (req, res) => {
  const staffId = validId(req.params.id);
  const isActive = req.body.is_active;

  if (!staffId || ![true, false, 0, 1].includes(isActive)) {
    return res.status(400).json({
      message: "Invalid staff ID or active status"
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE delivery_staff SET is_active = ? WHERE id = ?",
      [isActive ? 1 : 0, staffId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Delivery staff not found"
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Update delivery staff status error:", error);

    return res.status(500).json({
      message: "Unable to update delivery staff"
    });
  }
});

// Admin assigns an order to a delivery staff member.
router.patch("/admin/orders/:id/assign", requireAdmin, async (req, res) => {
  const orderId = validId(req.params.id);

  const staffId =
    req.body.delivery_staff_id == null || req.body.delivery_staff_id === ""
      ? null
      : validId(req.body.delivery_staff_id);

  if (
    !orderId ||
    (req.body.delivery_staff_id != null &&
      req.body.delivery_staff_id !== "" &&
      !staffId)
  ) {
    return res.status(400).json({
      message: "Invalid order or delivery staff ID"
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT id, payment_method, order_status FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );

    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (orders[0].payment_method !== "cod") {
      await connection.rollback();
      return res.status(409).json({
        message: "Only COD orders can be assigned to delivery staff"
      });
    }

    if (["cancelled", "delivered"].includes(orders[0].order_status)) {
      await connection.rollback();
      return res.status(409).json({
        message: "Cannot assign a cancelled or delivered order"
      });
    }

    if (staffId) {
      const [staff] = await connection.query(
        `SELECT id
         FROM delivery_staff
         WHERE id = ? AND is_active = 1
         LIMIT 1`,
        [staffId]
      );

      if (!staff.length) {
        await connection.rollback();
        return res.status(404).json({
          message: "Active delivery staff member not found"
        });
      }
    }

    await connection.query(
      "UPDATE orders SET delivery_staff_id = ? WHERE id = ?",
      [staffId, orderId]
    );

    await connection.commit();

    return res.json({
      success: true,
      delivery_staff_id: staffId
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Assign delivery staff error:", error);

    return res.status(500).json({
      message: "Unable to assign delivery staff"
    });
  } finally {
    if (connection) connection.release();
  }
});

// Admin: review all COD collections.
router.get("/admin/collections", requireAdmin, async (req, res) => {
  try {
    const status = ["submitted", "verified", "rejected"].includes(req.query.status)
      ? req.query.status
      : null;

    const where = status ? "WHERE cc.collection_status = ?" : "";
    const params = status ? [status] : [];

    const [collections] = await db.query(
      `SELECT cc.*, o.order_number, o.total_amount, o.payment_status,
              o.order_status, o.shipping_address,
              ds.full_name AS delivery_staff_name,
              ds.username AS delivery_staff_username
       FROM cod_collections cc
       INNER JOIN orders o ON o.id = cc.order_id
       INNER JOIN delivery_staff ds ON ds.id = cc.delivery_staff_id
       ${where}
       ORDER BY cc.id DESC`,
      params
    );

    return res.json({ success: true, collections });
  } catch (error) {
    console.error("List COD collections error:", error);

    return res.status(500).json({
      message: "Unable to load COD collections"
    });
  }
});

// Admin verifies or rejects a submitted COD collection.
async function reviewCollection(req, res, action) {
  const collectionId = validId(req.params.id);
  const note =
    String(req.body.verification_note || "").trim().slice(0, 2000) || null;

  if (!collectionId) {
    return res.status(400).json({ message: "Invalid collection ID" });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT cc.*, o.payment_method, o.payment_status, o.total_amount,
              o.order_status, o.shipping_status,
              o.delivery_staff_id AS current_delivery_staff_id
       FROM cod_collections cc
       INNER JOIN orders o ON o.id = cc.order_id
       WHERE cc.id = ?
       FOR UPDATE`,
      [collectionId]
    );

    const item = rows[0];

    if (!item) {
      await connection.rollback();
      return res.status(404).json({
        message: "Collection record not found"
      });
    }

    if (item.collection_status !== "submitted") {
      await connection.rollback();
      return res.status(409).json({
        message: "This collection has already been reviewed"
      });
    }

    if (action === "verified") {
      const expected = Number(item.total_amount);

      if (
        item.payment_method !== "cod" ||
        item.payment_status !== "pending" ||
        item.order_status !== "delivered" ||
        item.shipping_status !== "delivered" ||
        String(item.delivery_staff_id) !==
          String(item.current_delivery_staff_id) ||
        Math.abs(Number(item.amount) - expected) > 0.009
      ) {
        await connection.rollback();

        return res.status(409).json({
          message:
            "Order state, assignment or collection amount no longer matches. Review the order before verifying."
        });
      }

      // 1. Update the order payment status.
      const [orderPaymentUpdate] = await connection.query(
        `UPDATE orders
         SET payment_status = 'paid'
         WHERE id = ? AND payment_status = 'pending'`,
        [item.order_id]
      );

      if (orderPaymentUpdate.affectedRows !== 1) {
        throw new Error("Unable to update order payment status");
      }

      // 2. Update the COD payment record.
      const [paymentUpdate] = await connection.query(
        `UPDATE payments
         SET payment_status = 'paid'
         WHERE order_id = ?
           AND payment_method = 'cod'
           AND payment_status = 'pending'`,
        [item.order_id]
      );

      if (paymentUpdate.affectedRows < 1) {
        throw new Error("COD payment record was not updated");
      }

      // 3. Mark the collection as verified.
      const [collectionUpdate] = await connection.query(
        `UPDATE cod_collections
         SET collection_status = 'verified',
             verified_by = ?,
             verified_at = NOW(),
             verification_note = ?
         WHERE id = ? AND collection_status = 'submitted'`,
        [req.admin.id, note, collectionId]
      );

      if (collectionUpdate.affectedRows !== 1) {
        throw new Error("Unable to verify COD collection");
      }
    } else {
      // Reject collection without changing the order payment status.
      const [collectionUpdate] = await connection.query(
        `UPDATE cod_collections
         SET collection_status = 'rejected',
             verification_note = ?
         WHERE id = ? AND collection_status = 'submitted'`,
        [note, collectionId]
      );

      if (collectionUpdate.affectedRows !== 1) {
        throw new Error("Unable to reject COD collection");
      }
    }

    await connection.commit();

    return res.json({
      success: true,
      message:
        action === "verified"
          ? "Collection verified. Order payment marked as paid."
          : "Collection rejected. Order payment remains pending."
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error(`COD collection ${action} error:`, error);

    return res.status(500).json({
      message: "Unable to review COD collection"
    });
  } finally {
    if (connection) connection.release();
  }
}

router.patch("/admin/collections/:id/verify", requireAdmin, (req, res) =>
  reviewCollection(req, res, "verified")
);

router.patch("/admin/collections/:id/reject", requireAdmin, (req, res) =>
  reviewCollection(req, res, "rejected")
);

module.exports = router;
