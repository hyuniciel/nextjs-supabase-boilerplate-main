/**
 * @file app/sign-in/[[...sign-in]]/page.tsx
 * @description 로그인 페이지
 *
 * Clerk의 SignIn 컴포넌트를 사용한 커스텀 로그인 페이지입니다.
 * ClerkProvider의 localization 설정에 따라 한국어로 표시됩니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-in"
        redirectUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}

