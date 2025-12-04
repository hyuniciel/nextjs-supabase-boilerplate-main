"use client";

/**
 * @file app/tasks-example/add-task-form.tsx
 * @description Tasks 추가 폼 컴포넌트 (Client Component)
 *
 * Server Action을 사용하여 새 task를 생성합니다.
 */

import { useState, useTransition } from "react";
import { addTask } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddTaskForm() {
  const [taskName, setTaskName] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskName.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        await addTask(taskName.trim());
        setTaskName("");
        // 페이지 새로고침으로 최신 데이터 표시
        window.location.reload();
      } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter new task..."
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        disabled={isPending}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" disabled={isPending || !taskName.trim()}>
        {isPending ? "Adding..." : "Add Task"}
      </Button>
    </form>
  );
}

