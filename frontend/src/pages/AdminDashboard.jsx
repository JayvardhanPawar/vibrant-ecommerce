import { useEffect, useState } from "react";
import { apiRequest, API_URL } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus, Trash2, LogOut, Package, ImagePlus, Pencil,
  Eye, EyeOff, X
} from "lucide-react";
import Navbar from "../components/Navbar";

/* ---------- UI styles only (red & white theme, scoped to .adm) ---------- */
const css = `
.adm {
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
}
.adm *, .adm *::before, .adm *::after { box-sizing: border-box; }

.adm-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 34px 24px 70px;
}

/* ---------- Header ---------- */
.adm-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 26px;
}
.adm-eyebrow {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--soft);
  border: 1px solid #f7c9ce;
  color: var(--a2);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.adm-head h1 {
  margin: 12px 0 6px;
  color: var(--a3);
  font-size: clamp(26px, 3.4vw, 34px);
  letter-spacing: -0.03em;
}
.adm-head p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

/* ---------- Buttons ---------- */
.adm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 11px;
  border: 1.5px solid var(--line);
  background: #fff;
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease,
    background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.adm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--a1);
  color: var(--a1);
  box-shadow: 0 12px 22px -14px rgba(179, 18, 31, 0.7);
}
.adm-btn:active:not(:disabled) { transform: scale(0.97); }
.adm-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.adm-btn:focus-visible { outline: 2px solid var(--a1); outline-offset: 3px; }

.adm-btn-primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--a1), var(--a2));
  color: #fff;
  box-shadow: 0 14px 24px -14px rgba(179, 18, 31, 0.9);
}
.adm-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--a1), var(--a2));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 18px 28px -14px rgba(179, 18, 31, 1);
}
.adm-btn-danger {
  background: var(--soft);
  border-color: #f7c9ce;
  color: var(--a2);
}
.adm-btn-danger:hover:not(:disabled) {
  background: var(--a1);
  border-color: var(--a1);
  color: #fff;
}
.adm-btn-sm { padding: 8px 12px; font-size: 12px; border-radius: 9px; }
.adm-btn-block { width: 100%; padding: 14px; font-size: 14px; }

/* ---------- Stats ---------- */
.adm-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 26px;
}
.adm-stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}
.adm-stat:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 32px -22px rgba(179, 18, 31, 0.6);
}
.adm-stat-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--a1), var(--a2));
  color: #fff;
}
.adm-stat span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}
.adm-stat h2 {
  margin: 3px 0 0;
  color: var(--a3);
  font-size: 28px;
  letter-spacing: -0.03em;
}

/* ---------- Alerts ---------- */
.adm-alert {
  margin: 0 0 18px;
  padding: 13px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
.adm-alert.error { background: #fff0f1; border: 1px solid #f7c9ce; color: var(--a2); }
.adm-alert.success { background: #effaf3; border: 1px solid #bfe8cf; color: #14753f; }

/* ---------- Form ---------- */
.adm-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 24px 40px -34px rgba(122, 11, 20, 0.5);
}
.adm-card-title {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0 0 24px;
  color: var(--a3);
  font-size: 20px;
  letter-spacing: -0.02em;
}
.adm-card-title svg {
  padding: 8px;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--soft);
  color: var(--a1);
}

.adm-sec {
  padding: 22px 0;
  border-top: 1px dashed var(--line);
}
.adm-sec:first-of-type { padding-top: 0; border-top: 0; }
.adm-sec h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  color: var(--a2);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.adm-sec h3::before {
  content: "";
  width: 4px;
  height: 16px;
  border-radius: 4px;
  background: var(--a1);
}
.adm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}
.adm-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.fld { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.fld.full { grid-column: 1 / -1; }
.fld label {
  color: var(--ink);
  font-size: 12.5px;
  font-weight: 700;
}
.adm input:not([type="file"]),
.adm select,
.adm textarea {
  width: 100%;
  min-width: 0;
  padding: 12px 14px;
  border: 1.5px solid var(--line);
  border-radius: 11px;
  background: #fffafa;
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  outline: 0;
  transition: border-color 0.25s ease, box-shadow 0.3s ease, background 0.25s ease;
}
.adm input::placeholder, .adm textarea::placeholder { color: #b48a8f; }
.adm input:hover:not([type="file"]), .adm select:hover, .adm textarea:hover {
  border-color: #eba5ab;
}
.adm input:focus:not([type="file"]), .adm select:focus, .adm textarea:focus {
  border-color: var(--a1);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(225, 29, 46, 0.12);
}
.adm textarea { resize: vertical; line-height: 1.6; }
.adm textarea.mono { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12.5px; }
.adm small, .adm .adm-hint {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.adm-code {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  white-space: pre-wrap;
  border-radius: 12px;
  background: var(--a3);
  color: #ffd9dd;
  font-size: 12px;
  line-height: 1.6;
}

/* upload */
.upload-box {
  min-height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 2px dashed #eba5ab;
  border-radius: 16px;
  background: #fff6f6;
  color: var(--a1);
  text-align: center;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.3s var(--ease);
}
.upload-box:hover { background: var(--soft); border-color: var(--a1); transform: translateY(-2px); }
.upload-box span { font-weight: 700; font-size: 14px; }
.upload-box img { max-width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; }

.adm-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  padding-top: 22px;
  border-top: 1px dashed var(--line);
}
.adm-form-actions .adm-btn-primary { flex: 1 1 220px; }

/* ---------- Product list ---------- */
.adm-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.adm-list-head h2 {
  margin: 0;
  color: var(--a3);
  font-size: 20px;
  letter-spacing: -0.02em;
}
.adm-empty {
  padding: 50px 20px;
  text-align: center;
  background: #fff;
  border: 1.5px dashed var(--line);
  border-radius: 16px;
  color: var(--muted);
}
.adm-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 14px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease, border-color 0.25s ease;
}
.adm-row:hover {
  transform: translateY(-2px);
  border-color: #eba5ab;
  box-shadow: 0 20px 34px -26px rgba(179, 18, 31, 0.7);
}
.adm-thumb {
  width: 92px;
  height: 92px;
  object-fit: contain;
  padding: 6px;
  border-radius: 12px;
  background: #fff6f6;
  border: 1px solid #f7e1e3;
}
.adm-info { min-width: 0; display: flex; flex-direction: column; gap: 9px; }
.adm-name {
  color: var(--ink);
  font-size: 15px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.adm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.adm-chip {
  padding: 4px 9px;
  border-radius: 999px;
  background: #fff6f6;
  border: 1px solid #f7e1e3;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}
.adm-chip.low { background: var(--soft); border-color: #f7c9ce; color: var(--a2); }
.adm-price { text-align: right; white-space: nowrap; }
.adm-price strong { display: block; color: var(--a1); font-size: 19px; letter-spacing: -0.02em; }
.adm-price s { color: #b48a8f; font-size: 12px; }
.adm-price small { display: block; margin-top: 3px; }
.adm-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.adm-badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.adm-badge.on { background: #effaf3; color: #14753f; }
.adm-badge.off { background: #f4f1f1; color: #8a7a7c; }
.adm-actions { display: flex; flex-direction: column; gap: 8px; min-width: 124px; }
.adm-actions .adm-btn { justify-content: flex-start; }

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .adm-row { grid-template-columns: 80px minmax(0, 1fr); }
  .adm-thumb { width: 80px; height: 80px; }
  .adm-price { grid-column: 2; text-align: left; }
  .adm-actions { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; }
  .adm-actions .adm-btn { flex: 1 1 auto; justify-content: center; }
}
@media (max-width: 720px) {
  .adm-wrap { padding: 24px 15px 56px; }
  .adm-head { flex-direction: column; align-items: flex-start; }
  .adm-stats { grid-template-columns: 1fr; }
  .adm-card { padding: 20px 16px; border-radius: 16px; }
  .adm-grid, .adm-grid.three { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .adm *, .adm *::before, .adm *::after { transition: none !important; animation: none !important; }
}
`;

