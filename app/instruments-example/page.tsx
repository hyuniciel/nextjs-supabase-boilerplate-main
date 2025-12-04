/**
 * @file app/instruments-example/page.tsx
 * @description Supabase 공식 문서 Quickstart 예제 페이지
 *
 * 이 페이지는 Supabase 공식 문서의 Next.js Quickstart 예제를 보여줍니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Instruments Example</h1>
      <p className="text-gray-600 mb-6">
        This page demonstrates the Supabase Next.js Quickstart example from the
        official documentation.
      </p>
      <Suspense fallback={<div>Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

