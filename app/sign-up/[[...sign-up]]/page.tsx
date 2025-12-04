/**
 * @file app/sign-up/[[...sign-up]]/page.tsx
 * @description 회원가입 페이지
 *
 * Clerk의 SignUp 컴포넌트를 사용한 커스텀 회원가입 페이지입니다.
 * ClerkProvider의 localization 설정에 따라 한국어로 표시됩니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-up"
        redirectUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  );
}

