/**
 * @file components/PaymentWidget.tsx
 * @description Toss Payments 결제 위젯 컴포넌트
 *
 * Toss Payments SDK를 사용하여 결제를 처리하는 컴포넌트입니다.
 * 테스트 모드로만 동작하며, 실제 결제는 발생하지 않습니다.
 *
 * @see https://docs.toss.im/payment/guides/integration/client
 */

"use client";

import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@/types/payment";
import { Loader2, CreditCard, Building2, Smartphone } from "lucide-react";

interface PaymentWidgetProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  onSuccess: (paymentKey: string, orderId: string, amount: number) => void;
  onError: (error: Error) => void;
}

/**
 * 결제 위젯 컴포넌트
 */
export default function PaymentWidget({
  amount,
  orderId,
  orderName,
  customerName,
  onSuccess,
  onError,
}: PaymentWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [tossPayments, setTossPayments] = useState<any>(null);

  // Toss Payments SDK 초기화
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      onError(new Error("Toss Payments 클라이언트 키가 설정되지 않았습니다."));
      return;
    }

    loadTossPayments(clientKey)
      .then((sdk) => {
        setTossPayments(sdk);
      })
      .catch((error) => {
        console.error("Toss Payments SDK 로드 실패:", error);
        onError(new Error("결제 시스템을 초기화하는 중 오류가 발생했습니다."));
      });
  }, [onError]);

  /**
   * 결제 요청 실행
   */
  const handlePayment = async (method: PaymentMethod) => {
    if (!tossPayments) {
      onError(new Error("결제 시스템이 아직 준비되지 않았습니다. 페이지를 새로고침해주세요."));
      return;
    }

    setIsLoading(true);
    setSelectedMethod(method);

    try {
      const successUrl = `${window.location.origin}/api/payment/success?orderId=${orderId}`;
      const failUrl = `${window.location.origin}/api/payment/fail?orderId=${orderId}`;

      // 결제 요청
      await tossPayments.requestPayment(method, {
        amount,
        orderId,
        orderName,
        customerName,
        successUrl,
        failUrl,
      });
    } catch (error: any) {
      console.error("결제 요청 실패:", error);
      
      setIsLoading(false);
      setSelectedMethod(null);

      // 사용자가 결제를 취소한 경우는 에러로 처리하지 않음
      if (error.code === "USER_CANCEL" || error.code === "PAY_PROCESS_CANCELED") {
        return; // 조용히 처리
      }

      // 네트워크 에러
      if (error.code === "NETWORK_ERROR" || error.message?.includes("network")) {
        onError(new Error("네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요."));
        return;
      }

      // 기타 에러
      const errorMessage = error.message || error.code || "알 수 없는 오류";
      onError(
        new Error(`결제 요청 중 오류가 발생했습니다: ${errorMessage}`)
      );
    }
  };

  if (!tossPayments) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">결제 시스템을 준비하는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-8 border-2 border-purple-200 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 shadow-xl">
        <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">결제 수단 선택</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            type="button"
            variant={selectedMethod === "카드" ? "default" : "outline"}
            className="h-auto py-6 flex flex-col items-center gap-3 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105"
            onClick={() => handlePayment("카드")}
            disabled={isLoading}
          >
            <CreditCard className="w-8 h-8" />
            <span>카드 결제</span>
          </Button>

          <Button
            type="button"
            variant={selectedMethod === "계좌이체" ? "default" : "outline"}
            className="h-auto py-6 flex flex-col items-center gap-3 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105"
            onClick={() => handlePayment("계좌이체")}
            disabled={isLoading}
          >
            <Building2 className="w-8 h-8" />
            <span>계좌이체</span>
          </Button>

          <Button
            type="button"
            variant={selectedMethod === "가상계좌" ? "default" : "outline"}
            className="h-auto py-6 flex flex-col items-center gap-3 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105"
            onClick={() => handlePayment("가상계좌")}
            disabled={isLoading}
          >
            <Building2 className="w-8 h-8" />
            <span>가상계좌</span>
          </Button>

          <Button
            type="button"
            variant={selectedMethod === "휴대폰" ? "default" : "outline"}
            className="h-auto py-6 flex flex-col items-center gap-3 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105"
            onClick={() => handlePayment("휴대폰")}
            disabled={isLoading}
          >
            <Smartphone className="w-8 h-8" />
            <span>휴대폰 결제</span>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-purple-600" />
          <span className="font-semibold text-purple-700">결제를 진행하는 중...</span>
        </div>
      )}

      <div className="text-sm text-gray-700 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-lg space-y-3">
        <p className="font-extrabold text-lg text-orange-700">테스트 모드 안내</p>
        <p className="font-semibold">현재 테스트 모드로 운영 중입니다. 실제 결제는 발생하지 않습니다.</p>
        <div className="mt-3 space-y-2 bg-white/60 p-4 rounded-lg">
          <p className="font-bold text-purple-700">테스트 정보:</p>
          <ul className="list-disc list-inside space-y-1.5 text-sm font-medium">
            <li>카드 번호: <span className="font-mono text-purple-600">0000-0000-0000-0000</span></li>
            <li>유효기간: 아무 날짜 (예: 12/34)</li>
            <li>CVC: 아무 숫자 (예: 123)</li>
            <li>비밀번호: 아무 숫자</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
