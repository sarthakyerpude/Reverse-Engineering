export interface ProductVariant {
  id: string;
  title?: string;
  price?: number;
  sku?: string;
  inventory?: number;
}

export interface ProductSpecs {
  material?: string;
  sizes?: string[];
  wash_care?: string;
  fit?: string;
  pockets?: string;
  custom_sizing?: boolean;
  weight_capacity?: string;
  dimensions?: string;
  hardware?: string;
  safety?: string;
  warranty?: string;
  flower_size?: string;
  stem_count?: string;
  lights?: string;
}

export interface Product {
  id: string;
  variantId?: string;
  name: string;
  title?: string;
  handle: string;
  collection_id: string;
  collection_name?: string;
  category: string;
  price: number;
  compare_at_price: number;
  badge?: string | null;
  featured?: boolean;
  rating: number;
  review_count?: number;
  reviews_count?: number;
  inventory?: number;
  images?: string[];
  image?: string;
  localImage?: string;
  display_image?: string;
  short_description?: string;
  description: string;
  specs?: ProductSpecs;
  variants?: ProductVariant[];
  tags?: string[];
}

export interface Collection {
  id: string;
  name: string;
  handle: string;
  description: string;
  image: string;
  banner?: string;
  featured?: boolean;
  product_count: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  selected_size?: string;
  custom_measurements?: string;
  product_name: string;
  product_handle: string;
  product_category: string;
  variant_title?: string;
  unit_price: number;
  line_total: number;
  image?: string;
}

export interface CartSummary {
  items: CartItem[];
  item_count: number;
  subtotal: number;
  shipping_fee: number;
  free_shipping_threshold: number;
  is_free_shipping: boolean;
  free_shipping_remaining: number;
  free_shipping_progress: number;
  total: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default?: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_handle: string;
  product_category: string;
  variant_id: string;
  variant_title?: string;
  selected_size?: string;
  custom_measurements?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image?: string;
}

export interface OrderMilestone {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  timestamp: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  email: string;
  phone: string;
  status: 'confirmed' | 'artisan_handcrafting' | 'quality_inspection' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: Address;
  items: OrderItem[];
  notes?: string;
  tracking_code: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  headline?: string;
  review_text: string;
  verified_purchase: number;
  created_at: string;
}
