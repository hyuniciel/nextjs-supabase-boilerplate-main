/**
 * @file app/tasks-example/page.tsx
 * @description Clerk + Supabase 통합 예제 페이지
 *
 * 이 페이지는 Clerk와 Supabase의 네이티브 통합을 보여주는 예제입니다.
 * 사용자는 자신의 tasks를 조회하고 생성할 수 있습니다.
 *
 * 주요 기능:
 * 1. Server Component에서 Supabase 데이터 조회
 * 2. Server Action을 통한 데이터 생성
 * 3. RLS 정책을 통한 사용자별 데이터 접근 제한
 *
 * @see https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddTaskForm from "./add-task-form";

export default async function TasksExamplePage() {
  // 인증 확인
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Clerk + Supabase 클라이언트 생성 (공식 문서 패턴: await createClient())
  const supabase = await createClient();

  // 사용자의 tasks 조회 (RLS 정책에 의해 자동으로 필터링됨)
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Tasks Example</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">
            Error loading tasks: {error.message}
          </p>
          <p className="text-sm text-red-600 mt-2">
            Make sure you have:
            <ul className="list-disc list-inside mt-2">
              <li>Activated Clerk Supabase integration in Clerk Dashboard</li>
              <li>Added Clerk as a third-party auth provider in Supabase</li>
              <li>Run the tasks example migration</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Tasks Example</h1>
      <p className="text-gray-600 mb-6">
        This page demonstrates Clerk + Supabase integration with Row Level
        Security (RLS). You can only see and manage your own tasks.
      </p>

      <div className="mb-8">
        <AddTaskForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
        {tasks && tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="w-5 h-5"
                />
                <span
                  className={`flex-1 ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tasks yet. Create your first task above!</p>
        )}
      </div>
    </div>
  );
}

