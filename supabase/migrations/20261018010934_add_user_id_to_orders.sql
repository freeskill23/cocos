/*
# Add user_id column to orders table

1. Modified Tables
- `orders`: adds nullable `user_id` uuid column to link orders to auth users
  when the customer is logged in. Existing guest orders remain NULL.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
