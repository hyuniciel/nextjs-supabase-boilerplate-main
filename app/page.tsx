/**
 * @file app/page.tsx
 * @description 홈페이지
 *
 * 쇼핑몰의 메인 페이지로, 히어로 섹션과 카테고리 카드 그리드를 표시합니다.
 * 각 카테고리 카드를 클릭하면 해당 카테고리의 상품 목록 페이지로 이동합니다.
 *
 * @see components/CategoryCard.tsx
 * @see lib/supabase/server.ts
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import CategoryCard from "@/components/CategoryCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getAllCategories } from "@/lib/utils/products";
import { ShoppingBag, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * 카테고리별 상품 수를 가져오는 함수
 */
async function getCategoryCounts() {
  const supabase = await createClient();
  const categories = getAllCategories();

  const counts: Record<string, number> = {};

  for (const { code } of categories) {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("category", code);

    if (!error && count !== null) {
      counts[code] = count;
    } else {
      counts[code] = 0;
    }
  }

  return counts;
}

/**
 * 카테고리 카드 그리드 컴포넌트
 */
async function CategoryGrid() {
  const categories = getAllCategories();
  const counts = await getCategoryCounts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map(({ code }) => (
        <CategoryCard
          key={code}
          category={code}
          productCount={counts[code] || 0}
        />
      ))}
    </div>
  );
}

/**
 * 홈페이지
 */
export default async function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              쇼핑몰에 오신 것을 환영합니다
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              다양한 카테고리의 상품을 만나보세요. 원하는 상품을 쉽게 찾고
              구매할 수 있습니다.
            </p>
            <Link href="/products">
              <Button size="lg" className="mt-4">
                전체 상품 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-2">카테고리별 상품</h2>
          <p className="text-muted-foreground">
            관심 있는 카테고리를 선택하여 상품을 확인하세요.
          </p>
        </div>
        <CategoryGrid />
      </section>

      {/* 인기 상품 섹션 */}
      <FeaturedProducts />
    </main>
  );
}
