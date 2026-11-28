
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const app = express();

// Allow credentialed requests only from configured frontend origins.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map((origin) => origin.trim().replace(/\/$/, "")).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: "2mb" }));
app.use("/api/customer", require("./routes/customerAuth"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/delivery", require("./routes/delivery"));

// ================= ADMIN LOGIN =================

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    const [admins] = await db.query(
      "SELECT id, username, password_hash FROM admins WHERE username = ?",
      [username]
    );

    if (!admins.length) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const valid = await bcrypt.compare(password, admins[0].password_hash);

    if (!valid) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { id: admins[0].id, username: admins[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({
      success: true,
      admin: { id: admins[0].id, username: admins[0].username }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Admin session status and logout
app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    success: true,
    admin: { id: req.admin.id, username: req.admin.username }
  });
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/"
  });
  res.json({ success: true, message: "Admin logged out" });
});

// ================= IMAGE UPLOAD =================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WebP images are allowed"));
    }

    cb(null, true);
  }
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
  const cookieToken = cookiePart
    ? decodeURIComponent(cookiePart.slice("admin_session=".length))
    : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      message: "Admin authentication required"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.username) {
      return res.status(401).json({
        message: "Invalid admin token"
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired admin session"
    });
  }
}

// ================= JSON HELPERS =================

function parseJson(value, fallback = null) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeSections(value) {
  const sections = parseJson(value, []);

  if (!Array.isArray(sections)) return null;

  return sections.map((section, sectionIndex) => ({
    title: String(
      section.title || `Section ${sectionIndex + 1}`
    ).trim().slice(0, 180),

    fields: Array.isArray(section.fields)
      ? section.fields.map((field, fieldIndex) => ({
          label: String(
            field.label || `Field ${fieldIndex + 1}`
          ).trim().slice(0, 180),

          type: [
            "text",
            "number",
            "textarea",
            "select",
            "multiselect",
            "checkbox"
          ].includes(field.type)
            ? field.type
            : "text",

          options: Array.isArray(field.options)
            ? field.options.map(String).slice(0, 100)
            : [],

          required: Boolean(field.required),

          value: field.value == null ? "" : field.value
        }))
      : []
  }));
}

// ================= DATABASE TEST =================

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS db");

    res.json({
      success: true,
      database: rows[0].db
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// ================= SPECIFICATION TEMPLATES =================

// Get all templates
app.get("/api/spec-templates", async (req, res) => {
  try {
    const [templates] = await db.query(
      `SELECT id, name, category, description,
       template_json, created_at
       FROM product_spec_templates
       ORDER BY name ASC`
    );

    res.json({
      templates: templates.map((item) => ({
        ...item,
        template_json: parseJson(
          item.template_json,
          { sections: [] }
        )
      }))
    });
  } catch (error) {
    console.error("Load templates error:", error);

    res.status(500).json({
      message: "Unable to load specification templates. Run the database migration first."
    });
  }
});

// Save template
app.post("/api/spec-templates", requireAdmin, async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const sections = normalizeSections(req.body.sections);

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Template name is required"
      });
    }

    if (!sections || !sections.length) {
      return res.status(400).json({
        message: "Add at least one section before saving a template"
      });
    }

    const [result] = await db.query(
      `INSERT INTO product_spec_templates
       (name, category, description, template_json)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        category || null,
        description || "",
        JSON.stringify({ sections })
      ]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Template saved"
    });
  } catch (error) {
    console.error("Save template error:", error);

    res.status(500).json({
      message: "Unable to save template"
    });
  }
});

// Delete template
app.delete("/api/spec-templates/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM product_spec_templates WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Template not found"
      });
    }

    res.json({
      success: true,
      message: "Template deleted"
    });
  } catch (error) {
    console.error("Delete template error:", error);

    res.status(500).json({
      message: "Unable to delete template"
    });
  }
});

// ================= PRODUCTS =================

// Public product catalogue: unpublished products are hidden from customers.
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT id, name, description, price, image_type, created_at,
             category, brand, model, sku, mrp, stock_quantity, delivery_charge,
             warranty, specifications
      FROM products
      WHERE is_published = 1
      ORDER BY id DESC
    `);

    res.json({
      products: products.map((product) => ({
        ...product,
        specifications: parseJson(product.specifications, { sections: [] })
      }))
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Unable to fetch products" });
  }
});

