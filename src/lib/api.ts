import { supabase } from "@/lib/supabase";
import type { OrderRow, PortfolioRow, ReviewRow, SettingsMap } from "@/types/database";

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
  dog_name: string | null;
  breed: string | null;
  weight: string | null;
  body_length: string | null;
  memo: string | null;
  width: number;
  depth: number;
  height: number;
  design_id: string;
  door_position: string;
  door_size_mode: string;
  door_custom_width: number;
  door_custom_height: number;
  engraving: string;
  engraving_text: string;
  floor_type: string;
  cushion: string;
  top_type: string;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_detail_address: string | null;
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
