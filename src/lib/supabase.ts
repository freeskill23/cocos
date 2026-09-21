import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type OrderStatus = "received" | "in_review" | "in_production" | "shipped" | "completed" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "접수 완료",
  in_review: "검토 중",
  in_production: "제작 중",
  shipped: "배송 중",
  completed: "완료",
  cancelled: "취소",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  received: "bg-birch-200 text-charcoal",
  in_review: "bg-amber-100 text-amber-700",
  in_production: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
