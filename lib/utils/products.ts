/**
 * @file lib/utils/products.ts
 * @description 상품 관련 유틸리티 함수
 *
 * 가격 포맷팅, 카테고리 라벨 변환 등의 유틸리티 함수를 제공합니다.
 */

/**
 * 가격을 원 단위로 포맷팅합니다.
 *
 * @param price - 포맷팅할 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: "89,000원")
 *
 * @example
 * ```ts
 * formatPrice(89000) // "89,000원"
 * formatPrice(1234567) // "1,234,567원"
 * ```
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * 카테고리 코드를 한글 라벨로 변환합니다.
 *
 * @param category - 카테고리 코드 (예: "electronics")
 * @returns 한글 라벨 (예: "전자제품")
 *
 * @example
 * ```ts
 * getCategoryLabel("electronics") // "전자제품"
 * getCategoryLabel("clothing") // "의류"
 * ```
 */
export function getCategoryLabel(category: string | null): string {
  if (!category) return "기타";

  const categoryMap: Record<string, string> = {
    electronics: "전자제품",
    clothing: "의류",
    books: "도서",
    food: "식품",
    sports: "스포츠",
    beauty: "뷰티",
    home: "생활/가정",
  };

  return categoryMap[category] || category;
}

/**
 * 사용 가능한 모든 카테고리 목록을 반환합니다.
 *
 * @returns 카테고리 코드와 한글 라벨의 배열
 */
export function getAllCategories(): Array<{ code: string; label: string }> {
  return [
    { code: "electronics", label: "전자제품" },
    { code: "clothing", label: "의류" },
    { code: "books", label: "도서" },
    { code: "food", label: "식품" },
    { code: "sports", label: "스포츠" },
    { code: "beauty", label: "뷰티" },
    { code: "home", label: "생활/가정" },
  ];
}

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "price_asc" | "price_desc" | "name_asc";

/**
 * 정렬 파라미터를 파싱하여 Supabase 쿼리에 사용할 수 있는 형태로 변환합니다.
 *
 * @param sort - 정렬 옵션 (예: "price_asc")
 * @returns Supabase 쿼리에 사용할 수 있는 정렬 정보
 *
 * @example
 * ```ts
 * parseSortParam("price_asc") // { column: "price", ascending: true }
 * parseSortParam("latest") // { column: "created_at", ascending: false }
 * ```
 */
export function parseSortParam(
  sort?: string
): { column: string; ascending: boolean } {
  switch (sort as SortOption) {
    case "price_asc":
      return { column: "price", ascending: true };
    case "price_desc":
      return { column: "price", ascending: false };
    case "name_asc":
      return { column: "name", ascending: true };
    case "latest":
    default:
      return { column: "created_at", ascending: false };
  }
}

/**
 * 정렬 옵션의 한글 라벨을 반환합니다.
 *
 * @param sort - 정렬 옵션
 * @returns 한글 라벨
 */
export function getSortLabel(sort: SortOption): string {
  const labels: Record<SortOption, string> = {
    latest: "최신순",
    price_asc: "가격 낮은순",
    price_desc: "가격 높은순",
    name_asc: "이름순",
  };
  return labels[sort] || "최신순";
}

/**
 * 상품 목록 페이지 URL을 생성합니다.
 *
 * @param params - URL 파라미터
 * @returns 생성된 URL
 *
 * @example
 * ```ts
 * buildProductsUrl({ category: "electronics", sort: "price_asc", page: 2, search: "이어폰" })
 * // "/products?category=electronics&sort=price_asc&page=2&search=이어폰"
 * ```
 */
export function buildProductsUrl(params: {
  category?: string;
  sort?: string;
  page?: number;
  search?: string;
}): string {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }
  if (params.sort && params.sort !== "latest") {
    searchParams.set("sort", params.sort);
  }
  if (params.search && params.search.trim()) {
    searchParams.set("search", params.search.trim());
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString());
  }

  const queryString = searchParams.toString();
  return `/products${queryString ? `?${queryString}` : ""}`;
}

