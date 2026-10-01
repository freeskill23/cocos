/*
# Add refund account columns to orders

## Changes
1. New columns on `orders`:
   - `refund_bank` (text, nullable) — 환불받을 은행명 (무통장입금 취소 시 고객 입력)
   - `refund_account_number` (text, nullable) — 환불받을 계좌번호
   - `refund_account_holder` (text, nullable) — 환불받을 예금주명
   - `card_cancel_reason` (text, nullable) — 카드 결제 취소 사유

## Notes
- All columns are nullable so existing orders are unaffected.
- For bank transfer cancellations, the customer provides their refund account info.
- For card payment cancellations, the card cancel reason is stored for admin reference.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_bank text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_account_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_account_holder text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_cancel_reason text;
