/**
 * @file components/ProductPagination.tsx
 * @description 상품 목록 페이지네이션 컴포넌트
 *
 * 상품 목록 페이지에서 사용되는 페이지네이션 컴포넌트입니다.
 * 이전/다음 버튼과 페이지 번호를 표시합니다.
 *
 * @see lib/utils/products.ts
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
  sort?: string;
  search?: string;
}

/**
 * 상품 목록 페이지네이션 컴포넌트
 *
 * @param currentPage - 현재 페이지 번호 (1부터 시작)
 * @param totalPages - 전체 페이지 수
 * @param category - 현재 선택된 카테고리
 * @param sort - 현재 선택된 정렬 옵션
 */
export default function ProductPagination({
  currentPage,
  totalPages,
  category,
  sort,
  search,
}: ProductPaginationProps) {

  if (totalPages <= 1) {
    return null;
  }

  // 표시할 페이지 번호 계산 (현재 페이지 ±2, 최대 5개)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 첫 페이지
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // 현재 페이지가 앞쪽에 있으면
      if (currentPage <= 3) {
        end = 4;
      }
      // 현재 페이지가 뒤쪽에 있으면
      else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // 중간 생략 표시
      if (start > 2) {
        pages.push("...");
      }

      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 끝 생략 표시
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // 마지막 페이지
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }
    if (sort && sort !== "latest") {
      params.set("sort", sort);
    }
    if (search && search.trim()) {
      params.set("search", search.trim());
    }
    if (page > 1) {
      params.set("page", page.toString());
    }

    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="페이지네이션"
    >
      {/* 이전 버튼 */}
      <Link href={getPageUrl(currentPage - 1)}>
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* 페이지 번호 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <Link key={pageNum} href={getPageUrl(pageNum)}>
              <Button
                variant={isCurrentPage ? "default" : "outline"}
                size="icon"
                className={cn(
                  "min-w-[40px]",
                  isCurrentPage && "pointer-events-none"
                )}
                aria-label={`${pageNum}페이지`}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {pageNum}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <Link href={getPageUrl(currentPage + 1)}>
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </nav>
  );
}

