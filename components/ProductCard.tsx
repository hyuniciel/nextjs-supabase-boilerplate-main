/**
 * @file components/ProductCard.tsx
 * @description 상품 카드 컴포넌트
 *
 * 상품 목록 페이지에서 사용되는 재사용 가능한 상품 카드 컴포넌트입니다.
 * 상품 정보를 카드 형태로 표시하고, 클릭 시 상품 상세 페이지로 이동합니다.
 *
 * @see types/product.ts
 */

import Link from "next/link";
import React from "react";
import { Product } from "@/types/product";
import { formatPrice, getCategoryLabel } from "@/lib/utils/products";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
  searchTerm?: string;
}

/**
 * 검색어 하이라이트 함수
 */
function highlightSearchTerm(text: string, searchTerm?: string): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) {
    return text;
  }

  const parts = text.split(new RegExp(`(${searchTerm.trim()})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.trim().toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * 상품 카드 컴포넌트
 *
 * @param product - 표시할 상품 정보
 * @param searchTerm - 검색어 (하이라이트용)
 */
export default function ProductCard({ product, searchTerm }: ProductCardProps) {
  const isInStock = product.stock_quantity > 0;
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-purple-50 bg-white text-card-foreground shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
      aria-label={`${product.name} 상품 상세 보기`}
    >
      {/* 상품 이미지 */}
      <div className="relative overflow-hidden">
        <ProductImage imageUrl={product.image_url} alt={product.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-3 p-5 bg-gradient-to-b from-white to-purple-50/30">
        {/* 카테고리 */}
        {product.category && (
          <span className="text-xs font-medium text-muted-foreground">
            {categoryLabel}
          </span>
        )}

        {/* 상품명 (검색어 하이라이트) */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {highlightSearchTerm(product.name, searchTerm)}
        </h3>

        {/* 설명 (선택적) */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 가격 및 재고 상태 */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-purple-100">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
            {!isInStock && (
              <span className="text-xs text-white font-bold bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1 rounded-full inline-block w-fit shadow-md">
                품절
              </span>
            )}
            {isInStock && product.stock_quantity < 10 && (
              <span className="text-xs text-white font-bold bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 rounded-full inline-block w-fit shadow-md">
                재고 부족
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

