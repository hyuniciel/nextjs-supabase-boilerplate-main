/**
 * @file app/payment/fail/page.tsx
 * @description 결제 실패 페이지
 *
 * 결제가 실패했을 때 표시되는 페이지입니다.
 * 다시 시도하거나 주문 내역으로 돌아갈 수 있는 옵션을 제공합니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

interface PaymentFailPageProps {
  searchParams: Promise<{
    orderId?: string;
    code?: string;
    message?: string;
    error?: string;
  }>;
}

/**
 * 결제 실패 페이지
 */
export default async function PaymentFailPage({
  searchParams,
}: PaymentFailPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;
  const errorCode = params.code;
  const errorMessage = params.message || params.error;

  return (
    <main className="container mx-auto px-4 py-20 max-w-2xl bg-white min-h-screen">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 p-8 shadow-2xl">
            <XCircle className="w-24 h-24 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            결제에 실패했습니다
          </h1>
          <p className="text-gray-700 text-xl font-semibold">
            결제 처리 중 문제가 발생했습니다.
          </p>
        </div>

        {errorMessage && (
          <div className="w-full p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 text-red-700 rounded-xl shadow-lg">
            <p className="font-extrabold mb-2 text-lg">오류 메시지</p>
            <p className="font-semibold">{errorMessage}</p>
            {errorCode && (
              <p className="text-sm mt-3 text-red-600 font-mono bg-white/60 px-3 py-1 rounded-lg inline-block">
                오류 코드: {errorCode}
              </p>
            )}
          </div>
        )}

        {orderId && (
          <div className="w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg">
            <p className="text-sm font-bold text-gray-700 mb-2">주문 번호</p>
            <p className="font-mono font-extrabold text-xl text-purple-600">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full pt-4">
          {orderId && (
            <Link href={`/orders/${orderId}`} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-bold">
                주문 상세 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
          <Link href="/orders" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full font-bold">
              주문 내역 보기
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold">
              쇼핑 계속하기
              <RefreshCw className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="pt-6 text-base font-semibold text-gray-600 bg-purple-50 px-6 py-3 rounded-xl">
          <p>문제가 계속되면 고객센터로 문의해주세요.</p>
        </div>
      </div>
    </main>
  );
}
