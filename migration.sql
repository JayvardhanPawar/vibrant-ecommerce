-- Run once in the correct Hostinger MySQL database via phpMyAdmin.
-- Adds per-unit delivery charge to products and snapshots it on each order line.
ALTER TABLE products
  ADD COLUMN delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE order_items
  ADD COLUMN delivery_charge_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN delivery_total DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Existing orders retain their current totals. New orders use product delivery charges.
