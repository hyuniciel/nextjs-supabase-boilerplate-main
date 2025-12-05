/**
 * @file components/EmptyState.tsx
 * @description 빈 상태 컴포넌트
 *
 * 데이터가 없을 때 표시되는 빈 상태 컴포넌트입니다.
 */

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * 빈 상태 컴포넌트
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {Icon && (
        <div className="mb-4">
          <Icon className="w-24 h-24 text-muted-foreground" />
        </div>
      )}
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {description && <p className="text-muted-foreground mb-6 max-w-md">{description}</p>}
      {(actionLabel && actionHref) && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
