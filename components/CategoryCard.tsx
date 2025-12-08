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
 * 카테고리별 색상 매핑 (알록달록한 색상)
 */
const categoryColors: Record<string, { bg: string; icon: string; hover: string }> = {
  electronics: {
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
    icon: "text-blue-600",
    hover: "hover:from-blue-100 hover:to-cyan-100",
  },
  clothing: {
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
    icon: "text-pink-600",
    hover: "hover:from-pink-100 hover:to-rose-100",
  },
  books: {
    bg: "bg-gradient-to-br from-purple-50 to-indigo-50",
    icon: "text-purple-600",
    hover: "hover:from-purple-100 hover:to-indigo-100",
  },
  food: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    icon: "text-orange-600",
    hover: "hover:from-orange-100 hover:to-amber-100",
  },
  sports: {
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    icon: "text-green-600",
    hover: "hover:from-green-100 hover:to-emerald-100",
  },
  beauty: {
    bg: "bg-gradient-to-br from-fuchsia-50 to-pink-50",
    icon: "text-fuchsia-600",
    hover: "hover:from-fuchsia-100 hover:to-pink-100",
  },
  home: {
    bg: "bg-gradient-to-br from-yellow-50 to-orange-50",
    icon: "text-yellow-600",
    hover: "hover:from-yellow-100 hover:to-orange-100",
  },
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
  const colors = categoryColors[category] || {
    bg: "bg-gradient-to-br from-gray-50 to-slate-50",
    icon: "text-gray-600",
    hover: "hover:from-gray-100 hover:to-slate-100",
  };

  return (
    <Link
      href={`/products?category=${category}`}
      className={`group relative flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-white p-10 text-card-foreground shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.08] hover:-translate-y-1 ${colors.bg} ${colors.hover}`}
    >
      {/* 장식 요소 */}
      <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* 아이콘 */}
      <div className={`rounded-2xl bg-white/90 backdrop-blur-sm p-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
        <Icon className={`w-12 h-12 ${colors.icon} drop-shadow-sm`} />
      </div>

      {/* 카테고리명 */}
      <div className="flex flex-col items-center gap-2">
        <h3 className={`font-extrabold text-2xl ${colors.icon} group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}>
          {label}
        </h3>
        <span className="text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-white/50">
          {productCount}개 상품
        </span>
      </div>
    </Link>
  );
}

