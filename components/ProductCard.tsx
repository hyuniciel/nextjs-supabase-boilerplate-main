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
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={`${product.name} 상품 상세 보기`}
    >
      {/* 상품 이미지 */}
      <ProductImage imageUrl={product.image_url} alt={product.name} />

      {/* 상품 정보 */}
      <div className="flex flex-col gap-2 p-4">
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
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {!isInStock && (
              <span className="text-xs text-destructive font-medium">
                품절
              </span>
            )}
            {isInStock && product.stock_quantity < 10 && (
              <span className="text-xs text-orange-600 font-medium">
                재고 부족
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

