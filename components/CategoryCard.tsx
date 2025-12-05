/**
 * @file components/CategoryCard.tsx
 * @description 카테고리 카드 컴포넌트
 *
 * 홈페이지에서 사용되는 카테고리 카드 컴포넌트입니다.
 * 카테고리 정보를 카드 형태로 표시하고, 클릭 시 해당 카테고리의 상품 목록 페이지로 이동합니다.
 *
 * @see types/product.ts
 */

import Link from "next/link";
import { getCategoryLabel } from "@/lib/utils/products";
import { LucideIcon } from "lucide-react";
import {
  Laptop,
  Shirt,
  Book,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  Home,
  Package,
} from "lucide-react";

interface CategoryCardProps {
  category: string;
  productCount: number;
}

/**
 * 카테고리별 아이콘 매핑
 */
const categoryIcons: Record<string, LucideIcon> = {
  electronics: Laptop,
  clothing: Shirt,
  books: Book,
  food: UtensilsCrossed,
  sports: Dumbbell,
  beauty: Sparkles,
  home: Home,
};

/**
 * 카테고리 카드 컴포넌트
 *
 * @param category - 카테고리 코드 (예: "electronics")
 * @param productCount - 해당 카테고리의 상품 수
 */
export default function CategoryCard({
  category,
  productCount,
}: CategoryCardProps) {
  const label = getCategoryLabel(category);
  const Icon = categoryIcons[category] || Package;

  return (
    <Link
      href={`/products?category=${category}`}
      className="group relative flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:border-primary"
    >
      {/* 아이콘 */}
      <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-8 h-8 text-primary" />
      </div>

      {/* 카테고리명 */}
      <div className="flex flex-col items-center gap-1">
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {label}
        </h3>
        <span className="text-sm text-muted-foreground">
          {productCount}개 상품
        </span>
      </div>
    </Link>
  );
}

