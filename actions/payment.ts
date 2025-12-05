/**
 * @file actions/payment.ts
 * @description 결제 관련 Server Actions
 *
 * 결제 완료 후 주문 상태를 업데이트하는 Server Actions를 제공합니다.
 *
 * @see types/payment.ts
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 결제 완료 후 주문 상태 업데이트
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentKey: string,
  amount: number
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "인증이 필요합니다." };
  }

  try {
    const supabase = getServiceRoleClient();

    // 주문 조회 및 소유자 확인
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, clerk_id, total_amount, status")
      .eq("id", orderId)
      .eq("clerk_id", userId)
      .single();

    if (orderError || !order) {
      return { error: "주문을 찾을 수 없습니다." };
    }

    // 이미 결제 완료된 주문인지 확인
    if (order.status === "paid") {
      return { error: "이미 결제가 완료된 주문입니다." };
    }

    // 금액 일치 확인
    if (Number(order.total_amount) !== amount) {
      return { error: "결제 금액이 주문 금액과 일치하지 않습니다." };
    }

    // 주문 상태를 'paid'로 업데이트
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Update order status error:", updateError);
      return { error: "주문 상태 업데이트에 실패했습니다." };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    // 성공 반환 (리다이렉트는 호출하는 쪽에서 처리)
    return { success: true };
  } catch (error) {
    console.error("Update order payment status error:", error);
    return { error: "결제 상태 업데이트 중 오류가 발생했습니다." };
  }
}

/**
 * 결제 실패 시 주문 상태 업데이트
 */
export async function updateOrderPaymentFailed(orderId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "인증이 필요합니다." };
  }

  try {
    const supabase = getServiceRoleClient();

    // 주문 조회 및 소유자 확인
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, clerk_id, status")
      .eq("id", orderId)
      .eq("clerk_id", userId)
      .single();

    if (orderError || !order) {
      return { error: "주문을 찾을 수 없습니다." };
    }

    // 주문 상태를 'payment_failed'로 업데이트
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "payment_failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Update order status error:", updateError);
      return { error: "주문 상태 업데이트에 실패했습니다." };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Update order payment failed error:", error);
    return { error: "주문 상태 업데이트 중 오류가 발생했습니다." };
  }
}
