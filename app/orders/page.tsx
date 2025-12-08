/**
 * @file app/orders/page.tsx
 * @description 주문 목록 페이지
 *
 * 사용자의 주문 내역을 표시하는 페이지입니다.
 *
 * @see types/order.ts
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * 주문 목록 페이지
 */
export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = getServiceRoleClient();

  // 주문 목록 조회
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("clerk_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <p className="text-lg text-destructive">
            주문 내역을 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">주문 내역</h1>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">주문 내역이 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            상품을 주문해보세요.
          </p>
          <Link href="/products">
            <Button>
              상품 둘러보기
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders as Order[]).map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-6 border-2 border-purple-100 rounded-2xl bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-purple-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      주문 번호: {order.id.slice(0, 8)}...
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : order.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : order.status === "payment_failed"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}
                    >
                      {order.status === "pending"
                        ? "결제 대기 중"
                        : order.status === "paid"
                        ? "결제 완료"
                        : order.status === "payment_failed"
                        ? "결제 실패"
                        : order.status === "confirmed"
                        ? "확인됨"
                        : order.status === "shipped"
                        ? "배송 중"
                        : order.status === "delivered"
                        ? "배송 완료"
                        : "취소됨"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

