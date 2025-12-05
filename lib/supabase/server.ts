import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * 공식 문서 패턴을 따르면서 Clerk 통합을 유지합니다:
 * - Next.js 15 App Router 모범 사례 준수
 * - Clerk 세션 토큰을 accessToken으로 전달
 * - 네이티브 Supabase 통합 사용 (JWT 템플릿 불필요)
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase.from('table').select('*');
 *   if (error) {
 *     throw new Error('Failed to fetch data');
 *   }
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server';
 *
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = await createClient();
 *   const { error } = await supabase.from('tasks').insert({ name });
 *   if (error) throw error;
 * }
 * ```
 */
export async function createClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      try {
        const authData = await auth();
        return await authData.getToken();
      } catch (error) {
        console.error("Error getting Clerk token:", error);
        return null;
      }
    },
  });
}

/**
 * @deprecated Use `createClient()` instead. This function is kept for backward compatibility.
 */
export function createClerkSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      try {
        const authData = await auth();
        return await authData.getToken();
      } catch (error) {
        console.error("Error getting Clerk token:", error);
        return null;
      }
    },
  });
}
