# 구현 상세 가이드

> 쇼핑몰 MVP 구현에 필요한 모든 기술적 상세 정보

## 📋 목차

1. [데이터베이스 스키마](#데이터베이스-스키마)
2. [Server Actions 명세](#server-actions-명세)
3. [API Routes 명세](#api-routes-명세)
4. [컴포넌트 사용법](#컴포넌트-사용법)
5. [타입 정의](#타입-정의)
6. [환경 변수 설정](#환경-변수-설정)
7. [주요 유틸리티 함수](#주요-유틸리티-함수)

---

## 데이터베이스 스키마

### 테이블 구조

#### 1. `products` 테이블

상품 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category TEXT,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**컬럼 설명:**
- `id`: UUID (Primary Key)
- `name`: 상품명 (필수)
- `description`: 상품 설명 (선택)
- `price`: 가격 (DECIMAL(10,2), 0 이상)
- `category`: 카테고리 코드 (예: 'electronics', 'clothing')
- `stock_quantity`: 재고 수량 (기본값 0, 0 이상)
- `is_active`: 판매 활성화 여부 (기본값 true)
- `image_url`: 상품 이미지 URL (선택, TEXT 타입)
- `created_at`: 생성 일시 (TIMESTAMP WITH TIME ZONE)
- `updated_at`: 수정 일시 (TIMESTAMP WITH TIME ZONE, 자동 업데이트)

**인덱스:**
- `idx_products_category`: 카테고리별 조회 최적화
- `idx_products_is_active`: 활성 상품 조회 최적화

---

#### 2. `cart_items` 테이블

장바구니 항목을 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(clerk_id, product_id)
);
```

**컬럼 설명:**
- `id`: UUID (Primary Key)
- `clerk_id`: Clerk 사용자 ID (필수)
- `product_id`: 상품 ID (Foreign Key, CASCADE 삭제)
- `quantity`: 수량 (기본값 1, 0보다 커야 함)
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

**제약 조건:**
- `UNIQUE(clerk_id, product_id)`: 같은 사용자가 같은 상품을 중복 추가할 수 없음

**인덱스:**
- `idx_cart_items_clerk_id`: 사용자별 장바구니 조회 최적화
- `idx_cart_items_product_id`: 상품별 조회 최적화

---

#### 3. `orders` 테이블

주문 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'payment_failed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    order_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**컬럼 설명:**
- `id`: UUID (Primary Key)
- `clerk_id`: Clerk 사용자 ID (필수)
- `total_amount`: 총 주문 금액 (DECIMAL(10,2), 0 이상)
- `status`: 주문 상태
  - `pending`: 결제 대기 중
  - `paid`: 결제 완료
  - `payment_failed`: 결제 실패
  - `confirmed`: 확인됨
  - `shipped`: 배송 중
  - `delivered`: 배송 완료
  - `cancelled`: 취소됨
- `shipping_address`: 배송지 정보 (JSONB)
  ```json
  {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "postalCode": "12345",
    "address": "서울시 강남구 테헤란로 123",
    "addressDetail": "101호"
  }
  ```
- `order_note`: 주문 메모 (선택)
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

**인덱스:**
- `idx_orders_clerk_id`: 사용자별 주문 조회 최적화
- `idx_orders_status`: 상태별 조회 최적화
- `idx_orders_created_at`: 날짜순 조회 최적화

---

#### 4. `order_items` 테이블

주문 상세 항목을 저장하는 테이블입니다.

```sql
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**컬럼 설명:**
- `id`: UUID (Primary Key)
- `order_id`: 주문 ID (Foreign Key, CASCADE 삭제)
- `product_id`: 상품 ID (Foreign Key, RESTRICT 삭제)
- `product_name`: 상품명 (주문 시점의 상품명 저장)
- `quantity`: 수량 (0보다 커야 함)
- `price`: 단가 (주문 시점의 가격 저장)
- `created_at`: 생성 일시

**인덱스:**
- `idx_order_items_order_id`: 주문별 상세 항목 조회 최적화

**설계 이유:**
- `product_name`과 `price`를 저장하는 이유: 주문 후 상품 정보가 변경되어도 주문 시점의 정보를 보존하기 위함

---

### 마이그레이션 파일

마이그레이션 파일은 `supabase/migrations/` 디렉토리에 저장됩니다.

**파일 명명 규칙:** `YYYYMMDDHHmmss_description.sql`

**예시:**
- `20250103000001_add_payment_status.sql`: 주문 상태에 결제 관련 상태 추가

**마이그레이션 적용 방법:**

1. **Supabase Dashboard 사용:**
   - Supabase Dashboard → SQL Editor
   - 마이그레이션 파일 내용 복사
   - 실행

2. **Supabase CLI 사용:**
   ```bash
   supabase db push
   ```

---

## Server Actions 명세

Server Actions는 `actions/` 디렉토리에 저장됩니다.

### 장바구니 관련 Actions

#### `addToCart(productId: string, quantity: number = 1)`

장바구니에 상품을 추가합니다.

**파라미터:**
- `productId`: 상품 ID (UUID)
- `quantity`: 수량 (기본값 1)

**반환값:**
```typescript
{ success: true } | { error: string }
```

**동작:**
1. 사용자 인증 확인 (Clerk)
2. 상품 존재 및 활성화 여부 확인
3. 재고 수량 확인
4. 기존 장바구니 항목 확인
5. 기존 항목이 있으면 수량 증가, 없으면 새로 추가
6. 재고 부족 시 에러 반환

**사용 예시:**
```typescript
import { addToCart } from "@/actions/cart";

const result = await addToCart(productId, 1);
if (result.error) {
  console.error(result.error);
}
```

---

#### `updateCartItemQuantity(cartItemId: string, quantity: number)`

장바구니 항목의 수량을 변경합니다.

**파라미터:**
- `cartItemId`: 장바구니 항목 ID (UUID)
- `quantity`: 새로운 수량 (1 이상)

**반환값:**
```typescript
{ success: true } | { error: string }
```

**동작:**
1. 사용자 인증 확인
2. 장바구니 항목 소유자 확인
3. 재고 수량 확인
4. 수량 업데이트

---

#### `removeFromCart(cartItemId: string)`

장바구니에서 항목을 삭제합니다.

**파라미터:**
- `cartItemId`: 장바구니 항목 ID (UUID)

**반환값:**
```typescript
{ success: true } | { error: string }
```

**동작:**
1. 사용자 인증 확인
2. 장바구니 항목 소유자 확인
3. 항목 삭제

---

### 주문 관련 Actions

#### `createOrder(shippingAddress: ShippingAddress, orderNote?: string)`

주문을 생성합니다.

**파라미터:**
```typescript
interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
  postalCode: string;
}
```

- `shippingAddress`: 배송지 정보
- `orderNote`: 주문 메모 (선택)

**반환값:**
```typescript
{ success: true, orderId: string } | { error: string }
```

**동작:**
1. 사용자 인증 확인
2. 장바구니 항목 조회
3. 각 상품의 재고 및 활성화 상태 확인
4. 총 주문 금액 계산
5. 주문 생성 (트랜잭션)
6. 주문 상세 항목 생성
7. 장바구니 비우기
8. 주문 ID 반환

**에러 케이스:**
- 장바구니가 비어있음
- 재고 부족
- 판매 중지된 상품 포함
- 주문 생성 실패

---

### 결제 관련 Actions

#### `updateOrderPaymentStatus(orderId: string, paymentKey: string, amount: number)`

결제 완료 후 주문 상태를 업데이트합니다.

**파라미터:**
- `orderId`: 주문 ID (UUID)
- `paymentKey`: Toss Payments 결제 키
- `amount`: 결제 금액

**반환값:**
```typescript
{ success: true } | { error: string }
```

**동작:**
1. 사용자 인증 확인
2. 주문 조회 및 소유자 확인
3. 이미 결제 완료된 주문인지 확인
4. 결제 금액과 주문 금액 일치 확인
5. 주문 상태를 'paid'로 업데이트

---

#### `updateOrderPaymentFailed(orderId: string)`

결제 실패 시 주문 상태를 업데이트합니다.

**파라미터:**
- `orderId`: 주문 ID (UUID)

**반환값:**
```typescript
{ success: true } | { error: string }
```

**동작:**
1. 사용자 인증 확인
2. 주문 조회 및 소유자 확인
3. 주문 상태를 'payment_failed'로 업데이트

---

## API Routes 명세

API Routes는 `app/api/` 디렉토리에 저장됩니다.

### `/api/payment/success` (GET)

결제 성공 콜백을 처리합니다.

**쿼리 파라미터:**
- `paymentKey`: Toss Payments 결제 키
- `orderId`: 주문 ID
- `amount`: 결제 금액

**동작:**
1. 필수 파라미터 검증
2. 금액 파싱 및 검증
3. `updateOrderPaymentStatus` Server Action 호출
4. 성공 시 주문 상세 페이지로 리다이렉트
5. 실패 시 결제 실패 페이지로 리다이렉트

**리다이렉트:**
- 성공: `/orders/{orderId}`
- 실패: `/payment/fail?error={error}&orderId={orderId}`

---

### `/api/payment/fail` (GET)

결제 실패 콜백을 처리합니다.

**쿼리 파라미터:**
- `orderId`: 주문 ID
- `code`: 에러 코드 (선택)
- `message`: 에러 메시지 (선택)

**동작:**
1. 주문 ID 검증
2. `updateOrderPaymentFailed` Server Action 호출
3. 결제 실패 페이지로 리다이렉트

**리다이렉트:**
- `/payment/fail?orderId={orderId}&code={code}&message={message}`

---

## 컴포넌트 사용법

### 주요 컴포넌트

#### `PaymentWidget`

결제 위젯 컴포넌트입니다.

**Props:**
```typescript
interface PaymentWidgetProps {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  onSuccess: (paymentKey: string, orderId: string, amount: number) => void;
  onError: (error: Error) => void;
}
```

**사용 예시:**
```tsx
<PaymentWidget
  amount={totalAmount}
  orderId={orderId}
  orderName={`주문 #${orderId.slice(0, 8)}`}
  customerName={customerName}
  onSuccess={(paymentKey, orderId, amount) => {
    router.push(`/api/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`);
  }}
  onError={(error) => {
    setError(error.message);
  }}
/>
```

---

#### `ErrorBoundary`

에러 바운더리 컴포넌트입니다.

**사용 예시:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**커스텀 Fallback:**
```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

---

#### `LoadingSpinner`

로딩 스피너 컴포넌트입니다.

**Props:**
```typescript
interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}
```

**사용 예시:**
```tsx
<LoadingSpinner size="lg" text="로딩 중..." />
```

---

#### `EmptyState`

빈 상태 컴포넌트입니다.

**Props:**
```typescript
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}
```

**사용 예시:**
```tsx
<EmptyState
  icon={Package}
  title="주문 내역이 없습니다"
  description="상품을 주문해보세요."
  actionLabel="상품 둘러보기"
  actionHref="/products"
/>
```

---

## 타입 정의

### Product

```typescript
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### Order

```typescript
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: "pending" | "paid" | "payment_failed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
```

---

### Payment

```typescript
export type PaymentMethod = "카드" | "계좌이체" | "가상계좌" | "휴대폰";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface PaymentInfo {
  paymentKey: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
}
```

---

## 환경 변수 설정

### 필수 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정해야 합니다:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

### 환경 변수 획득 방법

#### Clerk
1. [Clerk Dashboard](https://dashboard.clerk.com/) 접속
2. 프로젝트 선택 → **API Keys**
3. Publishable Key와 Secret Key 복사

#### Supabase
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **Settings** → **API**
3. Project URL, anon public key, service_role secret key 복사

#### Toss Payments
1. [Toss Payments Dashboard](https://developers.toss.im/) 접속
2. 테스트 모드에서 Client Key와 Secret Key 생성

---

## 주요 유틸리티 함수

### `lib/utils/products.ts`

#### `formatPrice(price: number): string`

가격을 한국 원화 형식으로 포맷팅합니다.

**예시:**
```typescript
formatPrice(10000) // "₩10,000"
```

---

#### `getCategoryLabel(category: string): string`

카테고리 코드를 한글 라벨로 변환합니다.

**예시:**
```typescript
getCategoryLabel("electronics") // "전자제품"
```

---

#### `getAllCategories(): CategoryInfo[]`

모든 카테고리 정보를 반환합니다.

**반환값:**
```typescript
interface CategoryInfo {
  code: string;
  label: string;
}
```

---

#### `parseSortParam(sort?: string): { column: string; ascending: boolean }`

정렬 파라미터를 파싱합니다.

**지원하는 정렬 옵션:**
- `latest`: 최신순 (created_at DESC)
- `price_asc`: 가격 낮은순 (price ASC)
- `price_desc`: 가격 높은순 (price DESC)
- `name_asc`: 이름순 (name ASC)

---

## 데이터 흐름

### 주문 생성 플로우

```
1. 사용자가 장바구니에 상품 추가
   ↓
2. 체크아웃 페이지 접근 (/checkout)
   ↓
3. 배송지 정보 입력 및 주문 생성 (createOrder)
   ↓
4. 주문 생성 성공 → 결제 위젯 표시
   ↓
5. 결제 수단 선택 및 결제 요청
   ↓
6. Toss Payments 결제 처리
   ↓
7. 결제 성공 → /api/payment/success 콜백
   ↓
8. 주문 상태 업데이트 (updateOrderPaymentStatus)
   ↓
9. 주문 상세 페이지로 리다이렉트 (/orders/{orderId})
```

---

### 장바구니 관리 플로우

```
1. 상품 상세 페이지에서 "장바구니에 담기" 클릭
   ↓
2. addToCart Server Action 호출
   ↓
3. 재고 확인 및 장바구니에 추가
   ↓
4. 장바구니 페이지로 리다이렉트 (/cart)
   ↓
5. 수량 변경 또는 삭제 가능
```

---

## 보안 고려사항

### 인증 및 권한

1. **모든 Server Action에서 사용자 인증 확인**
   ```typescript
   const { userId } = await auth();
   if (!userId) {
     return { error: "인증이 필요합니다." };
   }
   ```

2. **소유자 확인**
   - 장바구니, 주문 조회 시 `clerk_id`로 필터링
   - 다른 사용자의 데이터 접근 방지

3. **재고 검증**
   - 장바구니 추가 시 재고 확인
   - 주문 생성 시 재고 재확인

4. **금액 검증**
   - 결제 금액과 주문 금액 일치 확인
   - 서버 사이드에서 검증

---

## 성능 최적화

### 데이터베이스 쿼리

1. **인덱스 활용**
   - 자주 조회되는 컬럼에 인덱스 생성
   - 복합 인덱스 사용 (예: `(clerk_id, created_at)`)

2. **페이지네이션**
   - 상품 목록: 페이지당 12개
   - `.range()` 메서드 사용

3. **선택적 필드 조회**
   - 필요한 필드만 `select()`로 조회
   - 불필요한 데이터 전송 방지

---

### 이미지 최적화

1. **Next.js Image 컴포넌트 사용**
   ```tsx
   <Image
     src={imageUrl}
     alt={productName}
     width={400}
     height={400}
     priority={priority}
   />
   ```

2. **플레이스홀더 처리**
   - 이미지 로딩 실패 시 기본 이미지 표시

---

## 에러 처리

### 에러 타입

1. **인증 에러**
   - 사용자가 로그인하지 않은 경우
   - 로그인 페이지로 리다이렉트

2. **검증 에러**
   - 재고 부족
   - 금액 불일치
   - 사용자에게 명확한 에러 메시지 표시

3. **시스템 에러**
   - 데이터베이스 연결 실패
   - 외부 API 오류
   - Error Boundary로 처리

---

## 테스트

### 테스트 시나리오

자세한 테스트 시나리오는 `docs/TEST_SCENARIOS.md`를 참고하세요.

**주요 테스트 항목:**
1. 정상 구매 플로우
2. 에러 케이스 (재고 부족, 결제 실패 등)
3. 성능 테스트
4. 반응형 디자인 테스트
5. 접근성 테스트

---

## 배포

### Vercel 배포

자세한 배포 가이드는 `docs/DEPLOYMENT.md`를 참고하세요.

**주요 단계:**
1. Vercel 프로젝트 생성
2. 환경 변수 설정
3. 빌드 및 배포
4. 배포 후 검증

---

---

## 실제 구현 코드 예제

### 상품 목록 페이지 전체 구현

**파일:** `app/products/page.tsx`

```typescript
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import ProductSortSelect from "@/components/ProductSortSelect";
import ProductPagination from "@/components/ProductPagination";
import ProductSearch from "@/components/ProductSearch";
import { getCategoryLabel, parseSortParam } from "@/lib/utils/products";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 12;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

async function getProducts(
  category?: string,
  sort?: string,
  page: number = 1,
  search?: string
): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const { column, ascending } = parseSortParam(sort);

  // 총 개수 조회
  let countQuery = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (category) {
    countQuery = countQuery.eq("category", category);
  }

  if (search && search.trim()) {
    countQuery = countQuery.ilike("name", `%${search.trim()}%`);
  }

  const { count } = await countQuery;

  // 상품 목록 조회
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order(column, { ascending })
    .range(from, to);

  if (category) {
    query = query.eq("category", category);
  }

  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }

  return {
    products: (data as Product[]) || [],
    total: count || 0,
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || "latest";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search;

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {search
                ? `"${search}" 검색 결과`
                : category
                ? getCategoryLabel(category)
                : "전체 상품"}
            </h1>
          </div>
          <Suspense fallback={<div className="h-9 w-[180px] bg-muted rounded animate-pulse" />}>
            <ProductSortSelect currentSort={sort} />
          </Suspense>
        </div>
        <Suspense fallback={<div className="h-10 w-full max-w-md bg-muted rounded animate-pulse" />}>
          <ProductSearch currentSearch={search} />
        </Suspense>
      </div>

      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsList category={category} sort={sort} page={page} search={search} />
      </Suspense>
    </main>
  );
}
```

---

### 장바구니 수량 변경 구현

**파일:** `app/cart/cart-item-list.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { updateCartQuantity, removeFromCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";

function CartItemCard({ item }: { item: CartItemWithProduct }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();
  const product = item.product as any;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > (product?.stock_quantity || 0)) {
      return;
    }

    setQuantity(newQuantity);
    startTransition(async () => {
      const result = await updateCartQuantity(item.id, newQuantity);
      if (result.error) {
        alert(result.error);
        setQuantity(item.quantity); // 롤백
      }
    });
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <h3>{product?.name}</h3>
        <p>{formatPrice(product?.price || 0)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isPending || quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              handleQuantityChange(val);
            }
          }}
          min={1}
          max={product?.stock_quantity || 0}
          className="w-16 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isPending || quantity >= (product?.stock_quantity || 0)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm("삭제하시겠습니까?")) {
              startTransition(async () => {
                await removeFromCart(item.id);
              });
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

### 결제 위젯 통합 예제

**파일:** `app/checkout/checkout-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/order";
import PaymentWidget from "@/components/PaymentWidget";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function CheckoutForm({ totalAmount }: { totalAmount: number }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    const result = await createOrder(
      {
        name: data.name,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail,
        postalCode: data.postalCode,
      },
      data.orderNote
    );

    if (result?.success && result.orderId) {
      setOrderId(result.orderId);
      setCustomerName(data.name);
    }
  };

  // 주문 생성 후 결제 위젯 표시
  if (orderId) {
    return (
      <div>
        <div className="p-6 border rounded-lg">
          <h2>주문이 생성되었습니다</h2>
          <p>주문 번호: {orderId}</p>
        </div>
        <PaymentWidget
          amount={totalAmount}
          orderId={orderId}
          orderName={`주문 #${orderId.slice(0, 8)}`}
          customerName={customerName}
          onSuccess={(paymentKey, orderId, amount) => {
            router.push(
              `/api/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`
            );
          }}
          onError={(error) => {
            setError(error.message);
          }}
        />
      </div>
    );
  }

  return <Form onSubmit={form.handleSubmit(onSubmit)}>...</Form>;
}
```

---

## 단계별 구현 체크리스트

### Phase 1: 기본 인프라
- [ ] Next.js 프로젝트 생성 및 설정
- [ ] TypeScript 설정
- [ ] Tailwind CSS v4 설정
- [ ] Clerk 계정 생성 및 연동
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 생성 및 마이그레이션 적용
- [ ] 환경 변수 설정
- [ ] 기본 레이아웃 구성

### Phase 2: 상품 기능
- [ ] 홈페이지 구현
- [ ] 상품 목록 페이지 구현
- [ ] 상품 검색 기능 구현
- [ ] 상품 정렬 기능 구현
- [ ] 페이지네이션 구현
- [ ] 상품 상세 페이지 구현
- [ ] 상품 이미지 컴포넌트 구현
- [ ] 관련 상품 추천 구현

### Phase 3: 장바구니 & 주문
- [ ] 장바구니 추가 기능 구현
- [ ] 장바구니 페이지 구현
- [ ] 장바구니 수량 변경 기능 구현
- [ ] 장바구니 삭제 기능 구현
- [ ] 주문 폼 구현
- [ ] 주문 생성 Server Action 구현
- [ ] 재고 검증 로직 구현

### Phase 4: 결제 통합
- [ ] Toss Payments SDK 설치
- [ ] 결제 위젯 컴포넌트 구현
- [ ] 결제 성공 콜백 API 구현
- [ ] 결제 실패 콜백 API 구현
- [ ] 결제 완료 후 주문 상태 업데이트 구현
- [ ] 결제 성공/실패 페이지 구현

### Phase 5: 마이페이지
- [ ] 주문 내역 목록 페이지 구현
- [ ] 주문 상세 페이지 구현
- [ ] 주문 상태 표시 구현

### Phase 6: 테스트 & 배포
- [ ] Error Boundary 구현
- [ ] 로딩 상태 컴포넌트 구현
- [ ] 빈 상태 컴포넌트 구현
- [ ] 404 페이지 구현
- [ ] 테스트 시나리오 작성
- [ ] Vercel 배포 설정

---

## 관련 문서

- **[구현 가이드](IMPLEMENTATION_GUIDE.md)**: Phase별 단계별 구현 가이드 및 코드 예제
- **[구현된 기능 목록](FEATURES.md)**: 구현 완료된 기능 요약
- **[테스트 시나리오](TEST_SCENARIOS.md)**: 테스트 가이드
- **[배포 가이드](DEPLOYMENT.md)**: Vercel 배포 상세 가이드

---

**작성일**: 2025-01-03  
**최종 수정일**: 2025-01-03
