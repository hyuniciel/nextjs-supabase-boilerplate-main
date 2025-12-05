/**
 * @file app/not-found.tsx
 * @description 404 페이지
 *
 * 존재하지 않는 페이지에 접근했을 때 표시되는 페이지입니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import BackButton from "./back-button";

/**
 * 404 페이지
 */
export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="mr-2 w-4 h-4" />
              홈으로 가기
            </Button>
          </Link>
          <BackButton />
        </div>
      </div>
    </main>
  );
}
