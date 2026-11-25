
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const CUSTOMER_SECRET = process.env.CUSTOMER_JWT_SECRET;

if (!CUSTOMER_SECRET) {
  throw new Error("CUSTOMER_JWT_SECRET is missing from .env");
}

// ========================================
// CUSTOMER REGISTRATION
// POST /api/customer/register
// ========================================

router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      mobile,
      password,
      confirm_password
    } = req.body;

    if (!full_name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and no more than 72 bytes"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile?.trim() || null;

    const [existing] = await db.query(
      `SELECT id FROM customers
       WHERE email = ?
       OR (mobile IS NOT NULL AND mobile = ?)`,
      [normalizedEmail, normalizedMobile]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "An account with this email or mobile already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO customers
       (full_name, email, mobile, password_hash)
       VALUES (?, ?, ?, ?)`,
      [
        full_name.trim(),
        normalizedEmail,
        normalizedMobile,
        passwordHash
      ]
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        type: "customer"
      },
      CUSTOMER_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      customer: {
        id: result.insertId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        mobile: normalizedMobile
      }
    });

  } catch (error) {
    console.error("Customer registration error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email or mobile already registered"
      });
    }

    res.status(500).json({
      message: "Unable to create account"
    });
  }
});


// ========================================
// CUSTOMER LOGIN
// POST /api/customer/login
// ========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await db.query(
      `SELECT id, full_name, email, mobile,
              password_hash, is_active
       FROM customers
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (
      rows.length === 0 ||
      !rows[0].is_active ||
      !(await bcrypt.compare(password, rows[0].password_hash))
    ) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const customer = rows[0];

    const token = jwt.sign(
      {
        id: customer.id,
        type: "customer"
      },
      CUSTOMER_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        mobile: customer.mobile
      }
    });

  } catch (error) {
    console.error("Customer login error:", error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});


// ========================================
// CUSTOMER AUTHENTICATION MIDDLEWARE
// ========================================

function requireCustomer(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Customer authentication required"
    });
  }

  try {
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, CUSTOMER_SECRET);

    if (
      decoded.type !== "customer" ||
      !Number.isInteger(decoded.id)
    ) {
      return res.status(401).json({
        message: "Invalid customer token"
      });
    }

    req.customerId = decoded.id;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired customer session"
    });
  }
}


// ========================================
// GET CUSTOMER PROFILE
// GET /api/customer/me
// ========================================

router.get("/me", requireCustomer, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, mobile, created_at
       FROM customers
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [req.customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Customer account not found"
      });
    }

    res.json({
      success: true,
      customer: rows[0]
    });

  } catch (error) {
    console.error("Customer profile error:", error);

    res.status(500).json({
      message: "Unable to load customer profile"
    });
  }
});


// ========================================
// UPDATE CUSTOMER PROFILE
// PUT /api/customer/me
// ========================================

