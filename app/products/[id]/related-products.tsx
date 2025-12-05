/**
 * @file app/products/[id]/related-products.tsx
 * @description 관련 상품 컴포넌트
 *
 * 같은 카테고리의 다른 상품을 표시하는 컴포넌트입니다.
 *
 * @see components/ProductCard.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

interface RelatedProductsProps {
  productId: string;
  category: string | null;
}

/**
 * 관련 상품 컴포넌트
 */
export default async function RelatedProducts({
  productId,
  category,
}: RelatedProductsProps) {
  if (!category) {
    return null;
  }

  const supabase = await createClient();

  // 같은 카테고리의 다른 상품 조회 (최대 4개)
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">관련 상품</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>
    </div>
  );
}

