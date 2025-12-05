/**
 * @file app/api/payment/fail/route.ts
 * @description 결제 실패 콜백 처리
 *
 * Toss Payments에서 결제 실패 후 리다이렉트되는 콜백을 처리합니다.
 * 주문 상태를 업데이트하고 실패 페이지로 리다이렉트합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import { updateOrderPaymentFailed } from "@/actions/payment";

export const dynamic = "force-dynamic";

/**
 * 결제 실패 콜백 처리
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  if (!orderId) {
    return NextResponse.redirect(new URL("/payment/fail?error=missing_order_id", request.url));
  }

  try {
    // 주문 상태를 'payment_failed'로 업데이트
    await updateOrderPaymentFailed(orderId);

    // 실패 페이지로 리다이렉트
    const failUrl = new URL("/payment/fail", request.url);
    failUrl.searchParams.set("orderId", orderId);
    if (errorCode) failUrl.searchParams.set("code", errorCode);
    if (errorMessage) failUrl.searchParams.set("message", errorMessage);

    return NextResponse.redirect(failUrl);
  } catch (error) {
    console.error("Payment fail callback error:", error);
    return NextResponse.redirect(
      new URL(`/payment/fail?error=server_error&orderId=${orderId}`, request.url)
    );
  }
}