// Admin catalogue: includes both published and unpublished products.
app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT id, name, description, price, image_type, created_at,
             category, brand, model, sku, mrp, stock_quantity, delivery_charge,
             warranty, specifications, is_published
      FROM products
      ORDER BY id DESC
    `);

    res.json({
      products: products.map((product) => ({
        ...product,
        specifications: parseJson(product.specifications, { sections: [] })
      }))
    });
  } catch (error) {
    console.error("Admin fetch products error:", error);
    res.status(500).json({ message: "Unable to load admin products" });
  }
});

// Get one product
app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, price, image_type, created_at,
              category, brand, model, sku, mrp, stock_quantity, delivery_charge,
              warranty, specifications
       FROM products
       WHERE id = ? AND is_published = 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      product: {
        ...rows[0],
        specifications: parseJson(
          rows[0].specifications,
          { sections: [] }
        )
      }
    });
  } catch (error) {
    console.error("Fetch product error:", error);

    res.status(500).json({
      message: "Unable to fetch product"
    });
  }
});

// Public product image: available only while the product is published.
app.get("/api/products/:id/image", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT image_data, image_type FROM products WHERE id = ? AND is_published = 1",
      [req.params.id]
    );
    if (!rows.length || !rows[0].image_data) {
      return res.status(404).send("Image not found");
    }
    res.setHeader("Content-Type", rows[0].image_type);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(rows[0].image_data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Image loading failed");
  }
});

// Admin product image: allows administrators to preview unpublished products.
app.get("/api/admin/products/:id/image", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT image_data, image_type FROM products WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length || !rows[0].image_data) {
      return res.status(404).send("Image not found");
    }
    res.setHeader("Content-Type", rows[0].image_type);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(rows[0].image_data);
  } catch (error) {
    console.error("Admin product image error:", error);
    res.status(500).send("Image loading failed");
  }
});

// Add product
app.post("/api/products", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const {
      name, description, price, category, brand, model, sku,
      mrp, stock_quantity, warranty, delivery_charge
    } = req.body;

    if (
      !name?.trim() ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Valid product name and price are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required"
      });
    }

    const sections = normalizeSections(req.body.specifications || "[]");

    if (!sections) {
      return res.status(400).json({
        message: "Invalid product specifications"
      });
    }

    const mrpValue = mrp === "" || mrp == null ? null : Number(mrp);

    const stockValue =
      stock_quantity === "" || stock_quantity == null
        ? 0
        : Number.parseInt(stock_quantity, 10);

    if (mrpValue !== null && (!Number.isFinite(mrpValue) || mrpValue < 0)) {
      return res.status(400).json({
        message: "Enter a valid MRP"
      });
    }

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      return res.status(400).json({
        message: "Stock quantity must be a non-negative whole number"
      });
    }

    const deliveryChargeValue = delivery_charge === "" || delivery_charge == null
      ? 0
      : Number(delivery_charge);

    if (!Number.isFinite(deliveryChargeValue) || deliveryChargeValue < 0 || deliveryChargeValue > 1000000) {
      return res.status(400).json({
        message: "Delivery charge must be a valid non-negative amount"
      });
    }

    const [result] = await db.query(
      `INSERT INTO products
       (name, description, price, image_data, image_type,
        category, brand, model, sku, mrp, stock_quantity, delivery_charge,
        warranty, specifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description || "",
        Number(price),
        req.file.buffer,
        req.file.mimetype,
        category || null,
        brand || null,
        model || null,
        sku || null,
        mrpValue,
        stockValue,
        deliveryChargeValue,
        warranty || null,
        JSON.stringify({ sections })
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("Add product error:", error);

    res.status(500).json({
      message: "Unable to add product. Confirm the database migration has been run."
    });
  }
});

// ================= EDIT PRODUCT =================

// Image is optional. If no new image is uploaded,
// the existing product image remains unchanged.
app.put("/api/products/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const {
      name, description, price, category, brand, model, sku,
      mrp, stock_quantity, warranty, delivery_charge
    } = req.body;

    if (
      !name?.trim() ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Valid product name and price are required"
      });
    }

    const sections = normalizeSections(req.body.specifications || "[]");

    if (!sections) {
      return res.status(400).json({
        message: "Invalid product specifications"
      });
    }

    const mrpValue = mrp === "" || mrp == null ? null : Number(mrp);

    const stockValue =
      stock_quantity === "" || stock_quantity == null
        ? 0
        : Number.parseInt(stock_quantity, 10);

    if (mrpValue !== null && (!Number.isFinite(mrpValue) || mrpValue < 0)) {
      return res.status(400).json({
        message: "Enter a valid MRP"
      });
    }

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      return res.status(400).json({
        message: "Stock quantity must be a non-negative whole number"
      });
    }

    const deliveryChargeValue = delivery_charge === "" || delivery_charge == null
      ? 0
      : Number(delivery_charge);

    if (!Number.isFinite(deliveryChargeValue) || deliveryChargeValue < 0 || deliveryChargeValue > 1000000) {
      return res.status(400).json({
        message: "Delivery charge must be a valid non-negative amount"
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [req.params.id]
    );

    if (!existing.length) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const values = [
      name.trim(),
      description || "",
      Number(price),
      category || null,
      brand || null,
      model || null,
      sku || null,
      mrpValue,
      stockValue,
      deliveryChargeValue,
      warranty || null,
      JSON.stringify({ sections })
    ];

    let sql = `UPDATE products SET
      name = ?,
      description = ?,
      price = ?,
      category = ?,
      brand = ?,
      model = ?,
      sku = ?,
      mrp = ?,
      stock_quantity = ?,
      delivery_charge = ?,
      warranty = ?,
      specifications = ?`;

    if (req.file) {
      sql += ", image_data = ?, image_type = ?";
      values.push(req.file.buffer, req.file.mimetype);
    }

    sql += " WHERE id = ?";
    values.push(req.params.id);

    await db.query(sql, values);

    res.json({
      success: true,
      message: "Product updated successfully"
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Unable to update product"
    });
  }
});

// ================= PUBLISH / UNPUBLISH PRODUCT =================

app.patch("/api/products/:id/publish", requireAdmin, async (req, res) => {
  const rawStatus = req.body.is_published;
  if (![true, false, 0, 1].includes(rawStatus)) {
    return res.status(400).json({ message: "Invalid publish status" });
  }

  try {
    const [result] = await db.query(
      "UPDATE products SET is_published = ? WHERE id = ?",
      [rawStatus ? 1 : 0, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      success: true,
      is_published: rawStatus ? 1 : 0,
      message: rawStatus ? "Product published successfully" : "Product unpublished successfully"
    });
  } catch (error) {
    console.error("Publish product error:", error);
    return res.status(500).json({ message: "Unable to update product visibility" });
  }
});

// ================= DELETE PRODUCT =================

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM products WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete product"
    });
  }
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  res.status(400).json({
    message: err.message || "Request failed"
  });
});

// ================= START SERVER =================
// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
