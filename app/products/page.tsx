/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지
 *
 * 상품을 Grid 레이아웃으로 표시하고, 카테고리별로 필터링, 정렬, 페이지네이션이 가능한 페이지입니다.
 * URL 쿼리 파라미터:
 * - `?category=electronics` - 카테고리 필터링
 * - `?sort=price_asc` - 정렬 옵션
 * - `?page=2` - 페이지 번호
 *
 * @see components/ProductCard.tsx
 * @see components/ProductSortSelect.tsx
 * @see components/ProductPagination.tsx
 * @see lib/supabase/server.ts
 */

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import ProductSortSelect from "@/components/ProductSortSelect";
import ProductPagination from "@/components/ProductPagination";
import ProductSearch from "@/components/ProductSearch";
import { getCategoryLabel, parseSortParam } from "@/lib/utils/products";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 12;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

/**
 * 상품 목록을 가져오는 함수
 */
async function getProducts(
  category?: string,
  sort?: string,
  page: number = 1,
  search?: string
): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const { column, ascending } = parseSortParam(sort);

  // 총 개수 조회
  let countQuery = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (category) {
    countQuery = countQuery.eq("category", category);
  }

  if (search && search.trim()) {
    countQuery = countQuery.ilike("name", `%${search.trim()}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error("Error counting products:", countError);
  }

  // 상품 목록 조회
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order(column, { ascending })
    .range(from, to);

  if (category) {
    query = query.eq("category", category);
  }

  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }

  return {
    products: (data as Product[]) || [],
    total: count || 0,
  };
}

/**
 * 상품 목록 컴포넌트
 */
async function ProductsList({
  category,
  sort,
  page,
  search,
}: {
  category?: string;
  sort?: string;
  page: number;
  search?: string;
}) {
  const { products, total } = await getProducts(category, sort, page, search);
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground mb-2">
          {search
            ? `&quot;${search}&quot;에 대한 검색 결과가 없습니다.`
            : category
            ? `${getCategoryLabel(category)} 카테고리에 상품이 없습니다.`
            : "등록된 상품이 없습니다."}
        </p>
        <p className="text-sm text-muted-foreground">
          {search
            ? "다른 검색어를 시도해보세요."
            : "다른 카테고리를 확인해보세요."}
        </p>
      </div>
    );
  }

  return (
    <>
      {search && (
        <div className="mb-4 text-sm text-muted-foreground">
          &quot;{search}&quot; 검색 결과: {total}개
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} searchTerm={search} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <ProductPagination
        currentPage={page}
        totalPages={totalPages}
        category={category}
        sort={sort}
        search={search}
      />
    </>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function ProductsListSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-lg border bg-card animate-pulse"
          >
            <div className="aspect-square w-full bg-muted" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-6 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-6 w-24 bg-muted rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
      {/* 페이지네이션 스켈레톤 */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
      </div>
    </>
  );
}

/**
 * 상품 목록 페이지
 */
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || "latest";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search;

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 페이지 헤더, 검색 및 정렬 */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {search
                ? `&quot;${search}&quot; 검색 결과`
                : category
                ? getCategoryLabel(category)
                : "전체 상품"}
            </h1>
            <p className="text-muted-foreground">
              {search
                ? `&quot;${search}&quot;에 대한 검색 결과입니다.`
                : category
                ? `${getCategoryLabel(category)} 카테고리의 상품을 확인하세요.`
                : "모든 상품을 확인하세요."}
            </p>
          </div>

          {/* 정렬 선택 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">정렬:</span>
            <Suspense fallback={<div className="h-9 w-[180px] bg-muted rounded animate-pulse" />}>
              <ProductSortSelect currentSort={sort} />
            </Suspense>
          </div>
        </div>

        {/* 검색 입력 */}
        <div className="flex justify-start">
          <Suspense fallback={<div className="h-10 w-full max-w-md bg-muted rounded animate-pulse" />}>
            <ProductSearch currentSearch={search} />
          </Suspense>
        </div>
      </div>

      {/* 상품 목록 */}
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsList category={category} sort={sort} page={page} search={search} />
      </Suspense>
    </main>
  );
}
