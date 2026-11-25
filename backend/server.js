
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api/customer", require("./routes/customerAuth"));

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
      { expiresIn: "8h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
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

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Admin authentication required"
    });
  }

  try {
    const decoded = jwt.verify(
      authorization.split(" ")[1],
      process.env.JWT_SECRET
    );

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

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT id, name, description, price, image_type, created_at,
             category, brand, model, sku, mrp, stock_quantity,
             warranty, specifications
      FROM products
      ORDER BY id DESC
    `);

    res.json({
      products: products.map((product) => ({
        ...product,
        specifications: parseJson(
          product.specifications,
          { sections: [] }
        )
      }))
    });
  } catch (error) {
    console.error("Fetch products error:", error);

    res.status(500).json({
      message: "Unable to fetch products"
    });
  }
});

// Get one product
app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, price, image_type, created_at,
              category, brand, model, sku, mrp, stock_quantity,
              warranty, specifications
       FROM products
       WHERE id = ?`,
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

// Get product image
app.get("/api/products/:id/image", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT image_data, image_type FROM products WHERE id = ?",
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

// Add product
app.post("/api/products", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const {
      name, description, price, category, brand, model, sku,
      mrp, stock_quantity, warranty
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

    const [result] = await db.query(
      `INSERT INTO products
       (name, description, price, image_data, image_type,
        category, brand, model, sku, mrp, stock_quantity,
        warranty, specifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      mrp, stock_quantity, warranty
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
