import { createBrowserClient } from "@supabase/ssr";

/**
 * 공개 데이터 접근용 Supabase 클라이언트 (Client Component용)
 *
 * 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * Clerk 인증이 필요한 경우 `useClerkSupabaseClient` hook을 사용하세요.
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * @deprecated Use `createClient()` instead. This export is kept for backward compatibility.
 */
export const supabase = createClient();
