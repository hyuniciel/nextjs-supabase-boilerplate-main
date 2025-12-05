/**
 * @file app/api/payment/success/route.ts
 * @description 결제 성공 콜백 처리
 *
 * Toss Payments에서 결제 성공 후 리다이렉트되는 콜백을 처리합니다.
 * 결제 정보를 검증하고 주문 상태를 업데이트합니다.
 *
 * @see https://docs.toss.im/payment/guides/integration/server
 */

import { NextRequest, NextResponse } from "next/server";
import { updateOrderPaymentStatus } from "@/actions/payment";

export const dynamic = "force-dynamic";

/**
 * 결제 성공 콜백 처리
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  // 필수 파라미터 검증
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(`/payment/fail?error=missing_params&orderId=${orderId || ""}`, request.url)
    );
  }

  try {
    const amountNumber = parseInt(amount, 10);

    if (isNaN(amountNumber)) {
      return NextResponse.redirect(
        new URL(`/payment/fail?error=invalid_amount&orderId=${orderId}`, request.url)
      );
    }

    // 주문 상태 업데이트 (서버 사이드 검증 포함)
    const result = await updateOrderPaymentStatus(orderId, paymentKey, amountNumber);

    if (result?.error) {
      return NextResponse.redirect(
        new URL(`/payment/fail?error=${encodeURIComponent(result.error)}&orderId=${orderId}`, request.url)
      );
    }

    // 성공 시 주문 상세 페이지로 리다이렉트 (updateOrderPaymentStatus에서 처리됨)
    // 여기서는 에러가 없으면 성공으로 간주
    return NextResponse.redirect(new URL(`/orders/${orderId}`, request.url));
  } catch (error) {
    console.error("Payment success callback error:", error);
    return NextResponse.redirect(
      new URL(`/payment/fail?error=server_error&orderId=${orderId}`, request.url)
    );
  }
}
