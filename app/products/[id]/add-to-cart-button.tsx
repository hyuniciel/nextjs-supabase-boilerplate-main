/**
 * @file app/products/[id]/add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 사용되는 장바구니 추가 버튼입니다.
 *
 * @see actions/cart.ts
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  isInStock: boolean;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 */
export default function AddToCartButton({
  productId,
  isInStock,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      if (result.error) {
        setError(result.error);
      } else {
        // 장바구니 페이지로 이동
        router.push("/cart");
      }
    });
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">
          {error}
        </div>
      )}
      <Button
        onClick={handleAddToCart}
        disabled={!isInStock || isPending}
        size="lg"
        className="w-full"
      >
        <ShoppingCart className="mr-2 w-4 h-4" />
        {isPending
          ? "추가 중..."
          : isInStock
          ? "장바구니에 담기"
          : "품절"}
      </Button>
    </div>
  );
}

