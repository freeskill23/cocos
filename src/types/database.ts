export interface OrderRow {
  id: string;
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

export interface SettingsMap {
  pricing?: {
    baseFee: number;
    areaRatePerSqmm: number;
    sizeScaleRate: number;
    packagingFee: number;
    shippingFee: number;
    freeShippingThreshold: number;
  };
  sizes?: {
    minWidth: number;
    maxWidth: number;
    minDepth: number;
    maxDepth: number;
    minHeight: number;
    maxHeight: number;
  };
}
