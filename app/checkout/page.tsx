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
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">주문하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 폼 */}
        <div className="lg:col-span-2">
          <CheckoutForm totalAmount={totalAmount} />
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-card sticky top-4">
            <h2 className="text-xl font-semibold mb-4">주문 요약</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => {
                const product = item.product as any;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {product?.name} × {item.quantity}
                    </span>
                    <span>{formatPrice((product?.price || 0) * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-semibold">총 주문 금액</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

