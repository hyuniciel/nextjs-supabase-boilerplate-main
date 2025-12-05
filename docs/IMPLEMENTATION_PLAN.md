# 구현 계획서 (Implementation Plan)

> TODO.md의 미완료 항목에 대한 상세 구현 계획

## 📋 목차

1. [Phase 4: 결제 통합 (Toss Payments 테스트 모드)](#phase-4-결제-통합-toss-payments-테스트-모드)
2. [Phase 6: 테스트 & 배포](#phase-6-테스트--배포)
3. [공통 작업 & 문서화](#공통-작업--문서화)
4. [환경/리포지토리 기초 세팅](#환경리포지토리-기초-세팅)

---

## Phase 4: 결제 통합 (Toss Payments 테스트 모드)

### 🎯 목표

Toss Payments를 통한 테스트 결제 기능을 구현하여, 사용자가 주문 후 실제 결제 프로세스를 경험할 수 있도록 합니다.

### 📊 현재 상태

- ✅ 주문 생성 흐름 완료 (`actions/order.ts`)
- ✅ 주문 테이블 저장 완료 (`orders`, `order_items`)
- ✅ 주문 상태 관리 (`orders.status`)
- ❌ 결제 위젯 연동 미완료
- ❌ 결제 성공/실패 콜백 처리 미완료
- ❌ 결제 완료 후 주문 상태 업데이트 미완료

### 🔧 구현 상세 계획

#### 4.1 Toss Payments SDK 설정 및 환경 변수 구성

**목표**: Toss Payments 클라이언트 SDK를 프로젝트에 통합하고 필요한 환경 변수를 설정합니다.

**작업 내용**:
1. Toss Payments JavaScript SDK 설치
   ```bash
   pnpm add @tosspayments/payment-sdk
   ```
2. 환경 변수 추가 (`.env.local`)
   ```env
   NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
   TOSS_SECRET_KEY=test_sk_...
   ```
3. 환경 변수 타입 정의 (`types/env.d.ts`)
   ```typescript
   declare global {
     namespace NodeJS {
       interface ProcessEnv {
         NEXT_PUBLIC_TOSS_CLIENT_KEY: string;
         TOSS_SECRET_KEY: string;
       }
     }
   }
   ```

**파일 구조**:
```
.env.local                    # 환경 변수 추가
types/
  env.d.ts                    # 환경 변수 타입 정의
```

**예상 소요 시간**: 30분

---

#### 4.2 결제 위젯 컴포넌트 생성

**목표**: Toss Payments 위젯을 래핑한 React 컴포넌트를 생성합니다.

**작업 내용**:
1. `components/PaymentWidget.tsx` 생성
   - Toss Payments SDK 초기화
   - 결제 요청 함수 구현
   - 로딩/에러 상태 관리
   - TypeScript 타입 정의

**주요 기능**:
- 결제 금액, 주문 ID, 주문명 전달
- 결제 수단 선택 (카드, 계좌이체, 가상계좌 등)
- 결제 요청 실행
- 결제 진행 상태 표시

**파일 구조**:
```
components/
  PaymentWidget.tsx            # 결제 위젯 컴포넌트
types/
  payment.ts                   # 결제 관련 타입 정의
```

**구현 예시**:
```typescript
/**
 * @file components/PaymentWidget.tsx
 * @description Toss Payments 결제 위젯 컴포넌트
 * 
 * Toss Payments SDK를 사용하여 결제를 처리하는 컴포넌트입니다.
 * 테스트 모드로만 동작하며, 실제 결제는 발생하지 않습니다.
 */
'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

interface PaymentWidgetProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  onSuccess: (paymentKey: string, orderId: string, amount: number) => void;
  onError: (error: Error) => void;
}

export default function PaymentWidget({ ... }: PaymentWidgetProps) {
  // 구현 내용
}
```

**예상 소요 시간**: 2-3시간

---

#### 4.3 결제 페이지 통합

**목표**: 체크아웃 페이지에 결제 위젯을 통합하고 결제 플로우를 완성합니다.

**작업 내용**:
1. `app/checkout/page.tsx` 수정
   - 결제 위젯 컴포넌트 추가
   - 주문 정보 전달
   - 결제 성공/실패 핸들러 연결

2. 결제 전 주문 생성 로직 수정
   - 결제 전에 주문을 생성하지 않고, 결제 성공 후 주문 생성
   - 또는 결제 전 주문 생성 후 결제 성공 시 상태 업데이트

**파일 구조**:
```
app/checkout/
  page.tsx                     # 결제 페이지 (수정)
  checkout-form.tsx            # 주문 폼 (수정)
```

**예상 소요 시간**: 1-2시간

---

#### 4.4 결제 성공 콜백 처리

**목표**: 결제 성공 시 주문 상태를 업데이트하고 성공 페이지로 리다이렉트합니다.

**작업 내용**:
1. 결제 성공 API 라우트 생성 (`app/api/payment/success/route.ts`)
   - Toss Payments 서버 검증
   - 주문 상태 업데이트 (`orders.status = 'paid'`)
   - 결제 정보 저장 (필요 시 `payments` 테이블 생성)

2. 결제 실패 API 라우트 생성 (`app/api/payment/fail/route.ts`)
   - 실패 사유 로깅
   - 주문 상태 업데이트 (`orders.status = 'payment_failed'`)

3. 결제 완료 페이지 생성 (`app/payment/success/page.tsx`)
   - 결제 성공 메시지 표시
   - 주문 상세 페이지 링크 제공

**데이터베이스 변경** (필요 시):
```sql
-- payments 테이블 생성 (선택적)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_key TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**파일 구조**:
```
app/api/payment/
  success/
    route.ts                   # 결제 성공 처리
  fail/
    route.ts                   # 결제 실패 처리
app/payment/
  success/
    page.tsx                   # 결제 성공 페이지
  fail/
    page.tsx                   # 결제 실패 페이지
supabase/migrations/
  YYYYMMDDHHmmss_create_payments_table.sql  # 선택적
```

**예상 소요 시간**: 2-3시간

---

#### 4.5 결제 완료 후 주문 상태 업데이트

**목표**: 결제 성공 시 주문 상태를 자동으로 업데이트합니다.

**작업 내용**:
1. `actions/order.ts`에 결제 완료 함수 추가
   ```typescript
   export async function updateOrderPaymentStatus(
     orderId: string,
     paymentKey: string,
     amount: number
   ) {
     // 주문 상태를 'paid'로 업데이트
     // 결제 정보 저장
   }
   ```

2. 서버 사이드 검증 강화
   - Toss Payments 서버에서 결제 정보 검증
   - 중복 결제 방지
   - 금액 일치 확인

**파일 구조**:
```
actions/
  order.ts                     # 주문 관련 액션 (수정)
lib/
  toss-payments.ts            # Toss Payments 유틸리티 함수
```

**예상 소요 시간**: 1-2시간

---

#### 4.6 에러 처리 및 사용자 피드백

**목표**: 결제 과정에서 발생할 수 있는 에러를 처리하고 사용자에게 명확한 피드백을 제공합니다.

**작업 내용**:
1. 에러 타입 정의 및 처리
   - 네트워크 에러
   - 결제 취소
   - 결제 실패
   - 서버 에러

2. 사용자 친화적인 에러 메시지
   - Toast 알림 추가
   - 에러 페이지 개선

**파일 구조**:
```
components/
  PaymentError.tsx             # 결제 에러 컴포넌트
lib/
  errors.ts                    # 에러 타입 및 메시지
```

**예상 소요 시간**: 1시간

---

### 📝 Phase 4 체크리스트

- [ ] Toss Payments SDK 설치 및 환경 변수 설정
- [ ] 결제 위젯 컴포넌트 생성
- [ ] 결제 페이지 통합
- [ ] 결제 성공 콜백 처리
- [ ] 결제 실패 콜백 처리
- [ ] 결제 완료 후 주문 상태 업데이트
- [ ] 에러 처리 및 사용자 피드백
- [ ] 테스트 결제 플로우 검증

**총 예상 소요 시간**: 8-12시간

---

## Phase 6: 테스트 & 배포

### 🎯 목표

전체 사용자 플로우를 점검하고, 버그를 수정하며, 프로덕션 환경에 배포할 수 있도록 준비합니다.

### 📊 현재 상태

- ✅ 기본 기능 구현 완료
- ❌ E2E 테스트 미완료
- ❌ 예외 처리 강화 미완료
- ❌ Vercel 배포 설정 미완료

### 🔧 구현 상세 계획

#### 6.1 전체 사용자 플로우 E2E 점검

**목표**: 사용자가 쇼핑몰을 이용하는 전체 플로우를 시나리오별로 테스트하고 문제점을 파악합니다.

**테스트 시나리오**:

1. **회원가입 → 상품 탐색 → 장바구니 → 주문 → 결제 플로우**
   - [ ] 회원가입 성공
   - [ ] 홈페이지 접속 및 카테고리 탐색
   - [ ] 상품 목록 페이지에서 필터링/정렬/검색
   - [ ] 상품 상세 페이지 확인
   - [ ] 장바구니에 상품 추가
   - [ ] 장바구니에서 수량 변경/삭제
   - [ ] 주문 페이지에서 주소 입력
   - [ ] 결제 진행 및 완료
   - [ ] 주문 내역 확인

2. **에러 케이스 테스트**
   - [ ] 로그인하지 않은 상태에서 장바구니 접근
   - [ ] 재고 부족 상품 주문 시도
   - [ ] 결제 취소
   - [ ] 네트워크 에러 상황

3. **성능 테스트**
   - [ ] 페이지 로딩 속도 확인
   - [ ] 이미지 최적화 확인
   - [ ] 대량 데이터 처리 확인

**작업 내용**:
1. 테스트 시나리오 문서 작성 (`docs/TEST_SCENARIOS.md`)
2. 수동 테스트 수행 및 결과 기록
3. 발견된 문제점 목록 작성

**파일 구조**:
```
docs/
  TEST_SCENARIOS.md           # 테스트 시나리오 문서
  TEST_RESULTS.md             # 테스트 결과 기록
```

**예상 소요 시간**: 2-3시간

---

#### 6.2 주요 버그 수정 및 예외처리 강화

**목표**: 테스트 과정에서 발견된 버그를 수정하고 예외 상황에 대한 처리를 강화합니다.

**작업 내용**:

1. **에러 바운더리 추가**
   - React Error Boundary 컴포넌트 생성
   - 주요 페이지에 에러 바운더리 적용

2. **입력 검증 강화**
   - 주문 폼 검증 강화 (Zod 스키마 적용)
   - 장바구니 수량 검증
   - 결제 금액 검증

3. **데이터 일관성 검증**
   - 주문 생성 시 재고 재확인
   - 결제 금액과 주문 금액 일치 확인
   - 중복 주문 방지

4. **로딩 상태 개선**
   - 모든 비동기 작업에 로딩 상태 추가
   - 스켈레톤 UI 적용

5. **빈 상태 처리**
   - 장바구니 비어있을 때
   - 주문 내역 없을 때
   - 검색 결과 없을 때

**파일 구조**:
```
components/
  ErrorBoundary.tsx            # 에러 바운더리 컴포넌트
  LoadingSpinner.tsx           # 로딩 스피너
lib/
  validation.ts                # 검증 유틸리티
  errors.ts                    # 에러 처리 유틸리티
```

**예상 소요 시간**: 3-4시간

---

#### 6.3 Vercel 배포 설정 및 환경변수 구성

**목표**: 프로덕션 환경에 배포할 수 있도록 Vercel 설정을 완료합니다.

**작업 내용**:

1. **Vercel 프로젝트 생성**
   - Vercel 계정 연결
   - GitHub 리포지토리 연결
   - 프로젝트 설정

2. **환경 변수 설정**
   - Clerk 환경 변수
   - Supabase 환경 변수
   - Toss Payments 환경 변수
   - 기타 필요한 환경 변수

3. **빌드 설정 확인**
   - `next.config.js` 확인
   - 빌드 명령어 확인 (`pnpm build`)
   - 출력 디렉토리 확인

4. **도메인 설정** (선택적)
   - 커스텀 도메인 연결
   - SSL 인증서 확인

5. **배포 후 검증**
   - 프로덕션 환경에서 테스트
   - 환경 변수 확인
   - API 엔드포인트 동작 확인

**파일 구조**:
```
vercel.json                    # Vercel 설정 파일 (필요 시)
.env.production                # 프로덕션 환경 변수 예시 (로컬 참고용)
docs/
  DEPLOYMENT.md                # 배포 가이드 문서
```

**예상 소요 시간**: 1-2시간

---

#### 6.4 모니터링 및 로깅 설정

**목표**: 프로덕션 환경에서 발생하는 에러와 성능 이슈를 모니터링할 수 있도록 설정합니다.

**작업 내용**:

1. **에러 로깅 설정** (선택적)
   - Sentry 또는 유사 서비스 연동
   - 클라이언트/서버 에러 로깅

2. **성능 모니터링** (선택적)
   - Vercel Analytics 활성화
   - Web Vitals 추적

3. **로깅 유틸리티 생성**
   - 개발/프로덕션 환경별 로깅 레벨
   - 구조화된 로그 포맷

**파일 구조**:
```
lib/
  logger.ts                    # 로깅 유틸리티
```

**예상 소요 시간**: 1-2시간 (선택적)

---

### 📝 Phase 6 체크리스트

- [ ] 전체 사용자 플로우 E2E 점검
- [ ] 테스트 시나리오 문서 작성
- [ ] 발견된 버그 수정
- [ ] 예외 처리 강화
- [ ] 에러 바운더리 추가
- [ ] 입력 검증 강화
- [ ] 로딩 상태 개선
- [ ] 빈 상태 처리
- [ ] Vercel 배포 설정
- [ ] 환경 변수 구성
- [ ] 배포 후 검증
- [ ] 모니터링 설정 (선택적)

**총 예상 소요 시간**: 7-11시간

---

## 공통 작업 & 문서화

### 🎯 목표

프로젝트의 품질을 향상시키고 유지보수성을 높이기 위한 공통 작업을 수행합니다.

### 📊 현재 상태

- ✅ 기본 UI 구현 완료
- ❌ 오류/로딩/빈 상태 UI 정비 미완료
- ❌ 타입 안전성 강화 미완료
- ❌ README/PRD 반영 미완료
- ❌ 접근성/반응형/다크모드 점검 미완료

### 🔧 구현 상세 계획

#### 공통 1: 오류/로딩/비어있는 상태 UI 정비

**목표**: 일관된 사용자 경험을 위해 모든 상태에 대한 UI를 표준화합니다.

**작업 내용**:

1. **로딩 상태 컴포넌트**
   - `components/LoadingSpinner.tsx` 생성
   - 페이지별 로딩 스켈레톤 생성
   - 버튼 로딩 상태 표시

2. **에러 상태 컴포넌트**
   - `components/ErrorState.tsx` 생성
   - 재시도 기능 포함
   - 에러 메시지 표시

3. **빈 상태 컴포넌트**
   - `components/EmptyState.tsx` 생성
   - 상황별 아이콘 및 메시지
   - 액션 버튼 제공

**파일 구조**:
```
components/
  LoadingSpinner.tsx           # 로딩 스피너
  LoadingSkeleton.tsx          # 로딩 스켈레톤
  ErrorState.tsx               # 에러 상태
  EmptyState.tsx               # 빈 상태
```

**예상 소요 시간**: 2-3시간

---

#### 공통 2: 타입 안전성 강화 (Zod + react-hook-form)

**목표**: 폼 입력에 대한 타입 안전성을 강화하고 런타임 검증을 추가합니다.

**작업 내용**:

1. **Zod 스키마 정의**
   - 주문 폼 스키마 (`schemas/order.ts`)
   - 장바구니 수량 스키마
   - 기타 폼 스키마

2. **react-hook-form 통합**
   - 기존 폼에 react-hook-form 적용
   - 에러 메시지 표시
   - 검증 로직 통합

**파일 구조**:
```
schemas/
  order.ts                     # 주문 폼 스키마
  cart.ts                      # 장바구니 스키마
app/checkout/
  checkout-form.tsx            # react-hook-form 적용
```

**예상 소요 시간**: 2-3시간

---

#### 공통 3: README/PRD 반영, 운영 가이드 업데이트

**목표**: 프로젝트의 현재 상태를 문서화하고 운영 가이드를 작성합니다.

**작업 내용**:

1. **README.md 작성**
   - 프로젝트 개요
   - 기술 스택
   - 설치 및 실행 방법
   - 환경 변수 설정
   - 배포 방법

2. **운영 가이드 작성** (`docs/OPERATION.md`)
   - 상품 등록 방법 (Supabase 대시보드)
   - 주문 관리 방법
   - 결제 테스트 방법
   - 트러블슈팅

3. **API 문서 작성** (선택적)
   - Server Actions 목록
   - API 라우트 목록

**파일 구조**:
```
README.md                      # 프로젝트 README
docs/
  OPERATION.md                 # 운영 가이드
  API.md                       # API 문서 (선택적)
```

**예상 소요 시간**: 2-3시간

---

#### 공통 4: 접근성/반응형/다크모드 점검

**목표**: 모든 사용자가 사용할 수 있도록 접근성과 반응형 디자인을 점검하고 다크모드를 지원합니다.

**작업 내용**:

1. **접근성 점검**
   - 키보드 네비게이션 확인
   - 스크린 리더 호환성 확인
   - ARIA 속성 추가
   - 색상 대비 확인

2. **반응형 디자인 점검**
   - 모바일/태블릿/데스크톱 레이아웃 확인
   - 터치 타겟 크기 확인
   - 이미지 반응형 처리 확인

3. **다크모드 지원**
   - Tailwind 다크모드 설정 확인
   - 다크모드 토글 버튼 추가
   - 색상 팔레트 점검

**파일 구조**:
```
components/
  ThemeToggle.tsx              # 다크모드 토글 버튼
app/
  globals.css                  # 다크모드 스타일 확인
```

**예상 소요 시간**: 3-4시간

---

### 📝 공통 작업 체크리스트

- [ ] 로딩 상태 컴포넌트 생성
- [ ] 에러 상태 컴포넌트 생성
- [ ] 빈 상태 컴포넌트 생성
- [ ] Zod 스키마 정의
- [ ] react-hook-form 통합
- [ ] README.md 작성
- [ ] 운영 가이드 작성
- [ ] 접근성 점검
- [ ] 반응형 디자인 점검
- [ ] 다크모드 지원

**총 예상 소요 시간**: 9-13시간

---

## 환경/리포지토리 기초 세팅

### 🎯 목표

프로젝트의 개발 환경과 리포지토리를 정비하여 협업과 유지보수를 용이하게 합니다.

### 📊 현재 상태

- ✅ 기본 프로젝트 구조 완료
- ❌ `.gitignore` / `.cursorignore` 정비 미완료
- ❌ `eslint.config.mjs` / 포맷터 설정 확정 미완료
- ❌ 아이콘/OG 이미지/파비콘 추가 미완료
- ❌ SEO 관련 파일 미완료

### 🔧 구현 상세 계획

#### 환경 1: `.gitignore` / `.cursorignore` 정비

**목표**: 불필요한 파일이 리포지토리에 포함되지 않도록 설정합니다.

**작업 내용**:

1. **`.gitignore` 확인 및 보완**
   - Node.js 관련 파일
   - 환경 변수 파일
   - 빌드 산출물
   - IDE 설정 파일
   - OS 관련 파일

2. **`.cursorignore` 생성** (없는 경우)
   - 대용량 파일 제외
   - 불필요한 디렉토리 제외

**파일 구조**:
```
.gitignore                     # Git 무시 파일
.cursorignore                  # Cursor 무시 파일
```

**예상 소요 시간**: 30분

---

#### 환경 2: `eslint.config.mjs` / 포맷터 설정 확정

**목표**: 코드 품질을 일관되게 유지하기 위한 린터와 포맷터 설정을 확정합니다.

**작업 내용**:

1. **ESLint 설정 확인**
   - Next.js 규칙 확인
   - TypeScript 규칙 확인
   - React 규칙 확인

2. **Prettier 설정 확인**
   - 포맷팅 규칙 확인
   - `.prettierrc` 파일 확인
   - `.prettierignore` 파일 확인

3. **Pre-commit 훅 설정** (선택적)
   - Husky 설정
   - lint-staged 설정

**파일 구조**:
```
eslint.config.mjs              # ESLint 설정
.prettierrc                    # Prettier 설정
.prettierignore                # Prettier 무시 파일
.husky/                        # Husky 훅 (선택적)
```

**예상 소요 시간**: 1시간

---

#### 환경 3: 아이콘/OG 이미지/파비콘 추가

**목표**: 브랜딩과 SEO를 위해 필요한 이미지 파일을 추가합니다.

**작업 내용**:

1. **파비콘 추가**
   - `app/favicon.ico` 생성
   - 다양한 크기 아이콘 생성 (선택적)

2. **OG 이미지 생성**
   - `public/og-image.png` 생성
   - 소셜 미디어 공유용 이미지

3. **로고 이미지 추가**
   - `public/logo.png` 생성
   - 네비게이션 바에 사용

4. **아이콘 세트 추가** (선택적)
   - `public/icons/` 디렉토리 생성
   - PWA용 아이콘 세트

**파일 구조**:
```
app/
  favicon.ico                  # 파비콘
public/
  logo.png                     # 로고
  og-image.png                 # OG 이미지
  icons/                       # 아이콘 세트 (선택적)
```

**예상 소요 시간**: 1-2시간 (디자인 제외)

---

#### 환경 4: SEO 관련 파일 (`robots.ts`, `sitemap.ts`, `manifest.ts`)

**목표**: 검색 엔진 최적화와 PWA 지원을 위한 파일을 생성합니다.

**작업 내용**:

1. **`app/robots.ts` 생성**
   - 검색 엔진 크롤러 규칙 정의
   - 사이트맵 위치 지정

2. **`app/sitemap.ts` 생성**
   - 동적 사이트맵 생성
   - 주요 페이지 포함

3. **`app/manifest.ts` 생성**
   - PWA 매니페스트
   - 앱 이름, 아이콘, 테마 색상 등

4. **메타데이터 설정**
   - `app/layout.tsx`에서 메타데이터 설정
   - 각 페이지별 메타데이터 설정

**파일 구조**:
```
app/
  robots.ts                    # robots.txt 생성
  sitemap.ts                   # 사이트맵 생성
  manifest.ts                  # 매니페스트 생성
  layout.tsx                   # 메타데이터 설정 (수정)
```

**구현 예시**:
```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout/', '/orders/'],
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

**예상 소요 시간**: 1-2시간

---

### 📝 환경/리포지토리 기초 세팅 체크리스트

- [ ] `.gitignore` 정비
- [ ] `.cursorignore` 생성
- [ ] `eslint.config.mjs` 확인
- [ ] Prettier 설정 확인
- [ ] Pre-commit 훅 설정 (선택적)
- [ ] 파비콘 추가
- [ ] OG 이미지 생성
- [ ] 로고 이미지 추가
- [ ] `robots.ts` 생성
- [ ] `sitemap.ts` 생성
- [ ] `manifest.ts` 생성
- [ ] 메타데이터 설정

**총 예상 소요 시간**: 3.5-5.5시간

---

## 📊 전체 구현 일정 요약

| Phase | 작업 내용 | 예상 소요 시간 |
|-------|----------|---------------|
| Phase 4 | 결제 통합 (Toss Payments) | 8-12시간 |
| Phase 6 | 테스트 & 배포 | 7-11시간 |
| 공통 작업 | 문서화 및 UI 정비 | 9-13시간 |
| 환경 세팅 | 리포지토리 및 SEO 설정 | 3.5-5.5시간 |
| **총계** | | **27.5-41.5시간** |

---

## 🎯 우선순위별 구현 순서

### 우선순위 1 (필수)
1. Phase 4: 결제 통합
2. Phase 6: 테스트 & 배포

### 우선순위 2 (중요)
3. 공통 작업: 오류/로딩/빈 상태 UI 정비
4. 공통 작업: 타입 안전성 강화

### 우선순위 3 (개선)
5. 공통 작업: README/운영 가이드 작성
6. 공통 작업: 접근성/반응형/다크모드 점검
7. 환경 세팅: SEO 관련 파일

### 우선순위 4 (선택)
8. 환경 세팅: 아이콘/이미지 추가
9. 환경 세팅: Pre-commit 훅 설정

---

## 📝 다음 단계

1. 이 계획서를 검토하고 우선순위를 확정합니다.
2. Phase 4부터 순차적으로 구현을 시작합니다.
3. 각 Phase 완료 후 테스트를 수행하고 다음 단계로 진행합니다.
4. 모든 작업 완료 후 최종 검증을 수행합니다.

---

**작성일**: 2025-01-03  
**최종 수정일**: 2025-01-03  
**작성자**: AI Assistant
