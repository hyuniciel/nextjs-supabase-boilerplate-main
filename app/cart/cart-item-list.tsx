/**
 * @file app/cart/cart-item-list.tsx
 * @description 장바구니 항목 목록 컴포넌트
 *
 * 장바구니 항목을 표시하고, 수량 변경 및 삭제 기능을 제공합니다.
 *
 * @see actions/cart.ts
 */

"use client";

import { CartItemWithProduct } from "@/types/cart";
import { formatPrice, getCategoryLabel } from "@/lib/utils/products";
import { updateCartQuantity, removeFromCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItemListProps {
  items: CartItemWithProduct[];
}

/**
 * 장바구니 항목 목록 컴포넌트
 */
export default function CartItemList({ items }: CartItemListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

/**
 * 장바구니 항목 카드 컴포넌트
 */
function CartItemCard({ item }: { item: CartItemWithProduct }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();
  const product = item.product;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > product.stock_quantity) {
      return;
    }

    const previousQuantity = quantity;
    setQuantity(newQuantity);
    startTransition(async () => {
      const result = await updateCartQuantity(item.id, newQuantity);
      if (result.error) {
        alert(result.error);
        setQuantity(previousQuantity); // 롤백
      } else {
        // 성공 시 페이지 새로고침하여 총액 등 업데이트
        router.refresh();
      }
    });
  };

  const handleRemove = () => {
    if (!confirm("정말 이 상품을 장바구니에서 제거하시겠습니까?")) {
      return;
    }

    setIsRemoving(true);
    startTransition(async () => {
      const result = await removeFromCart(item.id);
      if (result.error) {
        alert(result.error);
        setIsRemoving(false);
      } else {
        // 성공 시 페이지 새로고침하여 UI 업데이트
        router.refresh();
      }
    });
  };

  const itemTotal = product.price * quantity;
  const maxQuantity = product.stock_quantity;

  if (isRemoving) {
    return (
      <div className="flex gap-4 p-4 border rounded-lg bg-card opacity-50">
        <div className="flex-1">
          <p className="text-muted-foreground">삭제 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 border rounded-lg bg-card">
      {/* 상품 정보 */}
      <div className="flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-sm text-muted-foreground mb-2">
            {getCategoryLabel(product.category)}
          </p>
        )}
        <p className="text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </p>
        {maxQuantity < quantity && (
          <p className="text-sm text-destructive mt-1">
            재고 부족 (재고: {maxQuantity}개)
          </p>
        )}
      </div>

      {/* 수량 조절 및 삭제 */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isPending || quantity <= 1}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                handleQuantityChange(val);
              }
            }}
            min={1}
            max={maxQuantity}
            className="w-16 text-center"
            disabled={isPending}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isPending || quantity >= maxQuantity}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            소계: {formatPrice(itemTotal)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isPending || isRemoving}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

