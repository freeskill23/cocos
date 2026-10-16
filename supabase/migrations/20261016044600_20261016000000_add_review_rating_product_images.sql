/*
# Add rating, product link, order link, and images to reviews table

## What changes
1. New columns on `reviews`:
   - `rating` (integer, default 5) — 1~5 star rating, default 5
   - `product_id` (uuid, nullable) — links review to a product
   - `order_id` (uuid, nullable) — links review to the order that submitted it
   - `image_urls` (text[], nullable) — array of Supabase storage public URLs (max 5 photos)
2. Storage bucket:
   - `review-images` bucket (public) for customer review photos
3. Security:
   - Reviews table is single-tenant (no auth required) — anon+authenticated can read, insert, update, delete
   - Storage bucket policies: public read, anon+authenticated upload
   - Existing reviews keep working (new columns are nullable or have defaults)
*/

-- Add new columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating integer NOT NULL DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_urls text[];

-- Add check constraint for rating range
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_check') THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for review-images bucket
DROP POLICY IF EXISTS "review_images_public_read" ON storage.objects;
CREATE POLICY "review_images_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "review_images_anon_upload" ON storage.objects;
CREATE POLICY "review_images_anon_upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'review-images');

DROP POLICY IF EXISTS "review_images_anon_delete" ON storage.objects;
CREATE POLICY "review_images_anon_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'review-images');
