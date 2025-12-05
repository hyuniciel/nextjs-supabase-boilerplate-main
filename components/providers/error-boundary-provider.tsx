/**
 * @file components/providers/error-boundary-provider.tsx
 * @description Error Boundary Provider
 *
 * 애플리케이션 전체에 Error Boundary를 적용하는 Provider입니다.
 */

"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
}

/**
 * Error Boundary Provider
 */
export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
