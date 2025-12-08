/**
 * @file app/payment/success/page.tsx
 * @description 결제 성공 페이지
 *
 * 결제가 성공적으로 완료되었을 때 표시되는 페이지입니다.
 * 주문 상세 페이지로 이동할 수 있는 링크를 제공합니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

/**
 * 결제 성공 페이지
 */
export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  return (
    <main className="container mx-auto px-4 py-20 max-w-2xl bg-white min-h-screen">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 p-8 shadow-2xl">
            <CheckCircle2 className="w-24 h-24 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            결제가 완료되었습니다
          </h1>
          <p className="text-gray-700 text-xl font-semibold">
            주문이 성공적으로 접수되었습니다.
          </p>
        </div>

        {orderId && (
          <div className="w-full space-y-6 pt-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg">
              <p className="text-sm font-bold text-gray-700 mb-2">주문 번호</p>
              <p className="font-mono font-extrabold text-xl text-purple-600">{orderId}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/orders/${orderId}`}>
                <Button size="lg" className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold">
                  주문 상세 보기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" size="lg" className="font-bold">
                  주문 내역 보기
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!orderId && (
          <div className="w-full space-y-4 pt-4">
            <Link href="/orders">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold">
                주문 내역 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
