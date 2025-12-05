# 프로젝트 디렉토리 구조

> Next.js 15 + Clerk + Supabase 기반 쇼핑몰 MVP 프로젝트 구조

```
.
├── .cursor/                    # Cursor IDE 설정
│   ├── rules/                  # Cursor 규칙 파일들
│   │   ├── common/            # 공통 규칙
│   │   ├── supabase/          # Supabase 관련 규칙
│   │   └── web/               # 웹 프론트엔드 규칙
│   ├── mcp.json               # MCP 서버 설정
│   └── dir.md                 # 이 파일
│
├── .github/                    # GitHub 설정
│   └── workflows/             # GitHub Actions 워크플로우
│
├── .husky/                     # Git hooks
│   └── pre-commit             # 커밋 전 실행 스크립트
│
├── actions/                    # Server Actions
│   ├── cart.ts                # 장바구니 관련 액션
│   ├── order.ts               # 주문 관련 액션
│   └── payment.ts             # 결제 관련 액션
│
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── payment/           # 결제 콜백 처리
│   │   │   ├── success/      # 결제 성공
│   │   │   └── fail/         # 결제 실패
│   │   └── sync-user/        # 사용자 동기화
│   │
│   ├── cart/                  # 장바구니 페이지
│   │   ├── cart-item-list.tsx # 장바구니 아이템 리스트
│   │   └── page.tsx          # 장바구니 페이지
│   │
│   ├── checkout/              # 결제 페이지
│   │   ├── checkout-form.tsx  # 결제 폼
│   │   └── page.tsx          # 결제 페이지
│   │
│   ├── orders/                # 주문 내역
│   │   ├── [id]/             # 주문 상세
│   │   │   └── page.tsx
│   │   └── page.tsx          # 주문 목록
│   │
│   ├── payment/               # 결제 결과 페이지
│   │   ├── success/          # 결제 성공
│   │   └── fail/             # 결제 실패
│   │
│   ├── products/             # 상품 페이지
│   │   ├── [id]/            # 상품 상세
│   │   │   ├── add-to-cart-button.tsx
│   │   │   ├── page.tsx
│   │   │   └── related-products.tsx
│   │   └── page.tsx         # 상품 목록
│   │
│   ├── sign-in/              # 로그인 페이지
│   ├── sign-up/              # 회원가입 페이지
│   │
│   ├── favicon.ico           # 파비콘
│   ├── globals.css           # 전역 스타일
│   ├── layout.tsx            # 루트 레이아웃
│   ├── manifest.ts           # PWA 매니페스트
│   ├── not-found.tsx         # 404 페이지
│   ├── page.tsx             # 홈페이지
│   ├── robots.ts             # robots.txt
│   └── sitemap.ts            # sitemap.xml
│
├── components/               # React 컴포넌트
│   ├── providers/           # Context Providers
│   │   ├── error-boundary-provider.tsx
│   │   └── sync-user-provider.tsx
│   │
│   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   │
│   ├── CategoryCard.tsx     # 카테고리 카드
│   ├── EmptyState.tsx        # 빈 상태 컴포넌트
│   ├── ErrorBoundary.tsx    # 에러 바운더리
│   ├── FeaturedProducts.tsx # 추천 상품
│   ├── LoadingSpinner.tsx   # 로딩 스피너
│   ├── Navbar.tsx           # 네비게이션 바
│   ├── PaymentWidget.tsx    # 결제 위젯
│   ├── ProductCard.tsx      # 상품 카드
│   ├── ProductImage.tsx     # 상품 이미지
│   ├── ProductPagination.tsx # 페이지네이션
│   ├── ProductSearch.tsx    # 상품 검색
│   └── ProductSortSelect.tsx # 정렬 선택
│
├── docs/                     # 문서
│   ├── DEPLOYMENT.md        # 배포 가이드
│   ├── DEPLOYMENT_STATUS.md # 배포 상태
│   ├── DIR.md               # 디렉토리 구조 (레거시)
│   ├── FEATURES.md          # 구현된 기능 목록
│   ├── IMPLEMENTATION_DETAILS.md # 구현 상세
│   ├── IMPLEMENTATION_GUIDE.md   # 구현 가이드
│   ├── IMPLEMENTATION_PLAN.md    # 구현 계획
│   ├── PHASE2_ENHANCEMENT_PLAN.md # Phase 2 계획
│   ├── PRD.md               # 제품 요구사항 문서
│   ├── TEST_SCENARIOS.md    # 테스트 시나리오
│   ├── TODO.md              # 할 일 목록
│   └── VERCEL_DEPLOYMENT.md # Vercel 배포 가이드
│
├── hooks/                    # 커스텀 React Hooks
│   └── use-sync-user.ts     # 사용자 동기화 훅
│
├── lib/                      # 유틸리티 및 라이브러리
│   ├── supabase/            # Supabase 클라이언트
│   │   ├── clerk-client.ts  # Clerk 인증 클라이언트
│   │   ├── client.ts        # 공개 클라이언트
│   │   ├── server.ts        # 서버 클라이언트
│   │   └── service-role.ts # 서비스 롤 클라이언트
│   │
│   ├── utils/               # 유틸리티 함수
│   │   └── products.ts     # 상품 관련 유틸
│   │
│   ├── supabase.ts         # 레거시 Supabase 클라이언트
│   └── utils.ts            # 공통 유틸리티 (cn 함수 등)
│
├── public/                   # 정적 파일
│   ├── icons/               # PWA 아이콘
│   │   ├── icon-192x192.png
│   │   ├── icon-256x256.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── logo.png            # 로고
│   └── og-image.png         # OG 이미지
│
├── scripts/                  # 스크립트
│   ├── deploy-checklist.md # 배포 체크리스트
│   └── deploy-to-vercel.sh  # 배포 스크립트
│
├── supabase/                # Supabase 설정
│   ├── migrations/          # 데이터베이스 마이그레이션
│   │   ├── db.sql          # 메인 스키마
│   │   ├── setup_schema.sql
│   │   └── setup_storage.sql
│   └── config.toml          # Supabase 설정
│
├── types/                    # TypeScript 타입 정의
│   ├── cart.ts              # 장바구니 타입
│   ├── env.d.ts             # 환경 변수 타입
│   ├── order.ts             # 주문 타입
│   ├── payment.ts           # 결제 타입
│   └── product.ts           # 상품 타입
│
├── .cursorignore            # Cursor 무시 파일
├── .gitignore               # Git 무시 파일
├── .prettierignore          # Prettier 무시 파일
├── .prettierrc              # Prettier 설정
├── AGENTS.md                # AI 에이전트 가이드
├── CLAUDE.md                # Claude 가이드 (레거시)
├── components.json          # shadcn/ui 설정
├── deploy.ps1               # PowerShell 배포 스크립트
├── eslint.config.mjs        # ESLint 설정
├── middleware.ts            # Next.js 미들웨어
├── next.config.ts           # Next.js 설정
├── package.json             # 패키지 의존성
├── postcss.config.mjs       # PostCSS 설정
├── README.md                 # 프로젝트 README
├── tsconfig.json            # TypeScript 설정
└── vercel.json              # Vercel 배포 설정
```

