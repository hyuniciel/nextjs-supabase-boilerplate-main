/**
 * @file types/payment.ts
 * @description 결제 관련 TypeScript 타입 정의
 *
 * Toss Payments와 관련된 타입 정의입니다.
 */

/**
 * 결제 수단
 */
export type PaymentMethod = "카드" | "계좌이체" | "가상계좌" | "휴대폰";

/**
 * 결제 상태
 */
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

/**
 * 결제 정보
 */
export interface PaymentInfo {
  paymentKey: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
}

/**
 * 결제 요청 파라미터
 */
export interface PaymentRequestParams {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
}

/**
 * 결제 성공 응답
 */
export interface PaymentSuccessResponse {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 결제 실패 응답
 */
export interface PaymentFailResponse {
  code: string;
  message: string;
  orderId: string;
}
