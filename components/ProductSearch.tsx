/**
 * @file components/ProductSearch.tsx
 * @description 상품 검색 컴포넌트
 *
 * 상품 목록 페이지에서 사용되는 검색 입력 컴포넌트입니다.
 * URL 쿼리 파라미터와 동기화되어 작동합니다.
 *
 * @see lib/utils/products.ts
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ProductSearchProps {
  currentSearch?: string;
}

/**
 * 상품 검색 컴포넌트
 *
 * @param currentSearch - 현재 검색어
 */
export default function ProductSearch({
  currentSearch = "",
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }

      // 페이지를 1로 리셋
      params.delete("page");

      router.push(`/products?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue("");
    handleSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="상품명으로 검색..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10"
          disabled={isPending}
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

