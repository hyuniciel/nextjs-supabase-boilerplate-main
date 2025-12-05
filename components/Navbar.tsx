import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

/**
 * 네비게이션 바 컴포넌트
 *
 * Clerk 인증 상태에 따라 로그인 버튼 또는 사용자 버튼을 표시합니다.
 * ClerkProvider의 localization 설정에 따라 모든 Clerk 컴포넌트가 한국어로 표시됩니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */
const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
        <Link href="/" className="text-xl sm:text-2xl font-bold" aria-label="홈으로 이동">
          쇼핑몰 MVP
        </Link>
      <nav className="flex gap-2 sm:gap-4 items-center" aria-label="주요 네비게이션">
        <ThemeToggle />
        <SignedIn>
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="장바구니">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Link>
        </SignedIn>
        <SignedOut>
          {/* SignInButton은 ClerkProvider의 localization 설정을 자동으로 상속받습니다 */}
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          {/* UserButton은 ClerkProvider의 localization 설정을 자동으로 상속받습니다 */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </SignedIn>
      </nav>
      </div>
    </header>
  );
};

export default Navbar;
