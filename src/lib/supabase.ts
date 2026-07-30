import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Supabase env vars are missing. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  warm_filter: boolean;
  stock: number;
  is_active: boolean;
  sort_order: number;
};

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'gcash' | 'qrph';

export type Order = {
  id: string;
  code: string;
  customer_name: string;
  customer_contact: string;
  pickup_slot: string;
  payment_method: PaymentMethod;
  total: number;
  status: OrderStatus;
  note: string;
  created_at: string;
  updated_at: string;
  // NEW fields
  paid: boolean;
  payment_proof: string | null; // URL to uploaded image
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
};

export type OrderWithItems = Order & { items: OrderItem[] };

export type Review = {
  id: string;
  order_id: string;
  rating: number;
  body: string;
  author: string;
  admin_reply: string | null;
  created_at: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export const PICKUP_SLOTS = ['1:30 PM – 2:00 PM', '2:30 PM – 3:00 PM'];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash on Pickup',
  gcash: 'GCash',
  qrph: 'QR Ph',
};

export function formatPeso(n: number): string {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}