/**
 * @file components/ErrorBoundary.tsx
 * @description React Error Boundary 컴포넌트
 *
 * 애플리케이션에서 발생하는 예기치 않은 에러를 캐치하고 사용자에게 친화적인 에러 메시지를 표시합니다.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 에러 바운더리 컴포넌트
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 (프로덕션에서는 에러 리포팅 서비스로 전송)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
              <p className="text-muted-foreground">
                예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가주세요.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-semibold mb-2">에러 상세:</p>
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="mr-2 w-4 h-4" />
                다시 시도
              </Button>
              <Link href="/">
                <Button>
                  <Home className="mr-2 w-4 h-4" />
                  홈으로 가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
