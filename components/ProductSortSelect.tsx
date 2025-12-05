/**
 * @file components/ProductSortSelect.tsx
 * @description 상품 정렬 선택 컴포넌트
 *
 * 상품 목록 페이지에서 사용되는 정렬 옵션 선택 컴포넌트입니다.
 * URL 쿼리 파라미터와 동기화되어 작동합니다.
 *
 * @see lib/utils/products.ts
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption, getSortLabel } from "@/lib/utils/products";

const SORT_OPTIONS: SortOption[] = ["latest", "price_asc", "price_desc", "name_asc"];

interface ProductSortSelectProps {
  currentSort?: string;
}

/**
 * 상품 정렬 선택 컴포넌트
 *
 * @param currentSort - 현재 선택된 정렬 옵션
 */
export default function ProductSortSelect({
  currentSort = "latest",
}: ProductSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // 페이지를 1로 리셋
    params.delete("page");

    router.push(`/products?${params.toString()}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="정렬 선택" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {getSortLabel(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

