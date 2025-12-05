/**
 * @file types/env.d.ts
 * @description 환경 변수 타입 정의
 *
 * Next.js 환경 변수의 타입을 정의합니다.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Clerk
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      CLERK_SECRET_KEY: string;
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
      NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string;
      NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: string;

      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      NEXT_PUBLIC_STORAGE_BUCKET: string;

      // Toss Payments
      NEXT_PUBLIC_TOSS_CLIENT_KEY: string;
      TOSS_SECRET_KEY: string;
    }
  }
}

export {};
