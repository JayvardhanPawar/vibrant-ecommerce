import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/home/HeroSection";
import BenefitsBar from "../components/home/BenefitsBar";
import CategorySection from "../components/home/CategorySection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import ProductCatalog from "../components/home/ProductCatalog";
import BottomBanner from "../components/home/BottomBanner";
import StoreFooter from "../components/home/StoreFooter";
import { categories, scrollToCatalog } from "../components/home/homeData";
import useProducts from "../hooks/useProducts";
import "./Home.css";
import Footer from "../components/Footer";
export default function Home() {
  const { products, loading, refreshing, error, loadProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selected = categories.find((c) => c.name === activeCategory);

    return products.filter((product) => {
      const searchableText = [product.name, product.description, product.brand, product.model]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesCategory =
        !selected || selected.keywords.some((k) => searchableText.includes(k));

      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  const featuredProducts = products.slice(0, 4);

  function chooseCategory(name) {
    setActiveCategory(name);
    setSearch("");
    scrollToCatalog();
  }

  function handleSearchChange(value) {
    setSearch(value);
    if (value && activeCategory !== "All") setActiveCategory("All");
  }

  function clearFilters() {
    setSearch("");
    setActiveCategory("All");
  }

  const showFeatured = !search && activeCategory === "All";

  return (
    <div className="store-home">
      <Navbar />
      <main>
        <HeroSection onChooseCategory={chooseCategory} />
        <BenefitsBar />
        <CategorySection activeCategory={activeCategory} onChooseCategory={chooseCategory} />
        {/* {showFeatured && <FeaturedProducts products={featuredProducts} />} */}
        <ProductCatalog
          products={products}
          filteredProducts={filteredProducts}
          loading={loading}
          refreshing={refreshing}
          error={error}
          search={search}
          activeCategory={activeCategory}
          onSearchChange={handleSearchChange}
          onCategoryChange={setActiveCategory}
          onClearFilters={clearFilters}
          onRefresh={() => loadProducts(true)}
          onRetry={() => loadProducts()}
        />
        <BottomBanner />
      </main>
      <Footer />
    </div>
  );
}