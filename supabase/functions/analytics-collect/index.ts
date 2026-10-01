import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const text = (value: unknown, max = 500): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

const getClientIp = (req: Request): string | null => {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const eventType = body.event_type === "conversion" ? "conversion" : "visit";
    const queryParams = body.query_params && typeof body.query_params === "object" ? body.query_params : {};
    const { error } = await supabase.from("analytics_visits").insert({
      session_id: text(body.session_id, 120) ?? crypto.randomUUID(),
      visitor_id: text(body.visitor_id, 120) ?? crypto.randomUUID(),
      ip_address: getClientIp(req),
      user_agent: text(req.headers.get("user-agent"), 1000),
      referrer: text(body.referrer, 1000),
      landing_path: text(body.landing_path, 500) ?? "/",
      page_path: text(body.page_path, 500) ?? "/",
      query_params: queryParams,
      utm_source: text(body.utm_source, 200),
      utm_medium: text(body.utm_medium, 200),
      utm_campaign: text(body.utm_campaign, 300),
      utm_term: text(body.utm_term, 300),
      utm_content: text(body.utm_content, 300),
      naver_keyword: text(body.naver_keyword, 300),
      naver_query: text(body.naver_query, 300),
      naver_campaign: text(body.naver_campaign, 300),
      naver_ad_group: text(body.naver_ad_group, 300),
      naver_rank: text(body.naver_rank, 100),
      device_type: text(body.device_type, 50),
      browser: text(body.browser, 100),
      os: text(body.os, 100),
      event_type: eventType,
      order_id: eventType === "conversion" ? text(body.order_id, 100) : null,
      conversion_value: eventType === "conversion" && Number.isFinite(Number(body.conversion_value)) ? Number(body.conversion_value) : null,
    });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Analytics event could not be recorded" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
