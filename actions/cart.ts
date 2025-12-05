/**
 * @file actions/cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 장바구니 추가, 삭제, 수량 변경 등의 Server Actions를 제공합니다.
 *
 * @see types/cart.ts
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 장바구니에 상품 추가
 */
export async function addToCart(productId: string, quantity: number = 1) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "인증이 필요합니다." };
  }

  if (quantity <= 0) {
    return { error: "수량은 1개 이상이어야 합니다." };
  }

  try {
    const supabase = getServiceRoleClient();

    // 상품 존재 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock_quantity, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return { error: "상품을 찾을 수 없습니다." };
    }

    if (!product.is_active) {
      return { error: "판매 중지된 상품입니다." };
    }

    // 기존 장바구니 항목 확인
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock_quantity) {
      return {
        error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 장바구니에 추가 또는 업데이트
    const { error } = await supabase.from("cart_items").upsert(
      {
        clerk_id: userId,
        product_id: productId,
        quantity: newQuantity,
      },
      {
        onConflict: "clerk_id,product_id",
      }
    );

    if (error) {
      console.error("Add to cart error:", error);
      return { error: "장바구니 추가에 실패했습니다." };
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { error: "장바구니 추가 중 오류가 발생했습니다." };
  }
}

/**
 * 장바구니에서 상품 삭제
 */
export async function removeFromCart(cartItemId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "인증이 필요합니다." };
  }

  try {
    const supabase = getServiceRoleClient();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (error) {
      console.error("Remove from cart error:", error);
      return { error: "장바구니에서 삭제에 실패했습니다." };
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { error: "장바구니 삭제 중 오류가 발생했습니다." };
  }
}

/**
 * 장바구니 상품 수량 변경
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "인증이 필요합니다." };
  }

  if (quantity <= 0) {
    return { error: "수량은 1개 이상이어야 합니다." };
  }

  try {
    const supabase = getServiceRoleClient();

    // 장바구니 항목 및 상품 정보 조회
    const { data: cartItem, error: cartError } = await supabase
      .from("cart_items")
      .select("product_id")
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .single();

    if (cartError || !cartItem) {
      return { error: "장바구니 항목을 찾을 수 없습니다." };
    }

    // 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", cartItem.product_id)
      .single();

    if (productError || !product) {
      return { error: "상품을 찾을 수 없습니다." };
    }

    if (quantity > product.stock_quantity) {
      return {
        error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 수량 업데이트
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (error) {
      console.error("Update cart quantity error:", error);
      return { error: "수량 변경에 실패했습니다." };
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return { error: "수량 변경 중 오류가 발생했습니다." };
  }
}

