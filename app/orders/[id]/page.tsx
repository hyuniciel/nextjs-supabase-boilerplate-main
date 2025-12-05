/**
 * @file app/orders/[id]/page.tsx
 * @description 주문 상세 페이지
 *
 * 주문 완료 후 표시되는 주문 상세 정보 페이지입니다.
 *
 * @see types/order.ts
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { OrderWithItems } from "@/types/order";
import { formatPrice } from "@/lib/utils/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 주문 상세 페이지
 */
export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const supabase = getServiceRoleClient();

  // 주문 조회
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("clerk_id", userId)
    .single();

  if (orderError || !order) {
    notFound();
  }

  // 주문 상세 항목 조회
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Error fetching order items:", itemsError);
  }

  const orderWithItems: OrderWithItems = {
    ...order,
    order_items: orderItems || [],
  };

  const shippingAddress = orderWithItems.shipping_address as any;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 뒤로가기 버튼 */}
      <Link href="/orders">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          주문 목록으로
        </Button>
      </Link>

      {/* 주문 완료 메시지 */}
      <div className="flex flex-col items-center text-center mb-8 p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
        <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">주문이 완료되었습니다!</h1>
        <p className="text-muted-foreground">
          주문 번호: {orderWithItems.id}
        </p>
      </div>

      {/* 주문 정보 */}
      <div className="space-y-6">
        {/* 주문 상태 */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">주문 상태</h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                orderWithItems.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : orderWithItems.status === "paid"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : orderWithItems.status === "payment_failed"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  : orderWithItems.status === "confirmed"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  : orderWithItems.status === "shipped"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                  : orderWithItems.status === "delivered"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }`}
            >
              {orderWithItems.status === "pending"
                ? "결제 대기 중"
                : orderWithItems.status === "paid"
                ? "결제 완료"
                : orderWithItems.status === "payment_failed"
                ? "결제 실패"
                : orderWithItems.status === "confirmed"
                ? "확인됨"
                : orderWithItems.status === "shipped"
                ? "배송 중"
                : orderWithItems.status === "delivered"
                ? "배송 완료"
                : "취소됨"}
            </span>
          </div>
        </div>

        {/* 배송지 정보 */}
        {shippingAddress && (
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">배송지 정보</h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">받는 분:</span> {shippingAddress.name}
              </p>
              <p>
                <span className="font-medium">전화번호:</span> {shippingAddress.phone}
              </p>
              <p>
                <span className="font-medium">주소:</span> ({shippingAddress.postalCode}){" "}
                {shippingAddress.address}
                {shippingAddress.addressDetail && ` ${shippingAddress.addressDetail}`}
              </p>
            </div>
          </div>
        )}

        {/* 주문 메모 */}
        {orderWithItems.order_note && (
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">주문 메모</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {orderWithItems.order_note}
            </p>
          </div>
        )}

        {/* 주문 상세 항목 */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">주문 상세</h2>
          <div className="space-y-4">
            {orderWithItems.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start pb-4 border-b last:border-0"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    수량: {item.quantity}개
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">총 주문 금액</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(orderWithItems.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* 주문 일시 */}
        <div className="p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">
            주문 일시: {new Date(orderWithItems.created_at).toLocaleString("ko-KR")}
          </p>
        </div>
      </div>
    </main>
  );
}

