export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  license_plate?: string | null;
  subscription_status: 'active' | 'inactive';
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  image_url?: string | null;
}

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  items: OrderItem[];
  total_amount: string;
  status: 'pending' | 'arrived' | 'ready' | 'completed';
  created_at: string;
  ready_time?: string | null;
}

export interface Subscription {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  weekly_allowance: string;
  used_amount: string;
  default_items?: OrderItem[] | null;
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
  token: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
