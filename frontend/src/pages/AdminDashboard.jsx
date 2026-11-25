import { useEffect, useState } from "react";
import { apiRequest, API_URL } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Plus, Trash2, LogOut, Package, ImagePlus, Layers3, CopyPlus,
  ChevronDown, ChevronUp, Save, FileText, X, Settings2
} from "lucide-react";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Printers", "Ink & Toner", "Cartridges & Drums", "Accessories"];
const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "multiselect", label: "Multiple choice" },
  { value: "checkbox", label: "Yes / No" },
];
const makeField = () => ({ id: `f-${Date.now()}-${Math.random()}`, label: "", type: "text", options: [], required: false, value: "" });
const makeSection = (title = "New Section") => ({ id: `s-${Date.now()}-${Math.random()}`, title, fields: [makeField()] });

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Printers");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("0");
  const [warranty, setWarranty] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    try {
      const data = await apiRequest("/products");
      setProducts(data.products || []);
    } catch (err) { setError(err.message); }
  }

  async function loadTemplates() {
    try {
      const data = await apiRequest("/spec-templates");
      setTemplates(data.templates || []);
    } catch (err) {
      setError(`${err.message}. Run migration.sql before using templates.`);
    }
  }

  useEffect(() => { loadProducts(); loadTemplates(); }, []);

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed."); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2 MB."); return;
    }
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  function applyTemplate(templateId) {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const template = templates.find((item) => String(item.id) === String(templateId));
    const templateSections = template?.template_json?.sections || [];
    setSections(templateSections.map((section) => ({
      id: `s-${Date.now()}-${Math.random()}`,
      title: section.title || "Specifications",
      fields: (section.fields || []).map((field) => ({
        ...field,
        id: `f-${Date.now()}-${Math.random()}`,
        options: Array.isArray(field.options) ? field.options : [],
        value: "",
      })),
    })));
    if (template?.category) setCategory(template.category);
  }

  function updateSection(sectionId, patch) {
    setSections((current) => current.map((section) => section.id === sectionId ? { ...section, ...patch } : section));
  }
  function updateField(sectionId, fieldId, patch) {
    setSections((current) => current.map((section) => section.id !== sectionId ? section : {
      ...section,
      fields: section.fields.map((field) => field.id === fieldId ? { ...field, ...patch } : field),
    }));
  }
  function addField(sectionId) {
    setSections((current) => current.map((section) => section.id === sectionId ? { ...section, fields: [...section.fields, makeField()] } : section));
  }
  function moveSection(index, direction) {
    setSections((current) => {
      const next = [...current]; const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]]; return next;
    });
  }
  function moveField(sectionId, index, direction) {
    setSections((current) => current.map((section) => {
      if (section.id !== sectionId) return section;
      const fields = [...section.fields]; const target = index + direction;
      if (target < 0 || target >= fields.length) return section;
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...section, fields };
    }));
  }

  async function saveTemplate() {
    if (!templateName.trim()) { setError("Enter a name for this reusable template."); return; }
    if (!sections.length || sections.some((section) => !section.title.trim())) {
      setError("Add at least one named section before saving a template."); return;
    }
    setTemplateLoading(true); setError(""); setSuccess("");
    try {
      const payload = {
        name: templateName.trim(), category, description: templateDescription,
        sections: sections.map((section) => ({
          title: section.title,
          fields: section.fields.filter((field) => field.label.trim()).map(({ label, type, options, required }) => ({
            label, type, options: type === "select" || type === "multiselect" ? options : [], required,
          })),
        })),
      };
      await apiRequest("/spec-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setTemplateName(""); setTemplateDescription("");
      setSuccess("Reusable specification template saved.");
      await loadTemplates();
    } catch (err) { setError(err.message); }
    finally { setTemplateLoading(false); }
  }

  async function deleteTemplate(id) {
    if (!window.confirm("Delete this reusable template? Existing products will not be affected.")) return;
    try {
      await apiRequest(`/spec-templates/${id}`, { method: "DELETE" });
      setTemplates((current) => current.filter((item) => item.id !== id));
      if (String(selectedTemplate) === String(id)) setSelectedTemplate("");
      setSuccess("Template deleted. Existing product specifications are unchanged.");
    } catch (err) { setError(err.message); }
  }

  function resetProductForm() {
    setEditingProductId(null);
    setName(""); setPrice(""); setDescription(""); setBrand(""); setModel("");
    setSku(""); setMrp(""); setStock("0"); setWarranty("");
    setImage(null); setSections([]); setSelectedTemplate("");
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    const imageInput = document.getElementById("product-image");
    if (imageInput) imageInput.value = "";
  }

  function startEditProduct(product) {
    setEditingProductId(product.id);
    setName(product.name || "");
    setPrice(String(product.price ?? ""));
    setDescription(product.description || "");
    setCategory(product.category || "Printers");
    setBrand(product.brand || "");
    setModel(product.model || "");
    setSku(product.sku || "");
    setMrp(product.mrp == null ? "" : String(product.mrp));
    setStock(String(product.stock_quantity ?? 0));
    setWarranty(product.warranty || "");
    setImage(null);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(product.image_type ? `${API_URL}/products/${product.id}/image` : "");
    const savedSections = Array.isArray(product.specifications?.sections)
      ? product.specifications.sections
      : [];
    setSections(savedSections.map((section) => ({
      id: `s-${Date.now()}-${Math.random()}`,
      title: section.title || "Specifications",
      fields: (section.fields || []).map((field) => ({
        ...field,
        id: `f-${Date.now()}-${Math.random()}`,
        options: Array.isArray(field.options) ? field.options : [],
        value: field.value ?? "",
      })),
    })));
    setSelectedTemplate("");
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!editingProductId && !image) {
      setError("Please select a product image.");
      return;
    }
    if (sections.some((section) => !section.title.trim())) {
      setError("Every specification section needs a title.");
      return;
    }
    const invalidField = sections.some((section) =>
      section.fields.some((field) =>
        field.required && (field.value === false || field.value === "" ||
          field.value == null || (Array.isArray(field.value) && !field.value.length))
      )
    );
    if (invalidField) {
      setError("Please complete all required specification fields.");
      return;
    }

    try {
      setLoading(true); setError(""); setSuccess("");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("model", model);
      formData.append("sku", sku);
      formData.append("mrp", mrp);
      formData.append("stock_quantity", stock);
      formData.append("warranty", warranty);
      formData.append("specifications", JSON.stringify(sections.map((section) => ({
        title: section.title,
        fields: section.fields.filter((field) => field.label.trim()).map(
          ({ label, type, options, required, value }) => ({
            label, type,
            options: type === "select" || type === "multiselect" ? options : [],
            required, value,
          })
        ),
      }))));
      if (image) formData.append("image", image);

      const isEditing = Boolean(editingProductId);
      await apiRequest(
        isEditing ? `/products/${editingProductId}` : "/products",
        { method: isEditing ? "PUT" : "POST", body: formData }
      );

      resetProductForm();
      setSuccess(isEditing
        ? "Product updated successfully."
        : "Product added successfully with its specifications.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      setProducts((current) => current.filter((product) => product.id !== id));
      setSuccess("Product deleted successfully.");
    } catch (err) { setError(err.message); }
  }

  function logout() { localStorage.removeItem("admin_token"); navigate("/admin/login"); }

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #f3d3d6", borderRadius: 9, font: "inherit", background: "#fff" };
  const labelStyle = { display: "block", margin: "13px 0 6px", fontWeight: 650, fontSize: 13, color: "#3b1f23" };

  return (
    <div className="printer-admin-page">
      <Navbar admin />
      <main className="admin-container">
        <div className="admin-heading">
          <div><span className="eyebrow">PRINTER STORE MANAGEMENT</span><h1>Product Management</h1><p>Add printers and printing supplies with flexible technical specifications.</p></div>
          <button className="logout-btn" onClick={logout}><LogOut size={17} /> Logout</button>
        </div>
        <div className="stats-card"><Package size={25} /><div><span>Total Products</span><h2>{products.length}</h2></div></div>

        <div className="printer-admin-grid">
          <section className="admin-form-card printer-builder-card">
            <h2><Plus size={21} /> {editingProductId ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="printer-form-grid">
                <div><label style={labelStyle}>Product Name *</label><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pantum BM5100ADW" required /></div>
                <div><label style={labelStyle}>Category *</label><select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
                <div><label style={labelStyle}>Brand</label><input style={inputStyle} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Pantum" /></div>
                <div><label style={labelStyle}>Model Number</label><input style={inputStyle} value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. BM5100ADW" /></div>
                <div><label style={labelStyle}>SKU / Product Code</label><input style={inputStyle} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional stock code" /></div>
                <div><label style={labelStyle}>Selling Price (₹) *</label><input style={inputStyle} type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15998" required /></div>
                <div><label style={labelStyle}>MRP (₹)</label><input style={inputStyle} type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="Optional" /></div>
                <div><label style={labelStyle}>Stock Quantity</label><input style={inputStyle} type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
                <div><label style={labelStyle}>Warranty</label><input style={inputStyle} value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 1 Year Onsite" /></div>
              </div>
              <label style={labelStyle}>Product Description</label>
              <textarea style={{ ...inputStyle, minHeight: 95, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the product, its benefits and intended use..." />

              <div className="spec-builder-panel">
                <div className="spec-builder-heading"><div><span className="spec-kicker">CUSTOMIZABLE SPECIFICATIONS</span><h3><Settings2 size={19} /> Specification Builder</h3><p>Start from a reusable template or build sections from scratch.</p></div><span className="spec-count">{sections.length} sections</span></div>
                <div className="spec-template-row">
                  <select style={inputStyle} value={selectedTemplate} onChange={(e) => applyTemplate(e.target.value)}>
                    <option value="">Start without a template</option>
                    {templates.map((template) => <option key={template.id} value={template.id}>{template.name}{template.category ? ` · ${template.category}` : ""}</option>)}
                  </select>
                  <button type="button" className="spec-light-btn" onClick={() => setSections((current) => [...current, makeSection()])}><Plus size={16} /> Add Section</button>
                </div>
                {sections.length === 0 ? <div className="spec-empty"><Layers3 size={27} /><strong>No specification sections yet</strong><span>Add a section such as Printing, Scanning, Paper Handling or Connectivity.</span><button type="button" className="spec-light-btn" onClick={() => setSections([makeSection("Printing Specifications")])}><Plus size={16} /> Create first section</button></div> : (
                  <div className="spec-sections-list">
                    {sections.map((section, sectionIndex) => (
                      <div className="spec-section-card" key={section.id}>
                        <div className="spec-section-top"><input style={{ ...inputStyle, fontWeight: 700 }} value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} aria-label="Section title" placeholder="Section title" /><div className="spec-icon-actions"><button type="button" title="Move up" disabled={sectionIndex === 0} onClick={() => moveSection(sectionIndex, -1)}><ChevronUp size={17} /></button><button type="button" title="Move down" disabled={sectionIndex === sections.length - 1} onClick={() => moveSection(sectionIndex, 1)}><ChevronDown size={17} /></button><button type="button" title="Remove section" onClick={() => setSections((current) => current.filter((item) => item.id !== section.id))}><Trash2 size={16} /></button></div></div>
                        {section.fields.map((field, fieldIndex) => (
                          <div className="spec-field-editor" key={field.id}>
                            <div className="spec-field-config">
                              <input style={inputStyle} value={field.label} onChange={(e) => updateField(section.id, field.id, { label: e.target.value })} placeholder="Field label e.g. Print Speed" aria-label="Field label" />
                              <select style={inputStyle} value={field.type} onChange={(e) => updateField(section.id, field.id, { type: e.target.value, value: "" })}>{FIELD_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
                              <label className="spec-required"><input type="checkbox" checked={field.required} onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })} /> Required</label>
                              <div className="spec-icon-actions"><button type="button" title="Move field up" disabled={fieldIndex === 0} onClick={() => moveField(section.id, fieldIndex, -1)}><ChevronUp size={15} /></button><button type="button" title="Move field down" disabled={fieldIndex === section.fields.length - 1} onClick={() => moveField(section.id, fieldIndex, 1)}><ChevronDown size={15} /></button><button type="button" title="Remove field" onClick={() => updateSection(section.id, { fields: section.fields.filter((item) => item.id !== field.id) })}><X size={16} /></button></div>
                            </div>
                            {(field.type === "select" || field.type === "multiselect") && <input style={{ ...inputStyle, marginTop: 8 }} value={(field.options || []).join(", ")} onChange={(e) => updateField(section.id, field.id, { options: e.target.value.split(",").map((option) => option.trim()).filter(Boolean) })} placeholder="Options separated by commas: A4, A3, Letter" />}
                            <div className="spec-field-value"><span>Product value</span>
                              {field.type === "textarea" ? <textarea style={inputStyle} rows="2" value={field.value || ""} onChange={(e) => updateField(section.id, field.id, { value: e.target.value })} placeholder="Enter specification value" /> : field.type === "checkbox" ? <label className="spec-value-check"><input type="checkbox" checked={Boolean(field.value)} onChange={(e) => updateField(section.id, field.id, { value: e.target.checked })} /> Yes</label> : field.type === "select" ? <select style={inputStyle} value={field.value || ""} onChange={(e) => updateField(section.id, field.id, { value: e.target.value })}><option value="">Select value</option>{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select> : field.type === "multiselect" ? <input style={inputStyle} value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""} onChange={(e) => updateField(section.id, field.id, { value: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} placeholder="Selected values separated by commas" /> : <input style={inputStyle} type={field.type === "number" ? "number" : "text"} value={field.value ?? ""} onChange={(e) => updateField(section.id, field.id, { value: e.target.value })} placeholder="Enter specification value" />}
                            </div>
                          </div>
                        ))}
                        <button type="button" className="spec-add-field" onClick={() => addField(section.id)}><Plus size={15} /> Add field to this section</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="spec-save-template">
                  <div><strong><CopyPlus size={17} /> Save these sections as a reusable template</strong><span>Templates can be applied to other products and customized independently.</span></div>
                  <div className="spec-template-save-fields"><input style={inputStyle} value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name e.g. Mono Laser MFP" /><input style={inputStyle} value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} placeholder="Template description (optional)" /><button type="button" className="spec-light-btn" onClick={saveTemplate} disabled={templateLoading || !sections.length}><Save size={16} /> {templateLoading ? "Saving..." : "Save Template"}</button></div>
                </div>
                {templates.length > 0 && <div className="spec-existing-templates"><strong><FileText size={16} /> Saved templates</strong>{templates.map((template) => <div key={template.id}><span>{template.name} <small>{template.category || "All categories"}</small></span><button type="button" onClick={() => deleteTemplate(template.id)} title="Delete template"><Trash2 size={15} /></button></div>)}</div>}
              </div>

              <label style={labelStyle}>Product Image *</label>
              <label htmlFor="product-image" className="upload-box printer-upload-box">{preview ? <img src={preview} alt="Product preview" /> : <><ImagePlus size={30} /><span>Click to upload product image</span><small>JPG, PNG or WebP · Maximum 2 MB</small></>}</label>
              <input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} hidden />
              {error && <p className="error-message">{error}</p>}{success && <p className="success-message">{success}</p>}
              <div className="printer-form-actions">
                <button className="primary-btn" disabled={loading}>
                  {loading ? "Saving Product..." : editingProductId ? "Update Product" : "Save Product"}
                </button>
                {editingProductId && (
                  <button type="button" className="spec-light-btn" onClick={resetProductForm} disabled={loading}>
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-products printer-products-panel">
            <h2>All Products ({products.length})</h2>
            {products.length === 0 ? <div className="empty-state">No products added yet.</div> : products.map((product) => (
              <div className="admin-product" key={product.id}>
                <img src={`${API_URL}/products/${product.id}/image`} alt={product.name} />
                <div className="admin-product-info"><strong>{product.name}</strong><span>{product.brand || ""}{product.model ? ` · ${product.model}` : ""}</span><span>₹{Number(product.price).toLocaleString("en-IN")}</span><small>{product.category || "Uncategorized"} · {product.stock_quantity ?? 0} in stock</small></div>
                <div className="printer-product-actions">
                  <button type="button" className="printer-edit-btn" onClick={() => startEditProduct(product)} title="Edit product">
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteProduct(product.id)} title="Delete product"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
      <style>{`
        .printer-admin-page{background:#fff6f6;min-height:100vh}.printer-admin-page .admin-container{max-width:1440px;margin:0 auto;padding:34px 4.5% 70px}.printer-admin-page .admin-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px}.printer-admin-page .admin-heading h1{margin:7px 0;font-size:32px;color:#7a0b14}.printer-admin-page .admin-heading p{margin:0;color:#7c5b5f}.printer-admin-page .eyebrow{font-size:11px;letter-spacing:1.8px;font-weight:800;color:#e11d2e}.printer-admin-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:22px;align-items:start}.printer-builder-card,.printer-products-panel{background:#fff;border:1px solid #f3d3d6;border-radius:16px;padding:24px;box-shadow:0 8px 28px #b3121f10}.printer-builder-card>h2,.printer-products-panel>h2{display:flex;align-items:center;gap:9px;margin:0 0 18px;color:#7a0b14;font-size:19px}.printer-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}.spec-builder-panel{border:1px solid #f3d3d6;border-radius:14px;padding:18px;margin:22px 0;background:#fff6f6}.spec-builder-heading{display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.spec-builder-heading h3{display:flex;gap:8px;align-items:center;margin:5px 0;color:#7a0b14;font-size:18px}.spec-builder-heading p{margin:0;color:#7c5b5f;font-size:13px}.spec-kicker{font-size:10px;letter-spacing:1.4px;color:#e11d2e;font-weight:800}.spec-count{font-size:12px;color:#e11d2e;background:#fdecee;border-radius:20px;padding:6px 10px;white-space:nowrap}.spec-template-row{display:flex;gap:10px;margin:18px 0}.spec-template-row select{flex:1}.spec-light-btn{border:1px solid #f7c9ce;background:#fdecee;color:#b3121f;border-radius:9px;padding:10px 13px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;white-space:nowrap}.spec-light-btn:disabled{opacity:.5;cursor:not-allowed}.spec-empty{border:1px dashed #eba5ab;border-radius:12px;padding:25px 15px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:#7c5b5f}.spec-empty strong{color:#3b1f23}.spec-empty span{font-size:13px;max-width:360px}.spec-sections-list{display:grid;gap:13px}.spec-section-card{border:1px solid #f3d3d6;border-radius:12px;padding:13px;background:#fff}.spec-section-top{display:flex;gap:8px;align-items:center}.spec-section-top input{background:#fff6f6!important}.spec-icon-actions{display:flex;align-items:center;gap:3px;flex-shrink:0}.spec-icon-actions button,.spec-existing-templates button{border:0;background:transparent;color:#7c5b5f;padding:6px;cursor:pointer;border-radius:6px}.spec-icon-actions button:hover,.spec-existing-templates button:hover{background:#fdecee;color:#e11d2e}.spec-icon-actions button:disabled{opacity:.25;cursor:default}.spec-field-editor{border-top:1px solid #f7e1e3;margin-top:12px;padding-top:12px}.spec-field-config{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(110px,.8fr) auto auto;gap:7px;align-items:center}.spec-required{display:flex;align-items:center;gap:4px;font-size:11px;color:#7c5b5f;white-space:nowrap}.spec-field-value{display:grid;grid-template-columns:100px 1fr;gap:10px;align-items:center;margin-top:8px}.spec-field-value>span{font-size:12px;color:#7c5b5f}.spec-value-check{display:flex;align-items:center;gap:8px;color:#3b1f23;font-size:13px}.spec-add-field{border:0;background:transparent;color:#e11d2e;font-weight:700;font-size:12px;padding:10px 2px 1px;display:flex;align-items:center;gap:5px;cursor:pointer}.spec-save-template{border-top:1px solid #f3d3d6;margin-top:18px;padding-top:15px}.spec-save-template>div:first-child strong,.spec-existing-templates>strong{display:flex;align-items:center;gap:7px;color:#3b1f23;font-size:13px}.spec-save-template>div:first-child span{display:block;color:#7c5b5f;font-size:11px;margin:4px 0 10px}.spec-template-save-fields{display:grid;grid-template-columns:1fr 1fr auto;gap:8px}.spec-template-save-fields input{min-width:0}.spec-existing-templates{border-top:1px solid #f3d3d6;margin-top:14px;padding-top:13px}.spec-existing-templates>div{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f7e1e3;font-size:12px;color:#3b1f23}.spec-existing-templates small{color:#7c5b5f;margin-left:5px}.printer-upload-box{min-height:130px}.printer-products-panel{position:sticky;top:18px}.printer-products-panel .admin-product{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f7e1e3}.printer-products-panel .admin-product img{width:65px;height:65px;object-fit:contain;background:#fff6f6;border-radius:9px}.printer-products-panel .admin-product-info{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}.printer-products-panel .admin-product-info strong{font-size:13px;color:#3b1f23}.printer-products-panel .admin-product-info span,.printer-products-panel .admin-product-info small{font-size:11px;color:#7c5b5f}.printer-products-panel .admin-product-info span:nth-child(2){color:#e11d2e;font-weight:700}.printer-product-actions{display:flex;align-items:center;gap:6px}.printer-edit-btn{border:1px solid #f7c9ce;background:#fdecee;color:#b3121f;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer}.printer-form-actions{display:flex;gap:10px;align-items:center}.printer-form-actions .primary-btn{flex:1}.printer-products-panel .delete-btn{border:0;background:#fff1f1;color:#d44b58;border-radius:8px;padding:8px;cursor:pointer}.printer-admin-page .primary-btn{width:100%;margin-top:16px}.printer-admin-page .error-message{color:#c43d4b;background:#fff1f1;padding:10px;border-radius:8px;font-size:13px}.printer-admin-page .success-message{color:#24784c;background:#edfaf2;padding:10px;border-radius:8px;font-size:13px}.printer-admin-page .primary-btn{background:linear-gradient(135deg,#e11d2e,#b3121f);color:#fff;border:0;border-radius:10px;padding:13px 18px;font-weight:700;cursor:pointer;box-shadow:0 12px 22px -12px rgba(179,18,31,.9);transition:transform .3s,box-shadow .3s}.printer-admin-page .primary-btn:hover:not(:disabled){transform:translateY(-2px)}.printer-admin-page .primary-btn:disabled{opacity:.6;cursor:not-allowed}.printer-admin-page .logout-btn{display:inline-flex;align-items:center;gap:7px;border:1px solid #f7c9ce;background:#fdecee;color:#b3121f;border-radius:10px;padding:10px 15px;font-weight:700;cursor:pointer}.printer-admin-page .logout-btn:hover{background:#e11d2e;color:#fff;border-color:#e11d2e}.printer-admin-page .stats-card{display:flex;align-items:center;gap:14px;width:fit-content;min-width:220px;margin-bottom:22px;padding:16px 22px;background:#fff;border:1px solid #f3d3d6;border-left:4px solid #e11d2e;border-radius:14px;color:#e11d2e;box-shadow:0 8px 28px -14px rgba(179,18,31,.35)}.printer-admin-page .stats-card span{font-size:12px;color:#7c5b5f;font-weight:600}.printer-admin-page .stats-card h2{margin:2px 0 0;color:#7a0b14;font-size:26px}.printer-admin-page .upload-box{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:2px dashed #eba5ab;background:#fff6f6;color:#e11d2e;border-radius:12px;cursor:pointer;text-align:center;overflow:hidden;transition:background .3s,border-color .3s}.printer-admin-page .upload-box:hover{background:#fdecee;border-color:#e11d2e}.printer-admin-page .upload-box small{color:#7c5b5f}.printer-admin-page .upload-box img{max-width:100%;max-height:220px;object-fit:contain}.printer-admin-page input:focus,.printer-admin-page select:focus,.printer-admin-page textarea:focus{outline:2px solid rgba(225,29,46,.35);outline-offset:1px;border-color:#e11d2e!important}.printer-admin-page .empty-state{padding:24px;text-align:center;color:#7c5b5f;background:#fff6f6;border-radius:10px}@media(max-width:1050px){.printer-admin-grid{grid-template-columns:1fr}.printer-products-panel{position:static}}@media(max-width:650px){.printer-admin-page .admin-container{padding:22px 15px 50px}.printer-admin-page .admin-heading{align-items:flex-start}.printer-admin-page .admin-heading h1{font-size:25px}.printer-form-grid{grid-template-columns:1fr}.spec-template-row{flex-direction:column}.spec-field-config{grid-template-columns:1fr 1fr}.spec-field-config .spec-required{grid-column:1}.spec-field-value{grid-template-columns:1fr;gap:5px}.spec-template-save-fields{grid-template-columns:1fr}.spec-section-top{align-items:flex-start}.spec-section-top input{min-width:0}}
      `}</style>
    </div>
  );
}