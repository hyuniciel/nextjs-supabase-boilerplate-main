/**
 * @file types/order.ts
 * @description 주문 관련 TypeScript 타입 정의
 *
 * Supabase orders 및 order_items 테이블의 스키마를 기반으로 한 타입 정의입니다.
 *
 * @see supabase/migrations/db.sql
 */

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
  postalCode: string;
}

export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: "pending" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled" | "payment_failed";
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

