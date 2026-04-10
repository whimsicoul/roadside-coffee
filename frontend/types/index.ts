export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  license_plate?: string | null;
  subscription_status: 'active' | 'inactive';
  role: 'customer' | 'admin';
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  image_url?: string | null;
  category?: 'hot' | 'cold' | 'food' | null;
}

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number | null;
  items: OrderItem[];
  total_amount: string;
  status: 'pending' | 'arrived' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  ready_time?: string | null;
  guest_first_name?: string | null;
  guest_last_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  guest_license_plate?: string | null;
  stripe_payment_intent_id?: string | null;
  subscription_id?: number | null;
}

export interface Subscription {
  id: number;
  user_id: number;
  tier: 'drink' | 'combo';
  pickup_time: string;
  start_date: string;
  end_date: string;
  weekly_allowance: string;
  used_amount: string;
  default_items?: OrderItem[] | null;
}

export interface ProjectedOrder {
  date: string;
  items: Array<{ menu_item_id: number; name: string; price: string; quantity: number }>;
  total_amount: number;
  pickup_time: string;
  subscription_id: number;
}

export interface AdminSubscription {
  id: number;
  user_id: number;
  tier: 'drink' | 'combo';
  pickup_time: string;
  start_date: string;
  end_date: string;
  weekly_allowance: string;
  used_amount: string;
  default_items?: OrderItem[] | null;
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
  upcoming: ProjectedOrder[];
}

export interface AdminSubscriptionsResponse {
  subscriptions: AdminSubscription[];
  total: number;
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'role'>;
  token: string;
}

export interface AdminOrder extends Order {
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'> | null;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  dailyTotal: number;
  pendingCount: number;
  readyCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface CreateMenuItemPayload {
  name: string;
  price: number;
  description?: string;
  category?: 'hot' | 'cold' | 'food';
}

export interface UpdateMenuItemPayload {
  name?: string;
  price?: number;
  description?: string;
  category?: 'hot' | 'cold' | 'food';
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface GuestInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_plate: string;
}

export interface GuestOrderPayload extends GuestInfo {
  items: OrderItem[];
  total_amount: number;
  ready_time?: string;
  stripe_payment_intent_id: string;
}

export interface GuestOrderResponse {
  order: Order;
  guestToken: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}
