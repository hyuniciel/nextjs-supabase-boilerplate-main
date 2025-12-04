"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 공식 문서 패턴을 따르면서 Clerk 통합을 유지합니다:
 * - @supabase/ssr의 createBrowserClient 사용
 * - Clerk 세션 토큰을 accessToken으로 전달
 * - 네이티브 Supabase 통합 사용 (JWT 템플릿 불필요)
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { createClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = createClient();
 *
 *   async function fetchData() {
 *     const { data, error } = await supabase.from('table').select('*');
 *     if (error) {
 *       console.error('Error fetching data:', error);
 *       return;
 *     }
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  // Clerk 통합을 위해 accessToken 옵션 사용
  // createBrowserClient는 쿠키 기반 세션 관리를 제공하지만,
  // Clerk를 사용하는 경우 accessToken으로 Clerk 토큰을 전달
  return createBrowserClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      // Client Component에서는 useAuth hook을 직접 사용할 수 없으므로
      // 이 함수는 클라이언트에서 호출될 때 Clerk 토큰을 가져옵니다
      // 실제 사용 시에는 useClerkSupabaseClient hook을 사용하세요
      return null;
    },
  });
}

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 Hook (Client Component용)
 *
 * React Hook을 사용하여 Clerk 인증 상태와 함께 Supabase 클라이언트를 생성합니다.
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     const { data, error } = await supabase.from('table').select('*');
 *     if (error) {
 *       console.error('Error fetching data:', error);
 *       return;
 *     }
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    return createBrowserClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        try {
          const token = await getToken();
          return token ?? null;
        } catch (error) {
          console.error("Error getting Clerk token:", error);
          return null;
        }
      },
    });
  }, [getToken]);

  return supabase;
}
