/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니 항목을 표시하고, 수량 변경 및 삭제가 가능한 페이지입니다.
 *
 * @see actions/cart.ts
 * @see components/CartItem.tsx
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { CartItemWithProduct } from "@/types/cart";
import CartItemList from "./cart-item-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils/products";

export const dynamic = "force-dynamic";

/**
 * 장바구니 페이지
 */
export default async function CartPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = getServiceRoleClient();

  // 장바구니 항목 조회 (상품 정보 포함)
  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      clerk_id,
      product_id,
      quantity,
      created_at,
      updated_at,
      product:products!inner (
        id,
        name,
        description,
        price,
        category,
        stock_quantity,
        is_active
      )
    `
    )
    .eq("clerk_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart items:", error);
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <p className="text-lg text-destructive">
            장바구니를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </main>
    );
  }

  // 타입 변환
  const items: CartItemWithProduct[] = (cartItems || []).map((item: any) => ({
    id: item.id,
    clerk_id: item.clerk_id,
    product_id: item.product_id,
    quantity: item.quantity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: Array.isArray(item.product) ? item.product[0] : item.product,
  }));

  // 총액 계산
  const totalAmount = items.reduce((sum, item) => {
    const product = item.product as any;
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">장바구니</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">장바구니가 비어있습니다</h2>
          <p className="text-muted-foreground mb-6">
            상품을 장바구니에 추가해보세요.
          </p>
          <Link href="/products">
            <Button>
              상품 둘러보기
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <CartItemList items={items} />

          {/* 총액 및 결제 버튼 */}
          <div className="mt-8 p-6 border rounded-lg bg-card">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">총 주문 금액</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                주문하기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

