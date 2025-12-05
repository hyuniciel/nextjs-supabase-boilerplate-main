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
    <main className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
          <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">결제에 실패했습니다</h1>
          <p className="text-muted-foreground text-lg">
            결제 처리 중 문제가 발생했습니다.
          </p>
        </div>

        {errorMessage && (
          <div className="w-full p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="font-semibold mb-1">오류 메시지</p>
            <p className="text-sm">{errorMessage}</p>
            {errorCode && (
              <p className="text-xs mt-2 text-muted-foreground">
                오류 코드: {errorCode}
              </p>
            )}
          </div>
        )}

        {orderId && (
          <div className="w-full p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">주문 번호</p>
            <p className="font-mono font-semibold">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full pt-4">
          {orderId && (
            <Link href={`/orders/${orderId}`} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                주문 상세 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
          <Link href="/orders" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              주문 내역 보기
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              쇼핑 계속하기
              <RefreshCw className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="pt-4 text-sm text-muted-foreground">
          <p>문제가 계속되면 고객센터로 문의해주세요.</p>
        </div>
      </div>
    </main>
  );
}
