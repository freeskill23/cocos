/*
# Fix card payment order status update RLS policy

## Problem
Card payment orders are created with `portone_merchant_id` but no `payment_token`.
The existing UPDATE policies on `orders` are:
1. `anon_update_order_status_by_token` — requires `payment_token IS NOT NULL` (bank transfer only)
2. `anon_cancel_order_by_number` — only allows status = `cancelled`

Neither policy matches when the frontend tries to set status = `paid` for a card payment
order (which has no payment_token). The UPDATE silently affects 0 rows, so the order
stays in `payment_pending` forever.

## Fix
Add a new permissive UPDATE policy that allows updating orders by `portone_merchant_id`
when the new status is `paid`. This covers the card payment confirmation flow where
`confirmCardPayment` updates the order by its `portone_merchant_id`.

## Security
- The policy only allows updating rows that have a `portone_merchant_id` set.
- The WITH CHECK restricts the resulting status to `paid` (card payment confirmation only).
- Scoped to `anon, authenticated` since this is a no-auth-required checkout flow.
*/

DROP POLICY IF EXISTS "anon_confirm_card_payment_by_merchant_id" ON orders;

CREATE POLICY "anon_confirm_card_payment_by_merchant_id"
ON orders FOR UPDATE
TO anon, authenticated
USING (portone_merchant_id IS NOT NULL)
WITH CHECK (portone_merchant_id IS NOT NULL AND status = 'paid');
