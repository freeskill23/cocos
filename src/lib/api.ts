import { supabase } from "@/lib/supabase";
import type { OrderRow, PortfolioRow, ReviewRow, SettingsMap, ProductRow, SelectedOption } from "@/types/database";

export async function fetchActiveProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertProduct(item: Partial<ProductRow> & { name: string; base_price: number; base_width: number; base_depth: number; base_height: number }): Promise<void> {
  const { error } = await supabase.from("products").upsert({
    ...item,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function fetchProductById(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchVisiblePortfolio(): Promise<PortfolioRow[]> {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllPortfolio(): Promise<PortfolioRow[]> {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchVisibleReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSettings(): Promise<SettingsMap> {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;
  const map: SettingsMap = {};
  for (const row of data ?? []) {
    (map as Record<string, unknown>)[row.key] = row.value;
  }
  return map;
}

export async function upsertSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export interface OrderInsert {
  product_id: string | null;
  product_name: string | null;
  width: number;
  depth: number;
  height: number;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_postcode: string | null;
  customer_address: string;
  customer_detail_address: string | null;
  selected_options: SelectedOption[];
  memo: string | null;
}

export async function insertOrder(order: OrderInsert): Promise<void> {
  const { error } = await supabase.from("orders").insert(order);
  if (error) throw error;
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function updateOrderMemo(id: string, memo: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ memo, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function generatePaymentToken(id: string): Promise<string> {
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from("orders")
    .update({ payment_token: token, status: "payment_pending", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  return token;
}

export async function fetchOrderByToken(token: string): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("payment_token", token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function confirmPaymentByToken(token: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: "in_production", updated_at: new Date().toISOString() })
    .eq("payment_token", token);
  if (error) throw error;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertPortfolioItem(item: Partial<PortfolioRow> & { dog_name: string; breed: string; weight: string; size: string; note: string }): Promise<void> {
  const { error } = await supabase.from("portfolio_items").upsert(item);
  if (error) throw error;
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertReview(item: Partial<ReviewRow> & { dog_name: string; breed: string; weight: string; size: string; review: string; author: string }): Promise<void> {
  const { error } = await supabase.from("reviews").upsert(item);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
