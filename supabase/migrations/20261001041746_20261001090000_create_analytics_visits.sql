/*
# Create campaign and visit analytics

1. New Tables
- `analytics_visits`: one server-recorded page visit or conversion event.
- `id`: unique event identifier.
- `occurred_at`: event time.
- `session_id`: browser session identifier.
- `visitor_id`: persistent anonymous browser identifier.
- `ip_address`: visitor network address captured by the server for repeat-visit analysis.
- `user_agent`: original browser signature for device and browser analysis.
- `referrer`: referring page when available.
- `landing_path`: first page in the session.
- `page_path`: page where the event occurred.
- `query_params`: complete campaign query parameters as JSON.
- `utm_*`: standard campaign dimensions.
- `naver_*`: Naver PowerLink dimensions.
- `device_type`, `browser`, `os`: normalized client dimensions.
- `event_type`: `visit` or `conversion`.
- `order_id`, `conversion_value`: optional purchase attribution fields.

2. Performance
- Index time, IP, session, campaign, keyword, and event type for reporting filters.

3. Security
- Enable row-level security.
- Authenticated users can read analytics for the existing signed-in administrator area.
- Public clients have no direct table access; the collection Edge Function writes with the service role.
- Service-role policies are explicit for server operations.

4. Important Notes
- IP addresses are personal data and are retained for analytics purposes only.
- The browser sends campaign and device context, while the server records the connecting IP.
- No customer name, phone number, email, or order details are stored in this table.
*/

CREATE TABLE IF NOT EXISTS public.analytics_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  ip_address inet,
  user_agent text,
  referrer text,
  landing_path text NOT NULL DEFAULT '/',
  page_path text NOT NULL DEFAULT '/',
  query_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  naver_keyword text,
  naver_query text,
  naver_campaign text,
  naver_ad_group text,
  naver_rank text,
  device_type text,
  browser text,
  os text,
  event_type text NOT NULL DEFAULT 'visit' CHECK (event_type IN ('visit', 'conversion')),
  order_id uuid,
  conversion_value numeric(12, 2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_visits_occurred_at_idx ON public.analytics_visits (occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_visits_ip_address_idx ON public.analytics_visits (ip_address);
CREATE INDEX IF NOT EXISTS analytics_visits_session_id_idx ON public.analytics_visits (session_id);
CREATE INDEX IF NOT EXISTS analytics_visits_visitor_id_idx ON public.analytics_visits (visitor_id);
CREATE INDEX IF NOT EXISTS analytics_visits_campaign_idx ON public.analytics_visits (utm_campaign);
CREATE INDEX IF NOT EXISTS analytics_visits_keyword_idx ON public.analytics_visits (naver_keyword, utm_term);
CREATE INDEX IF NOT EXISTS analytics_visits_event_type_idx ON public.analytics_visits (event_type);

ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_admin_read" ON public.analytics_visits;
CREATE POLICY "analytics_admin_read" ON public.analytics_visits
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "analytics_service_insert" ON public.analytics_visits;
CREATE POLICY "analytics_service_insert" ON public.analytics_visits
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_service_update" ON public.analytics_visits;
CREATE POLICY "analytics_service_update" ON public.analytics_visits
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_service_delete" ON public.analytics_visits;
CREATE POLICY "analytics_service_delete" ON public.analytics_visits
  FOR DELETE TO service_role USING (true);

REVOKE ALL ON public.analytics_visits FROM anon;
GRANT SELECT ON public.analytics_visits TO authenticated;