const initialForm = {
  name: "",
  category: "",
  brand: "",
  brand_custom: "",
  model: "",
  technology: "",
  printer_type: "",
  paper_format: "",
  function_type: "",
  sku: "",
  mrp: "",
  price: "",
  delivery_charge: "0",
  stock_quantity: "0",
  warranty: "",
  description: "",
  specifications: "[]"
};

function getSpecValue(product, label) {
  const sections = product.specifications?.sections || [];
  for (const section of sections) {
    const field = (section.fields || []).find(
      (item) => String(item.label || "").toLowerCase() === label.toLowerCase()
    );
    if (field?.value != null) return String(field.value);
  }
  return "";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAddPage = location.pathname === "/admin/products/add";
  const isProductsPage = location.pathname === "/admin/products";
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    try {
      setListLoading(true);
      const data = await apiRequest("/admin/products");
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setImage(null);
    setPreview("");
    const imageInput = document.getElementById("product-image");
    if (imageInput) imageInput.value = "";
  }

  function editProduct(product) {
    navigate("/admin/products/add");
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      brand: ["Canon", "HP", "Epson", "Brother", "Ricoh", "Kyocera", "Xerox", "Pantum", "Zebra", "TSC"].includes(product.brand) ? product.brand : (product.brand ? "Other" : ""),
      brand_custom: product.brand && !["Canon", "HP", "Epson", "Brother", "Ricoh", "Kyocera", "Xerox", "Pantum", "Zebra", "TSC"].includes(product.brand) ? product.brand : "",
      model: product.model || "",
      technology: getSpecValue(product, "Technology") || "",
      printer_type: getSpecValue(product, "Printer Type") || "",
      paper_format: getSpecValue(product, "Paper Format") || "",
      function_type: getSpecValue(product, "Function") || "",
      sku: product.sku || "",
      mrp: product.mrp ?? "",
      price: product.price ?? "",
      delivery_charge: product.delivery_charge ?? "0",
      stock_quantity: product.stock_quantity ?? "0",
      warranty: product.warranty || "",
      description: product.description || "",
      specifications: JSON.stringify(
        product.specifications?.sections || [],
        null,
        2
      )
    });
    setImage(null);
    setPreview(`${API_URL}/admin/products/${product.id}/image`);
    setError("");
    setSuccess("");
    document.getElementById("product-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!editingId && !image) {
      setError("Please select a product image.");
      return;
    }

    const price = Number(form.price);
    const mrp = form.mrp === "" ? null : Number(form.mrp);
    const delivery = Number(form.delivery_charge);
    const stock = Number(form.stock_quantity);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid selling price.");
      return;
    }
    if (mrp !== null && (!Number.isFinite(mrp) || mrp < 0)) {
      setError("Enter a valid MRP.");
      return;
    }
    if (mrp !== null && mrp < price) {
      setError("MRP should be equal to or greater than the selling price.");
      return;
    }
    if (!Number.isFinite(delivery) || delivery < 0) {
      setError("Enter a valid delivery charge.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    let parsedSpecifications;
    try {
      parsedSpecifications = JSON.parse(form.specifications || "[]");
      if (!Array.isArray(parsedSpecifications)) {
        throw new Error("Specifications must be a JSON array.");
      }
    } catch {
      setError("Invalid specifications JSON. Please check the format.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const selectedBrand = form.brand === "Other" ? form.brand_custom.trim() : form.brand;
      if (form.brand === "Other" && !selectedBrand) {
        setError("Please enter the brand name.");
        return;
      }

      const classificationFields = [
        ["Technology", form.technology],
        ["Printer Type", form.printer_type],
        ["Paper Format", form.paper_format],
        ["Function", form.function_type],
      ].filter(([, value]) => value);

      const cleanedSpecifications = parsedSpecifications
        .map((section) => ({
          ...section,
          fields: (section.fields || []).filter(
            (field) => !["technology", "printer type", "paper format", "function"].includes(
              String(field.label || "").toLowerCase()
            )
          ),
        }))
        .filter((section) => section.fields.length);

      if (classificationFields.length) {
        cleanedSpecifications.unshift({
          title: "Product Classification",
          fields: classificationFields.map(([label, value]) => ({
            label,
            type: "text",
            value,
          })),
        });
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "brand_custom" && key !== "technology" &&
            key !== "printer_type" && key !== "paper_format" &&
            key !== "function_type") formData.append(key, value);
      });
      formData.set("brand", selectedBrand);
      formData.set("delivery_charge", String(delivery));
      formData.set("specifications", JSON.stringify(cleanedSpecifications));
      if (image) formData.append("image", image);

      await apiRequest(
        editingId ? `/products/${editingId}` : "/products",
        {
          method: editingId ? "PUT" : "POST",
          body: formData
        }
      );

      setSuccess(editingId ? "Product updated successfully!" : "Product added successfully!");
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(product) {
    const nextStatus = product.is_published ? 0 : 1;
    const action = nextStatus ? "publish" : "unpublish";

    if (!window.confirm(`Are you sure you want to ${action} "${product.name}"?`)) {
      return;
    }

    try {
      setBusyProductId(product.id);
      setError("");
      setSuccess("");
      await apiRequest(`/products/${product.id}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ is_published: nextStatus })
      });
      setSuccess(nextStatus ? "Product published successfully." : "Product unpublished successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyProductId(null);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setBusyProductId(product.id);
      await apiRequest(`/products/${product.id}`, { method: "DELETE" });
      if (String(editingId) === String(product.id)) resetForm();
      setSuccess("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyProductId(null);
    }
  }

  async function logout() {
    try {
      await apiRequest("/admin/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("admin_session_active");
      localStorage.removeItem("admin_token");
      navigate("/admin/login");
    }
  }

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
  }

  const publishedCount = products.filter((p) => Number(p.is_published) === 1).length;

  return (
    <div className="adm">
      <style>{css}</style>
      <Navbar admin />

      <main className="adm-wrap">
        <div className="adm-head">
          <div>
            <span className="adm-eyebrow">STORE MANAGEMENT</span>
            <h1>{isAddPage ? (editingId ? "Edit Product" : "Add Product") : "All Products"}</h1>
            <p>{isAddPage ? "Add or update product information." : "Manage your product catalogue, stock and storefront visibility."}</p>
          </div>
          <button className="adm-btn" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>

        <div className="adm-stats">
          <div className="adm-stat">
            <div className="adm-stat-icon"><Package size={24} /></div>
            <div>
              <span>Total Products</span>
              <h2>{products.length}</h2>
            </div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-icon"><Eye size={24} /></div>
            <div>
              <span>Published</span>
              <h2>{publishedCount}</h2>
            </div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-icon"><EyeOff size={24} /></div>
            <div>
              <span>Unpublished</span>
              <h2>{products.length - publishedCount}</h2>
            </div>
          </div>
        </div>

        {/* Messages for the products list page (the form shows its own near the save button) */}
        {!isAddPage && error && <p className="adm-alert error">{error}</p>}
        {!isAddPage && success && <p className="adm-alert success">{success}</p>}

        {isAddPage && (
          <section className="adm-card" id="product-form">
            <h2 className="adm-card-title">
              {editingId ? <Pencil size={21} /> : <Plus size={21} />}
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="adm-sec">
                <h3>Basic Information</h3>
                <div className="adm-grid">
                  <div className="fld full">
                    <label>Product Name *</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="e.g. Colour A3 Multifunction Laser Printer" required />
                  </div>

                  <div className="fld">
                    <label>Category *</label>
                    <select name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Select category</option>
                      <option value="Printers">Printers</option>
                      <option value="Toner Cartridges">Toner Cartridges</option>
                      <option value="Ink Cartridges">Ink Cartridges</option>
                      <option value="Drum Units">Drum Units</option>
                      <option value="Printer Parts">Printer Parts</option>
                      <option value="Printer Accessories">Printer Accessories</option>
                      <option value="Labels & Ribbons">Labels &amp; Ribbons</option>
                    </select>
                  </div>

                  <div className="fld">
                    <label>Brand *</label>
                    <select name="brand" value={form.brand} onChange={handleChange} required>
                      <option value="">Select brand</option>
                      {["Canon", "HP", "Epson", "Brother", "Ricoh", "Kyocera", "Xerox", "Pantum", "Zebra", "TSC"].map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value="Other">Other / Custom brand</option>
                    </select>
                  </div>

                  {form.brand === "Other" && (
                    <div className="fld full">
                      <label>Custom Brand Name *</label>
                      <input name="brand_custom" value={form.brand_custom}
                        onChange={handleChange} placeholder="Enter brand name" required />
                    </div>
                  )}

                  <div className="fld">
                    <label>Model Number</label>
                    <input name="model" value={form.model} onChange={handleChange}
                      placeholder="Enter model number" />
                  </div>

                  <div className="fld">
                    <label>SKU / Product Code</label>
                    <input name="sku" value={form.sku} onChange={handleChange}
                      placeholder="Enter product SKU" />
                  </div>
                </div>
              </div>

              <div className="adm-sec">
                <h3>Product Filters & Classification</h3>
                <p className="adm-hint" style={{ margin: "-6px 0 16px" }}>
                  These selections power the filters shown on the customer product listing page.
                </p>
                <div className="adm-grid">
                  <div className="fld">
                    <label>Printing Technology</label>
                    <select name="technology" value={form.technology} onChange={handleChange}>
                      <option value="">Select technology</option>
                      <option value="Laser">Laser</option>
                      <option value="Inkjet">Inkjet</option>
                      <option value="Barcode">Barcode</option>
                    </select>
                  </div>

                  <div className="fld">
                    <label>Printer Type</label>
                    <select name="printer_type" value={form.printer_type} onChange={handleChange}>
                      <option value="">Select printer type</option>
                      <option value="Colour">Colour</option>
                      <option value="Mono">Mono / Monochrome</option>
                    </select>
                  </div>

                  <div className="fld">
                    <label>Paper / Media Format</label>
                    <select name="paper_format" value={form.paper_format} onChange={handleChange}>
                      <option value="">Select format</option>
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="A3 / A4">A3 / A4</option>
                    </select>
                  </div>

                  <div className="fld">
                    <label>Function</label>
                    <select name="function_type" value={form.function_type} onChange={handleChange}>
                      <option value="">Select function</option>
                      <option value="Single Function">Single Function</option>
                      <option value="Multifunction">Multifunction</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="adm-sec">
                <h3>Pricing Information</h3>
                <div className="adm-grid three">
                  <div className="fld">
                    <label>MRP (₹)</label>
                    <input type="number" name="mrp" min="0" step="0.01"
                      value={form.mrp} onChange={handleChange} placeholder="Maximum retail price" />
                  </div>

                  <div className="fld">
                    <label>Selling Price (₹) *</label>
                    <input type="number" name="price" min="0.01" step="0.01"
                      value={form.price} onChange={handleChange} placeholder="Selling price" required />
                  </div>

                  <div className="fld">
                    <label>Delivery Charge per Unit (₹)</label>
                    <input type="number" name="delivery_charge" min="0" step="0.01"
                      value={form.delivery_charge} onChange={handleChange} required />
                  </div>
                </div>
                <p className="adm-hint" style={{ margin: "10px 0 0" }}>
                  Delivery charge is multiplied by the ordered quantity.
                </p>
              </div>

              <div className="adm-sec">
                <h3>Inventory Information</h3>
                <div className="adm-grid">
                  <div className="fld">
                    <label>Available Stock Quantity *</label>
                    <input type="number" name="stock_quantity" min="0" step="1"
                      value={form.stock_quantity} onChange={handleChange} required />
                  </div>

                  <div className="fld">
                    <label>Warranty</label>
                    <input name="warranty" value={form.warranty} onChange={handleChange}
                      placeholder="e.g. 1 Year Onsite Warranty" />
                  </div>
                </div>
              </div>

              <div className="adm-sec">
                <h3>Product Details</h3>
                <div className="adm-grid">
                  <div className="fld full">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange}
                      placeholder="Enter complete product description" rows="5" />
                  </div>

                  <div className="fld full">
                    <label>Technical Specifications (JSON)</label>
                    <textarea className="mono" name="specifications" value={form.specifications}
                      onChange={handleChange} placeholder="Enter specifications JSON" rows="9" />
                    <small>Use an array of sections. Each section contains a title and fields.</small>
                  </div>

                  <div className="fld full">
                    <pre className="adm-code">{`[
  {
    "title": "Print Specifications",
    "fields": [
      { "label": "Print Speed", "type": "text", "value": "25 ppm" },
      { "label": "Print Technology", "type": "text", "value": "Laser" }
    ]
  },
  {
    "title": "Connectivity",
    "fields": [
      { "label": "Interface", "type": "text", "value": "USB, Ethernet, WiFi" }
    ]
  }
]`}</pre>
                  </div>
                </div>
              </div>

              <div className="adm-sec">
                <h3>Product Image</h3>
                <label htmlFor="product-image" className="upload-box">
                  {preview ? (
                    <img src={preview} alt="Product preview" />
                  ) : (
                    <>
                      <ImagePlus size={30} />
                      <span>Click to upload image</span>
                      <small>JPG, PNG or WebP · Maximum 2 MB</small>
                    </>
                  )}
                </label>
                <input id="product-image" type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage} hidden />
                {editingId && (
                  <p className="adm-hint" style={{ margin: "10px 0 0" }}>
                    Leave the image unchanged to keep the existing product image. Select a new image to replace it.
                  </p>
                )}
              </div>

              {error && <p className="adm-alert error">{error}</p>}
              {success && <p className="adm-alert success">{success}</p>}

              <div className="adm-form-actions">
                <button className="adm-btn adm-btn-primary adm-btn-block" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Product" : "Save Product"}
                </button>

                {editingId && (
                  <button type="button" className="adm-btn adm-btn-block"
                    style={{ flex: "0 1 auto", width: "auto" }}
                    onClick={resetForm}>
                    <X size={17} /> Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {isProductsPage && (
          <section>
            <div className="adm-list-head">
              <h2>All Products ({products.length})</h2>
            </div>

            {listLoading ? (
              <div className="adm-empty">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="adm-empty">No products added yet.</div>
            ) : (
              products.map((product) => {
                const isPublished = Number(product.is_published) === 1;
                const lowStock = Number(product.stock_quantity ?? 0) <= 5;

                return (
                  <div className="adm-row" key={product.id}>
                    <img
                      className="adm-thumb"
                      src={`${API_URL}/admin/products/${product.id}/image`}
                      alt={product.name}
                    />

                    <div className="adm-info">
                      <strong className="adm-name">{product.name}</strong>
                      <div className="adm-chips">
                        {product.brand && <span className="adm-chip">Brand: {product.brand}</span>}
                        {product.model && <span className="adm-chip">Model: {product.model}</span>}
                        {product.sku && <span className="adm-chip">SKU: {product.sku}</span>}
                        <span className={`adm-chip ${lowStock ? "low" : ""}`}>
                          Stock: {product.stock_quantity ?? 0}
                        </span>
                        {product.warranty && <span className="adm-chip">Warranty: {product.warranty}</span>}
                      </div>
                    </div>

                    <div className="adm-price">
                      <strong>₹{formatPrice(product.price)}</strong>
                      {product.mrp != null && <s>MRP ₹{formatPrice(product.mrp)}</s>}
                      <small>Delivery ₹{formatPrice(product.delivery_charge)} / unit</small>
                      <span className={`adm-badge ${isPublished ? "on" : "off"}`}>
                        {isPublished ? "Published" : "Unpublished"}
                      </span>
                    </div>

                    <div className="adm-actions">
                      <button type="button" className="adm-btn adm-btn-sm"
                        onClick={() => editProduct(product)} disabled={busyProductId === product.id}>
                        <Pencil size={15} /> Edit
                      </button>

                      <button type="button" className="adm-btn adm-btn-sm"
                        onClick={() => togglePublish(product)} disabled={busyProductId === product.id}>
                        {isPublished
                          ? <><EyeOff size={15} /> Unpublish</>
                          : <><Eye size={15} /> Publish</>}
                      </button>

                      <button type="button" className="adm-btn adm-btn-sm adm-btn-danger"
                        onClick={() => deleteProduct(product)} disabled={busyProductId === product.id}
                        title="Delete product">
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}
      </main>
    </div>
  );
}