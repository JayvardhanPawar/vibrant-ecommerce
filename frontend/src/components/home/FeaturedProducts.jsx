import { ChevronRight } from "lucide-react";
import ProductGridItem from "./ProductGridItem";
import { scrollToCatalog } from "./homeData";

export default function FeaturedProducts({ products }) {
  if (products.length === 0) return null;

  return (
    <section className="store-section">
      <div className="store-section-heading store-heading-row">
        <div>
          <span className="store-eyebrow">HANDPICKED FOR YOU</span>
          <h2>Featured products</h2>
          <p>Explore products available in our store.</p>
        </div>
        <button className="store-text-btn" onClick={scrollToCatalog}>
          View all products <ChevronRight size={16} />
        </button>
      </div>
      <div className="store-product-grid">
        {products.map((product) => (
          <ProductGridItem key={`featured-${product.id}`} product={product} linked />
        ))}
      </div>
    </section>
  );
}
