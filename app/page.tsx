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
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import CategoryCard from "@/components/CategoryCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getAllCategories } from "@/lib/utils/products";
import { ShoppingBag, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * 카테고리별 상품 수를 가져오는 함수
 */
async function getCategoryCounts() {
  const supabase = getServiceRoleClient();
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
    <main className="min-h-[calc(100vh-80px)] bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-white via-purple-50/30 to-white py-20 lg:py-32 relative overflow-hidden">
        {/* 장식 배경 요소 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col items-center text-center gap-8">
            {/* 아이콘 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-20 h-20 text-white drop-shadow-lg" />
              </div>
            </div>
            
            {/* 타이틀 */}
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent drop-shadow-sm">
              쇼핑몰에 오신 것을<br />환영합니다
            </h1>
            
            {/* 설명 */}
            <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl leading-relaxed font-semibold">
              다양한 카테고리의 상품을 만나보세요.<br />
              원하는 상품을 쉽게 찾고 구매할 수 있습니다.
            </p>
            
            {/* CTA 버튼 */}
            <Link href="/products">
              <Button size="lg" className="mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg font-bold rounded-xl">
                전체 상품 보기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="container mx-auto px-4 py-20 max-w-7xl bg-white">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            카테고리별 상품
          </h2>
          <p className="text-lg text-gray-600 font-medium">
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
