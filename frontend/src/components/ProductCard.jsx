
import { ImageOff } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function ProductCard({ product }) {
  const imageUrl = `${API_URL}/products/${product.id}/image`;

  return (
    <article className="product-card">
      <div className="product-image">
        {product.image_type ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "block";
            }}
          />
        ) : null}

        <div style={{ display: "none" }}>
          <ImageOff size={35} />
        </div>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description || "No description available"}
        </p>

        <div className="product-price">
          ₹{Number(product.price).toLocaleString("en-IN", {
            minimumFractionDigits: 2
          })}
        </div>
      </div>
    </article>
  );
}
