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
    <main className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">결제가 완료되었습니다</h1>
          <p className="text-muted-foreground text-lg">
            주문이 성공적으로 접수되었습니다.
          </p>
        </div>

        {orderId && (
          <div className="w-full space-y-4 pt-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">주문 번호</p>
              <p className="font-mono font-semibold">{orderId}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/orders/${orderId}`}>
                <Button size="lg">
                  주문 상세 보기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" size="lg">
                  주문 내역 보기
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!orderId && (
          <div className="w-full space-y-4 pt-4">
            <Link href="/orders">
              <Button size="lg">
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
