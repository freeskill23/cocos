/*
# Add fake_daily_purchases column to products table

1. Modified Tables
- `products`: adds `fake_daily_purchases` integer column (default 0).
  This stores the admin-configured number of "today's purchasers" to display
  on the product detail page. The number is distributed across 0-24 hours
  on the frontend so it grows naturally throughout the day.

2. Security
- No RLS policy changes. The column is readable by the same existing policies.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS fake_daily_purchases integer NOT NULL DEFAULT 0;
