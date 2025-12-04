"use server";

/**
 * @file app/tasks-example/actions.ts
 * @description Tasks 관련 Server Actions
 *
 * Server Action을 사용하여 Supabase 데이터베이스에 task를 생성합니다.
 * RLS 정책에 의해 자동으로 현재 사용자의 user_id가 설정됩니다.
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient } from "@/lib/supabase/server";

/**
 * 새 task를 생성하는 Server Action
 *
 * @param name - Task 이름
 * @throws {Error} Supabase 오류 발생 시
 */
export async function addTask(name: string) {
  const supabase = await createClient();

  // user_id는 RLS 정책의 기본값으로 자동 설정됨 (auth.jwt()->>'sub')
  const { error } = await supabase.from("tasks").insert({
    name,
    completed: false,
  });

  if (error) {
    console.error("Error adding task:", error);
    throw new Error(`Failed to add task: ${error.message}`);
  }
}

