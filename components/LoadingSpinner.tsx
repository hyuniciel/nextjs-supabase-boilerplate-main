/**
 * @file components/LoadingSpinner.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 표시되는 스피너 컴포넌트입니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

/**
 * 로딩 스피너 컴포넌트
 */
export default function LoadingSpinner({
  className,
  size = "md",
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
