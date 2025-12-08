/**
 * @file app/checkout/page.tsx
 * @description 주문 페이지 (체크아웃)
 *
 * 배송지 정보를 입력하고 주문을 생성하는 페이지입니다.
 *
 * @see actions/order.ts
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import CheckoutForm from "./checkout-form";
import { formatPrice } from "@/lib/utils/products";

export const dynamic = "force-dynamic";

/**
 * 주문 페이지
 */
export default async function CheckoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = getServiceRoleClient();

  // 장바구니 항목 조회
  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      product:products (
        id,
        name,
        price,
        stock_quantity,
        is_active
      )
    `
    )
    .eq("clerk_id", userId);

  if (error || !cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  // 총액 계산
  const totalAmount = cartItems.reduce((sum, item) => {
    const product = item.product as any;
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">주문하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 폼 */}
        <div className="lg:col-span-2">
          <CheckoutForm totalAmount={totalAmount} />
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="p-6 border-2 border-purple-200 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 shadow-xl sticky top-4">
            <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">주문 요약</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => {
                const product = item.product as any;
                return (
                  <div key={item.id} className="flex justify-between text-sm bg-white/60 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700">
                      {product?.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-purple-600">{formatPrice((product?.price || 0) * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t-2 border-purple-200 pt-6 flex justify-between items-center bg-white/60 p-4 rounded-xl">
              <span className="text-xl font-bold text-gray-700">총 주문 금액</span>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

