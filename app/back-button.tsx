/**
 * @file app/back-button.tsx
 * @description 뒤로가기 버튼 컴포넌트
 *
 * 브라우저 히스토리를 사용하여 이전 페이지로 이동하는 클라이언트 컴포넌트입니다.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * 뒤로가기 버튼 컴포넌트
 */
export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => router.back()}
    >
      <ArrowLeft className="mr-2 w-4 h-4" />
      이전 페이지로
    </Button>
  );
}
