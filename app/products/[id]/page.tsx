/**
 * @file app/products/[id]/page.tsx
 * @description 상품 상세 페이지 (임시)
 *
 * Phase 2 후반에 상세 페이지를 구현할 예정입니다.
 * 현재는 기본적인 상품 정보만 표시하는 임시 페이지입니다.
 *
 * @see components/ProductCard.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import { formatPrice, getCategoryLabel } from "@/lib/utils/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AddToCartButton from "./add-to-cart-button";
import ProductImage from "@/components/ProductImage";
import RelatedProducts from "./related-products";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 상품 상세 페이지
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const product = data as Product;
  const isInStock = product.stock_quantity > 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 뒤로가기 버튼 */}
      <Link href="/products">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          상품 목록으로
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="rounded-lg overflow-hidden">
          <ProductImage imageUrl={product.image_url} alt={product.name} priority />
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-6">
          {/* 카테고리 */}
          {product.category && (
            <span className="text-sm font-medium text-muted-foreground">
              {getCategoryLabel(product.category)}
            </span>
          )}

          {/* 상품명 */}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* 가격 */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* 재고 상태 */}
          <div>
            {!isInStock && (
              <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                품절
              </span>
            )}
            {isInStock && product.stock_quantity < 10 && (
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                재고 부족 ({product.stock_quantity}개 남음)
              </span>
            )}
            {isInStock && product.stock_quantity >= 10 && (
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                재고 있음
              </span>
            )}
          </div>

          {/* 설명 */}
          {product.description && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-2">상품 설명</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* 장바구니 버튼 */}
          <div className="pt-4 border-t">
            <AddToCartButton productId={product.id} isInStock={isInStock} />
          </div>
        </div>
      </div>

      {/* 관련 상품 */}
      <RelatedProducts productId={product.id} category={product.category} />
    </main>
  );
}