## 주요 디렉토리 설명

### `app/`
Next.js 15 App Router를 사용한 라우팅 및 페이지 컴포넌트. 각 디렉토리가 라우트를 나타냅니다.

### `actions/`
Server Actions로, 서버 사이드에서 실행되는 함수들입니다. 클라이언트에서 직접 호출 가능합니다.

### `components/`
재사용 가능한 React 컴포넌트들입니다. `ui/`는 shadcn/ui 컴포넌트, `providers/`는 Context Provider들입니다.

### `lib/`
유틸리티 함수 및 외부 라이브러리 클라이언트 설정입니다. Supabase 클라이언트는 환경별로 분리되어 있습니다.

### `types/`
TypeScript 타입 정의 파일들입니다. 데이터베이스 스키마와 일치하도록 유지됩니다.

### `supabase/migrations/`
데이터베이스 마이그레이션 파일들입니다. 타임스탬프 기반으로 순서가 결정됩니다.

## 파일 명명 규칙

- **컴포넌트**: PascalCase (예: `ProductCard.tsx`)
- **파일명**: kebab-case (예: `cart-item-list.tsx`)
- **함수/변수**: camelCase
- **타입/인터페이스**: PascalCase
- **상수**: UPPER_SNAKE_CASE

## 참고 문서

- [AGENTS.md](../AGENTS.md) - 프로젝트 기술 스택 및 가이드
- [docs/IMPLEMENTATION_GUIDE.md](../docs/IMPLEMENTATION_GUIDE.md) - 구현 가이드
- [docs/PRD.md](../docs/PRD.md) - 제품 요구사항 문서
