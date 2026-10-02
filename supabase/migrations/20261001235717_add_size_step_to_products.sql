/*
# Add size_step column to products

1. Changes
- Adds `size_step` integer column to `products` table.
- Default value is 10 (1cm in mm units), which preserves existing behavior.
- When set to 5000 (5m in mm units), the size slider/input steps by 5m increments.
- Existing products automatically get the default value of 10.
2. Security
- No RLS policy changes. The column is readable/writable through existing policies.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'size_step'
  ) THEN
    ALTER TABLE products ADD COLUMN size_step integer NOT NULL DEFAULT 10;
  END IF;
END $$;
