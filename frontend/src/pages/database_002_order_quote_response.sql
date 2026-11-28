-- Apply once to the same Hostinger MySQL database.
-- Adds customer response tracking for manually calculated shipping quotes.
ALTER TABLE orders
  ADD COLUMN quote_response ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'
  AFTER shipping_status;
