import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const data = await apiRequest("/products");
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err.message || "Unable to load products. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, refreshing, error, loadProducts };
}
