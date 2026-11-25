import { Printer, RefreshCw } from "lucide-react";

export function LoadingState() {
  return (
    <div className="store-state">
      <span className="store-loader" />
      <p>Loading products...</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="store-state store-state-error">
      <h3>We couldn't load the products</h3>
      <p>{message}</p>
      <button className="store-primary-btn" onClick={onRetry}>
        Try again <RefreshCw size={16} />
      </button>
    </div>
  );
}

export function EmptyState({ hasProducts, hasFilters, onClearFilters }) {
  return (
    <div className="store-state">
      <Printer size={34} />
      <h3>No matching products found</h3>
      <p>
        {hasProducts
          ? "Try another search term or choose a different category."
          : "Products added through the admin dashboard will appear here."}
      </p>
      {hasFilters && (
        <button className="store-secondary-btn" onClick={onClearFilters}>
          Clear filters
        </button>
      )}
    </div>
  );
}
