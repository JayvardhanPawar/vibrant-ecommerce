-- Run once in the correct Hostinger MySQL database after taking a backup.
-- Existing products remain published so the current storefront is unchanged.
ALTER TABLE products
  ADD COLUMN is_published TINYINT(1) NOT NULL DEFAULT 1;
