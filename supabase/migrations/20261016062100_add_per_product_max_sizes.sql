/*
# Add per-product max size columns to products table

1. Modified Tables
- `products`: adds `max_width`, `max_depth`, `max_height` nullable integer columns.
  When NULL, the global size setting (from settings) is used as the maximum for that axis.
  When set to a specific value, that value overrides the global max for this product only.

2. Security
- No RLS policy changes. The columns are readable by the same existing policies.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS max_width integer,
  ADD COLUMN IF NOT EXISTS max_depth integer,
  ADD COLUMN IF NOT EXISTS max_height integer;
