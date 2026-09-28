export interface ProductRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  base_width: number;
  base_depth: number;
  base_height: number;
  base_price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  product_id: string | null;
  product_name: string | null;
  width: number;
  depth: number;
  height: number;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_detail_address: string | null;
  memo: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioRow {
  id: string;
  dog_name: string;
  breed: string;
  weight: string;
  size: string;
  note: string;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  dog_name: string;
  breed: string;
  weight: string;
  size: string;
  review: string;
  author: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface PricingSettings {
  baseFee: number;
  areaRatePerSqmm: number;
  sizeScaleRate: number;
  packagingFee: number;
  shippingFee: number;
  freeShippingThreshold: number;
  perCmWidth: number;
  perCmDepth: number;
  perCmHeight: number;
}

export interface SizeSettings {
  minWidth: number;
  maxWidth: number;
  minDepth: number;
  maxDepth: number;
  minHeight: number;
  maxHeight: number;
}

export interface SettingsMap {
  pricing?: PricingSettings;
  sizes?: SizeSettings;
}
