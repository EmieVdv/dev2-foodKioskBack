export interface Category {
  category_id: number;
  name: string;
  description?: string;
}

export interface Product {
  product_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface Order {
  order_id?: number;
  customer_name: string;
  items: OrderItem[];
  total_price?: number;
  status?: string;
  created_at?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 