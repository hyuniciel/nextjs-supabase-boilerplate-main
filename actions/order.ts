/**
 * @file actions/order.ts
 * @description 주문 관련 Server Actions
 *
 * 주문 생성 및 검증 등의 Server Actions를 제공합니다.
 *
 * @see types/order.ts
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { ShippingAddress } from "@/types/order";

/**
 * 주문 생성
 */
export async function createOrder(
  shippingAddress: ShippingAddress,
  orderNote?: string
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "인증이 필요합니다." };
  }

  try {
    const supabase = getServiceRoleClient();

    // 장바구니 항목 조회
    const { data: cartItems, error: cartError } = await supabase
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

    if (cartError || !cartItems || cartItems.length === 0) {
      return { error: "장바구니가 비어있습니다." };
    }

    // 상품 정보 검증 및 총액 계산
    let totalAmount = 0;
    const orderItems: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of cartItems) {
      const product = item.product as any;

      if (!product || !product.is_active) {
        return { error: `판매 중지된 상품이 있습니다: ${product?.name || "알 수 없음"}` };
      }

      if (item.quantity > product.stock_quantity) {
        return {
          error: `재고가 부족한 상품이 있습니다: ${product.name} (재고: ${product.stock_quantity}개, 요청: ${item.quantity}개)`,
        };
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 주문 생성 (트랜잭션)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: userId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress,
        order_note: orderNote || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Create order error:", orderError);
      return { error: "주문 생성에 실패했습니다." };
    }

    // 주문 상세 항목 생성
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        }))
      );

    if (itemsError) {
      console.error("Create order items error:", itemsError);
      // 주문 삭제 (롤백)
      await supabase.from("orders").delete().eq("id", order.id);
      return { error: "주문 상세 항목 생성에 실패했습니다." };
    }

    // 장바구니 비우기
    await supabase.from("cart_items").delete().eq("clerk_id", userId);

    revalidatePath("/cart");
    revalidatePath("/orders");

    // 주문 ID 반환 (결제 페이지로 이동)
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Create order error:", error);
    return { error: "주문 생성 중 오류가 발생했습니다." };
  }
}

