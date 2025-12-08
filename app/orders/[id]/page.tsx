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
    <main className="container mx-auto px-4 py-8 max-w-4xl bg-white min-h-screen">
      {/* 뒤로가기 버튼 */}
      <Link href="/orders">
        <Button variant="ghost" className="mb-6 hover:bg-purple-50">
          <ArrowLeft className="mr-2 w-4 h-4" />
          주문 목록으로
        </Button>
      </Link>

      {/* 주문 완료 메시지 */}
      <div className="flex flex-col items-center text-center mb-10 p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200 shadow-xl">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <CheckCircle2 className="relative w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          주문이 완료되었습니다!
        </h1>
        <p className="text-gray-700 font-semibold">
          주문 번호: <span className="font-mono text-purple-600">{orderWithItems.id}</span>
        </p>
      </div>

      {/* 주문 정보 */}
      <div className="space-y-6">
        {/* 주문 상태 */}
        <div className="p-6 border-2 border-purple-100 rounded-2xl bg-white shadow-lg">
          <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">주문 상태</h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                orderWithItems.status === "pending"
                  ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-white"
                  : orderWithItems.status === "paid"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : orderWithItems.status === "payment_failed"
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                  : orderWithItems.status === "confirmed"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : orderWithItems.status === "shipped"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : orderWithItems.status === "delivered"
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                  : "bg-gradient-to-r from-gray-400 to-slate-400 text-white"
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
          <div className="p-6 border-2 border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
            <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">배송지 정보</h2>
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
          <div className="p-6 border-2 border-purple-100 rounded-2xl bg-white shadow-lg">
            <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">주문 메모</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {orderWithItems.order_note}
            </p>
          </div>
        )}

        {/* 주문 상세 항목 */}
        <div className="p-6 border-2 border-purple-100 rounded-2xl bg-white shadow-lg">
          <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">주문 상세</h2>
          <div className="space-y-4">
            {orderWithItems.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start pb-4 mb-4 border-b-2 border-purple-100 last:border-0 last:pb-0 last:mb-0 bg-purple-50/30 p-4 rounded-xl"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{item.product_name}</h3>
                  <p className="text-sm font-semibold text-purple-600 mt-1">
                    수량: {item.quantity}개
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm font-semibold text-gray-600 mt-1">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-6 border-t-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
              <span className="text-xl font-bold text-gray-700">총 주문 금액</span>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatPrice(orderWithItems.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* 주문 일시 */}
        <div className="p-6 border-2 border-purple-100 rounded-2xl bg-white shadow-lg">
          <p className="text-sm font-semibold text-gray-600">
            주문 일시: <span className="text-purple-600">{new Date(orderWithItems.created_at).toLocaleString("ko-KR")}</span>
          </p>
        </div>
      </div>
    </main>
  );
}