router.put("/me", requireCustomer, async (req, res) => {
  try {
    const { full_name, mobile } = req.body;

    if (!full_name?.trim()) {
      return res.status(400).json({
        message: "Full name is required"
      });
    }

    if (full_name.trim().length > 150) {
      return res.status(400).json({
        message: "Full name cannot exceed 150 characters"
      });
    }

    const normalizedMobile = mobile?.trim() || null;

    if (normalizedMobile && normalizedMobile.length > 20) {
      return res.status(400).json({
        message: "Mobile number cannot exceed 20 characters"
      });
    }

    // Check whether another customer uses this mobile
    if (normalizedMobile) {
      const [existing] = await db.query(
        `SELECT id
         FROM customers
         WHERE mobile = ? AND id != ?
         LIMIT 1`,
        [normalizedMobile, req.customerId]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          message: "This mobile number is already registered"
        });
      }
    }

    // Update customer information
    await db.query(
      `UPDATE customers
       SET full_name = ?, mobile = ?
       WHERE id = ? AND is_active = 1`,
      [
        full_name.trim(),
        normalizedMobile,
        req.customerId
      ]
    );

    // Fetch updated profile
    const [rows] = await db.query(
      `SELECT id, full_name, email, mobile, created_at
       FROM customers
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [req.customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Customer account not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      customer: rows[0]
    });

  } catch (error) {
    console.error("Profile update error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Mobile number already registered"
      });
    }

    res.status(500).json({
      message: "Unable to update profile"
    });
  }
});




// ========================================
// GET ALL CUSTOMER ADDRESSES
// GET /api/customer/addresses
// ========================================

router.get("/addresses", requireCustomer, async (req, res) => {
  try {
    const [addresses] = await db.query(
      `SELECT *
       FROM customer_addresses
       WHERE customer_id = ?
       ORDER BY is_default DESC, id DESC`,
      [req.customerId]
    );

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    res.status(500).json({
      message: "Unable to fetch addresses"
    });
  }
});


// ========================================
// ADD CUSTOMER ADDRESS
// POST /api/customer/addresses
// ========================================

router.post("/addresses", requireCustomer, async (req, res) => {
  try {
    const {
      full_name,
      mobile,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      address_type,
      is_default
    } = req.body;

    if (
      !full_name?.trim() ||
      !mobile?.trim() ||
      !address_line1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: "Please fill all required address fields"
      });
    }

    if (
      full_name.trim().length > 150 ||
      mobile.trim().length > 20 ||
      address_line1.trim().length > 255 ||
      (address_line2 && address_line2.trim().length > 255) ||
      city.trim().length > 100 ||
      state.trim().length > 100 ||
      pincode.trim().length > 10
    ) {
      return res.status(400).json({
        message: "One or more address fields exceed the allowed length"
      });
    }

    const allowedTypes = ["home", "work", "other"];
    const type = (address_type || "home").toLowerCase();

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid address type"
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM customer_addresses
       WHERE customer_id = ?
       LIMIT 1`,
      [req.customerId]
    );

    const makeDefault = Boolean(is_default) || existing.length === 0;

    if (makeDefault) {
      await db.query(
        `UPDATE customer_addresses
         SET is_default = 0
         WHERE customer_id = ?`,
        [req.customerId]
      );
    }

    const [result] = await db.query(
      `INSERT INTO customer_addresses
       (
         customer_id,
         full_name,
         mobile,
         address_line1,
         address_line2,
         city,
         state,
         pincode,
         address_type,
         is_default
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.customerId,
        full_name.trim(),
        mobile.trim(),
        address_line1.trim(),
        address_line2?.trim() || null,
        city.trim(),
        state.trim(),
        pincode.trim(),
        type,
        makeDefault ? 1 : 0
      ]
    );

    const [addresses] = await db.query(
      `SELECT *
       FROM customer_addresses
       WHERE id = ? AND customer_id = ?`,
      [result.insertId, req.customerId]
    );

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: addresses[0]
    });

  } catch (error) {
    console.error("Add address error:", error);

    res.status(500).json({
      message: "Unable to add address"
    });
  }
});


// ========================================
// UPDATE CUSTOMER ADDRESS
// PUT /api/customer/addresses/:id
// ========================================

router.put("/addresses/:id", requireCustomer, async (req, res) => {
  try {
    const addressId = Number(req.params.id);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({
        message: "Invalid address ID"
      });
    }

    const {
      full_name,
      mobile,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      address_type,
      is_default
    } = req.body;

    if (
      !full_name?.trim() ||
      !mobile?.trim() ||
      !address_line1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: "Please fill all required address fields"
      });
    }

    if (
      full_name.trim().length > 150 ||
      mobile.trim().length > 20 ||
      address_line1.trim().length > 255 ||
      (address_line2 && address_line2.trim().length > 255) ||
      city.trim().length > 100 ||
      state.trim().length > 100 ||
      pincode.trim().length > 10
    ) {
      return res.status(400).json({
        message: "One or more address fields exceed the allowed length"
      });
    }

    const allowedTypes = ["home", "work", "other"];
    const type = (address_type || "home").toLowerCase();

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid address type"
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM customer_addresses
       WHERE id = ? AND customer_id = ?
       LIMIT 1`,
      [addressId, req.customerId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    if (Boolean(is_default)) {
      await db.query(
        `UPDATE customer_addresses
         SET is_default = 0
         WHERE customer_id = ?`,
        [req.customerId]
      );
    }

    await db.query(
      `UPDATE customer_addresses
       SET
         full_name = ?,
         mobile = ?,
         address_line1 = ?,
         address_line2 = ?,
         city = ?,
         state = ?,
         pincode = ?,
         address_type = ?,
         is_default = ?
       WHERE id = ? AND customer_id = ?`,
      [
        full_name.trim(),
        mobile.trim(),
        address_line1.trim(),
        address_line2?.trim() || null,
        city.trim(),
        state.trim(),
        pincode.trim(),
        type,
        Boolean(is_default) ? 1 : 0,
        addressId,
        req.customerId
      ]
    );

    const [addresses] = await db.query(
      `SELECT *
       FROM customer_addresses
       WHERE id = ? AND customer_id = ?`,
      [addressId, req.customerId]
    );

    res.json({
      success: true,
      message: "Address updated successfully",
      address: addresses[0]
    });

  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      message: "Unable to update address"
    });
  }
});


// ========================================
// SET DEFAULT ADDRESS
// PATCH /api/customer/addresses/:id/default
// ========================================

router.patch(
  "/addresses/:id/default",
  requireCustomer,
  async (req, res) => {
    try {
      const addressId = Number(req.params.id);

      if (!Number.isInteger(addressId) || addressId <= 0) {
        return res.status(400).json({
          message: "Invalid address ID"
        });
      }

      const [existing] = await db.query(
        `SELECT id
         FROM customer_addresses
         WHERE id = ? AND customer_id = ?
         LIMIT 1`,
        [addressId, req.customerId]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Address not found"
        });
      }

      await db.query(
        `UPDATE customer_addresses
         SET is_default = 0
         WHERE customer_id = ?`,
        [req.customerId]
      );

      await db.query(
        `UPDATE customer_addresses
         SET is_default = 1
         WHERE id = ? AND customer_id = ?`,
        [addressId, req.customerId]
      );

      res.json({
        success: true,
        message: "Default address updated"
      });

    } catch (error) {
      console.error("Set default address error:", error);

      res.status(500).json({
        message: "Unable to set default address"
      });
    }
  }
);


// ========================================
// DELETE CUSTOMER ADDRESS
// DELETE /api/customer/addresses/:id
// ========================================

router.delete("/addresses/:id", requireCustomer, async (req, res) => {
  try {
    const addressId = Number(req.params.id);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({
        message: "Invalid address ID"
      });
    }

    const [existing] = await db.query(
      `SELECT id, is_default
       FROM customer_addresses
       WHERE id = ? AND customer_id = ?
       LIMIT 1`,
      [addressId, req.customerId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    await db.query(
      `DELETE FROM customer_addresses
       WHERE id = ? AND customer_id = ?`,
      [addressId, req.customerId]
    );

    if (existing[0].is_default) {
      const [remaining] = await db.query(
        `SELECT id
         FROM customer_addresses
         WHERE customer_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [req.customerId]
      );

      if (remaining.length > 0) {
        await db.query(
          `UPDATE customer_addresses
           SET is_default = 1
           WHERE id = ? AND customer_id = ?`,
          [remaining[0].id, req.customerId]
        );
      }
    }

    res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      message: "Unable to delete address"
    });
  }
});


module.exports = router;









