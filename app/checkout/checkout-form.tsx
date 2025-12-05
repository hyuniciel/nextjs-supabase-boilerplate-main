/**
 * @file app/checkout/checkout-form.tsx
 * @description 주문 폼 컴포넌트
 *
 * 배송지 정보를 입력받고 주문을 생성한 후 결제 위젯을 표시하는 컴포넌트입니다.
 *
 * @see actions/order.ts
 * @see components/PaymentWidget.tsx
 */

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PaymentWidget from "@/components/PaymentWidget";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const checkoutSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요"),
  postalCode: z.string().min(1, "우편번호를 입력해주세요"),
  address: z.string().min(1, "주소를 입력해주세요"),
  addressDetail: z.string().optional(),
  orderNote: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  totalAmount: number;
}

/**
 * 주문 폼 컴포넌트
 */
export default function CheckoutForm({ totalAmount }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      postalCode: "",
      address: "",
      addressDetail: "",
      orderNote: "",
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createOrder(
        {
          name: data.name,
          phone: data.phone,
          address: data.address,
          addressDetail: data.addressDetail,
          postalCode: data.postalCode,
        },
        data.orderNote
      );

      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result.orderId) {
        // 주문 생성 성공 시 결제 위젯 표시
        setOrderId(result.orderId);
        setCustomerName(data.name);
      }
    });
  };

  // 결제 성공 핸들러
  const handlePaymentSuccess = (paymentKey: string, orderId: string, amount: number) => {
    // 결제 성공 시 API 라우트로 리다이렉트
    const successUrl = `/api/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`;
    router.push(successUrl);
  };

  // 결제 실패 핸들러
  const handlePaymentError = (error: Error) => {
    setError(`결제 처리 중 오류가 발생했습니다: ${error.message}`);
  };

  // 주문이 생성된 경우 결제 위젯 표시
  if (orderId) {
    return (
      <div className="space-y-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">주문이 생성되었습니다</h2>
          <p className="text-muted-foreground mb-4">
            아래에서 결제 수단을 선택하여 결제를 진행해주세요.
          </p>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">주문 번호</p>
            <p className="font-mono font-semibold">{orderId}</p>
          </div>
        </div>

        <PaymentWidget
          amount={totalAmount}
          orderId={orderId}
          orderName={`주문 #${orderId.slice(0, 8)}`}
          customerName={customerName}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">배송지 정보</h2>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>받는 분 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input placeholder="010-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우편번호</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input placeholder="서울시 강남구 테헤란로 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 주소 (선택)</FormLabel>
                  <FormControl>
                    <Input placeholder="101호" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">주문 메모</h2>
          <FormField
            control={form.control}
            name="orderNote"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="배송 시 요청사항을 입력해주세요 (선택)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "주문 처리 중..." : "주문하기"}
        </Button>
      </form>
    </Form>
  );
}
