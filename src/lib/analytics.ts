import { supabase } from "@/lib/supabase";

const VISITOR_KEY = "cocos_analytics_visitor";
const SESSION_KEY = "cocos_analytics_session";
const LANDING_KEY = "cocos_analytics_landing";
const LAST_VISIT_KEY = "cocos_analytics_last_visit";

function getOrCreate(key: string): string {
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

function detectDevice(): { device_type: string; browser: string; os: string } {
  const ua = navigator.userAgent;
  const device_type = /Mobi|Android/i.test(ua) ? "mobile" : /Tablet|iPad/i.test(ua) ? "tablet" : "desktop";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Other";
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Other";
  return { device_type, browser, os };
}

function getPayload(eventType: "visit" | "conversion", extras: Record<string, unknown> = {}) {
  const url = new URL(window.location.href);
  const hashRoute = window.location.hash.replace(/^#/, "") || "/";
  const [hashPath, hashQuery = ""] = hashRoute.split("?");
  const params = new URLSearchParams(url.search);
  for (const [key, value] of new URLSearchParams(hashQuery).entries()) params.set(key, value);
  const queryParams = Object.fromEntries(params.entries());
  const landingPath = window.localStorage.getItem(LANDING_KEY) ?? hashPath;
  window.localStorage.setItem(LANDING_KEY, landingPath);
  const device = detectDevice();
  return {
    event_type: eventType,
    session_id: getOrCreate(SESSION_KEY),
    visitor_id: getOrCreate(VISITOR_KEY),
    referrer: document.referrer || null,
    landing_path: landingPath,
    page_path: hashPath || "/",
    query_params: queryParams,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    naver_keyword: params.get("n_keyword") ?? params.get("keyword"),
    naver_query: params.get("n_query"),
    naver_campaign: params.get("n_campaign"),
    naver_ad_group: params.get("n_ad_group"),
    naver_rank: params.get("n_rank"),    ...device,
    ...extras,
  };
}

export async function trackVisit(): Promise<void> {
  const visitMarker = `${window.location.pathname}:${Math.floor(Date.now() / 30000)}`;
  if (window.sessionStorage.getItem(LAST_VISIT_KEY) === visitMarker) return;
  window.sessionStorage.setItem(LAST_VISIT_KEY, visitMarker);
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload("visit")),
      keepalive: true,
    });
    if (!response.ok) console.warn("Analytics visit was not recorded");
  } catch {
    console.warn("Analytics visit was not recorded");
  }
}

export async function trackConversion(orderId: string, conversionValue: number): Promise<void> {
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload("conversion", { order_id: orderId, conversion_value: conversionValue })),
      keepalive: true,
    });
  } catch {
    console.warn("Analytics conversion was not recorded");
  }
}

export interface AnalyticsVisit {
  id: string;
  occurred_at: string;
  session_id: string;
  visitor_id: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  landing_path: string;
  page_path: string;
  query_params: Record<string, string>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  naver_keyword: string | null;
  naver_query: string | null;
  naver_campaign: string | null;
  naver_ad_group: string | null;
  naver_rank: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  event_type: "visit" | "conversion";
  order_id: string | null;
  conversion_value: number | null;
}

export async function fetchAnalyticsVisits(since: string, until: string): Promise<AnalyticsVisit[]> {
  const { data, error } = await supabase
    .from("analytics_visits")
    .select("*")
    .gte("occurred_at", since)
    .lt("occurred_at", until)
    .order("occurred_at", { ascending: false })
    .limit(10000);
  if (error) throw error;
  return (data ?? []) as AnalyticsVisit[];
}
