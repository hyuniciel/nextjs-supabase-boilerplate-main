/**
 * @file components/FeaturedProducts.tsx
 * @description 인기 상품 섹션 컴포넌트
 *
 * 홈페이지에서 사용되는 인기 상품 섹션입니다.
 * 최근 생성된 상품 중 활성화된 상품을 표시합니다.
 *
 * @see components/ProductCard.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * 인기 상품 섹션 컴포넌트
 */
export default async function FeaturedProducts() {
  const supabase = await createClient();

  // 최근 생성된 활성 상품 조회 (최대 8개)
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">인기 상품</h2>
          <p className="text-muted-foreground">
            최근 추가된 상품을 확인하세요.
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline">
            전체 보기
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>
    </section>
  );
}

