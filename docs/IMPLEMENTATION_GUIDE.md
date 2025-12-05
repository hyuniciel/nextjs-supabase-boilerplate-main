# 구현 가이드

> PRD.md와 TODO.md를 기반으로 한 단계별 구현 가이드

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [Phase별 구현 가이드](#phase별-구현-가이드)
3. [핵심 기능 구현 상세](#핵심-기능-구현-상세)
4. [파일 구조 및 의존성](#파일-구조-및-의존성)
5. [코드 예제](#코드-예제)
6. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

### 목표
쇼핑몰 MVP를 구현하여 최소 기능으로 빠른 시장 검증을 수행합니다.

### 핵심 가치
- 옷 판매에 집중한 단순 명료한 쇼핑 경험
- 빠른 로그인/회원가입, 간편한 결제 프로세스

### 기술 스택
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **인증**: Clerk
- **데이터베이스**: Supabase (PostgreSQL)
- **결제**: Toss Payments (테스트 모드)
- **패키지 매니저**: pnpm

---

## Phase별 구현 가이드

### Phase 1: 기본 인프라

#### 1.1 Next.js 프로젝트 셋업

**필수 패키지 설치:**

```bash
pnpm add next@15.5.6 react@^19.0.0 react-dom@^19.0.0
pnpm add -D typescript @types/react @types/node
pnpm add -D tailwindcss@^4 @tailwindcss/postcss
pnpm add -D eslint eslint-config-next
```

**프로젝트 구조:**
```
app/
  layout.tsx          # Root Layout
  page.tsx            # 홈페이지
  globals.css         # Tailwind 설정
```

**주요 설정 파일:**

1. **`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

2. **`app/globals.css`** (Tailwind CSS v4)
```css
@import "tailwindcss";

@theme {
  /* 커스텀 테마 설정 */
}
```

---

#### 1.2 Clerk 연동

**패키지 설치:**
```bash
pnpm add @clerk/nextjs@^6.35.6 @clerk/localizations@^3.26.3
```

**환경 변수 설정:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

**구현 파일:**

1. **`app/layout.tsx`**
```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

2. **`middleware.ts`**
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/cart(.*)",
  "/checkout(.*)",
  "/orders(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

#### 1.3 Supabase 연동

**패키지 설치:**
```bash
pnpm add @supabase/ssr@^0.8.0 @supabase/supabase-js@^2.49.8
```

**환경 변수 설정:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Supabase 클라이언트 파일:**

1. **`lib/supabase/server.ts`** (Server Component용)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClerkSupabaseClient } from "./clerk-client";

export async function createClient() {
  return createClerkSupabaseClient();
}
```

2. **`lib/supabase/service-role.ts`** (관리자 권한용)
```typescript
import { createClient } from "@supabase/supabase-js";

export function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

---

#### 1.4 데이터베이스 스키마 생성

**마이그레이션 파일:** `supabase/migrations/db.sql`

**주요 테이블:**
- `products`: 상품 정보
- `cart_items`: 장바구니
- `orders`: 주문
- `order_items`: 주문 상세

**적용 방법:**
1. Supabase Dashboard → SQL Editor
2. 마이그레이션 파일 내용 복사 및 실행

---

### Phase 2: 상품 기능

#### 2.1 홈페이지 구현

**파일:** `app/page.tsx`

**주요 기능:**
- 히어로 섹션
- 카테고리 그리드
- 인기 상품 섹션

**구현 예시:**
```typescript
export default async function Home() {
  return (
    <main>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <h1>쇼핑몰에 오신 것을 환영합니다</h1>
          <Link href="/products">
            <Button>전체 상품 보기</Button>
          </Link>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="container mx-auto px-4 py-16">
        <CategoryGrid />
      </section>

      {/* 인기 상품 섹션 */}
      <FeaturedProducts />
    </main>
  );
}
```

**의존 컴포넌트:**
- `components/CategoryCard.tsx`
- `components/FeaturedProducts.tsx`

---

#### 2.2 상품 목록 페이지 구현

**파일:** `app/products/page.tsx`

**주요 기능:**
- 페이지네이션 (페이지당 12개)
- 카테고리 필터링
- 정렬 (최신순, 가격순, 이름순)
- 검색 기능

**URL 쿼리 파라미터:**
- `?category=electronics` - 카테고리 필터
- `?sort=price_asc` - 정렬 옵션
- `?page=2` - 페이지 번호
- `?search=이어폰` - 검색어

**구현 핵심:**

1. **상품 조회 함수:**
```typescript
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

  // 상품 목록 조회 (페이지네이션)
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

  const { data } = await query;

  return {
    products: (data as Product[]) || [],
    total: count || 0,
  };
}
```

2. **검색 컴포넌트:** `components/ProductSearch.tsx`
   - URL 쿼리 파라미터와 동기화
   - 실시간 검색 (useTransition 사용)
   - 검색어 초기화 기능

3. **정렬 컴포넌트:** `components/ProductSortSelect.tsx`
   - 드롭다운으로 정렬 옵션 선택
   - URL 쿼리 파라미터 업데이트

4. **페이지네이션 컴포넌트:** `components/ProductPagination.tsx`
   - 현재 페이지 하이라이트
   - 이전/다음 페이지 버튼
   - 페이지 번호 표시

---

#### 2.3 상품 상세 페이지 구현

**파일:** `app/products/[id]/page.tsx`

**주요 기능:**
- 상품 기본 정보 표시
- 재고 상태 표시
- 장바구니 추가 버튼
- 관련 상품 추천

**구현 예시:**
```typescript
export default async function ProductDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!product) {
    notFound();
  }

  const isInStock = product.stock_quantity > 0;

  return (
    <main>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <ProductImage imageUrl={product.image_url} alt={product.name} />

        {/* 상품 정보 */}
        <div>
          <h1>{product.name}</h1>
          <p>{formatPrice(product.price)}</p>
          <AddToCartButton productId={product.id} isInStock={isInStock} />
        </div>
      </div>

      {/* 관련 상품 */}
      <RelatedProducts productId={product.id} category={product.category} />
    </main>
  );
}
```

**의존 컴포넌트:**
- `components/ProductImage.tsx`: 이미지 최적화 및 플레이스홀더
- `app/products/[id]/add-to-cart-button.tsx`: 장바구니 추가 기능
- `app/products/[id]/related-products.tsx`: 관련 상품 추천

---

### Phase 3: 장바구니 & 주문

#### 3.1 장바구니 기능 구현

**파일:** `app/cart/page.tsx`, `app/cart/cart-item-list.tsx`

**주요 기능:**
- 장바구니 항목 조회
- 수량 변경
- 항목 삭제
- 총액 계산

**Server Actions:** `actions/cart.ts`

**구현 예시:**

1. **장바구니 페이지:**
```typescript
export default async function CartPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = getServiceRoleClient();
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:products!inner (
        id, name, price, stock_quantity, is_active
      )
    `)
    .eq("clerk_id", userId);

  const totalAmount = cartItems?.reduce((sum, item) => {
    const product = item.product as any;
    return sum + (product?.price || 0) * item.quantity;
  }, 0) || 0;

  return (
    <main>
      {cartItems?.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <CartItemList items={cartItems} />
          <div>총 주문 금액: {formatPrice(totalAmount)}</div>
          <Link href="/checkout">
            <Button>주문하기</Button>
          </Link>
        </>
      )}
    </main>
  );
}
```

2. **장바구니 항목 수량 변경:**
```typescript
// actions/cart.ts
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
) {
  const { userId } = await auth();
  if (!userId) return { error: "인증이 필요합니다." };

  const supabase = getServiceRoleClient();

  // 재고 확인
  const { data: cartItem } = await supabase
    .from("cart_items")
    .select("product_id")
    .eq("id", cartItemId)
    .eq("clerk_id", userId)
    .single();

  const { data: product } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", cartItem.product_id)
    .single();

  if (quantity > product.stock_quantity) {
    return { error: "재고가 부족합니다." };
  }

  // 수량 업데이트
  await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("clerk_id", userId);

  revalidatePath("/cart");
  return { success: true };
}
```

---

#### 3.2 주문 생성 구현

**파일:** `app/checkout/page.tsx`, `app/checkout/checkout-form.tsx`

**주요 기능:**
- 배송지 정보 입력 폼
- 주문 요약 표시
- 주문 생성 (재고 검증 포함)

**Server Action:** `actions/order.ts`

**구현 흐름:**

1. **체크아웃 페이지:**
```typescript
export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = getServiceRoleClient();
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:products!inner (
        id, name, price, stock_quantity, is_active
      )
    `)
    .eq("clerk_id", userId);

  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const product = item.product as any;
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <main>
      <CheckoutForm totalAmount={totalAmount} />
      <OrderSummary cartItems={cartItems} totalAmount={totalAmount} />
    </main>
  );
}
```

2. **주문 폼 (react-hook-form + Zod):**
```typescript
const checkoutSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요"),
  postalCode: z.string().min(1, "우편번호를 입력해주세요"),
  address: z.string().min(1, "주소를 입력해주세요"),
  addressDetail: z.string().optional(),
  orderNote: z.string().optional(),
});

export default function CheckoutForm({ totalAmount }: { totalAmount: number }) {
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
    return <PaymentWidget ... />;
  }

  return <Form>...</Form>;
}
```

3. **주문 생성 Server Action:**
```typescript
export async function createOrder(
  shippingAddress: ShippingAddress,
  orderNote?: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "인증이 필요합니다." };

  const supabase = getServiceRoleClient();

  // 장바구니 항목 조회
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:products!inner (
        id, name, price, stock_quantity, is_active
      )
    `)
    .eq("clerk_id", userId);

  // 재고 검증 및 총액 계산
  let totalAmount = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const product = item.product as any;

    // 재고 확인
    if (item.quantity > product.stock_quantity) {
      return { error: `재고 부족: ${product.name}` };
    }

    // 활성화 확인
    if (!product.is_active) {
      return { error: `판매 중지: ${product.name}` };
    }

    totalAmount += product.price * item.quantity;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // 주문 생성
  const { data: order } = await supabase
    .from("orders")
    .insert({
      clerk_id: userId,
      total_amount: totalAmount,
      status: "pending",
      shipping_address: shippingAddress,
      order_note: orderNote || null,
    })
    .select()
    .single();

  // 주문 상세 항목 생성
  await supabase.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
    }))
  );

  // 장바구니 비우기
  await supabase.from("cart_items").delete().eq("clerk_id", userId);

  revalidatePath("/cart");
  revalidatePath("/orders");

  return { success: true, orderId: order.id };
}
```

---

### Phase 4: 결제 통합

#### 4.1 Toss Payments SDK 설치

**패키지 설치:**
```bash
pnpm add @tosspayments/payment-sdk
```

**환경 변수 설정:**
```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

---

#### 4.2 결제 위젯 구현

**파일:** `components/PaymentWidget.tsx`

**구현 예시:**
```typescript
"use client";

import { loadTossPayments } from "@tosspayments/payment-sdk";
import { useEffect, useState } from "react";

export default function PaymentWidget({
  amount,
  orderId,
  orderName,
  customerName,
  onSuccess,
  onError,
}: PaymentWidgetProps) {
  const [tossPayments, setTossPayments] = useState<any>(null);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    loadTossPayments(clientKey!)
      .then((sdk) => setTossPayments(sdk))
      .catch((error) => onError(error));
  }, []);

  const handlePayment = async (method: PaymentMethod) => {
    try {
      await tossPayments.requestPayment(method, {
        amount,
        orderId,
        orderName,
        customerName,
        successUrl: `${window.location.origin}/api/payment/success?orderId=${orderId}`,
        failUrl: `${window.location.origin}/api/payment/fail?orderId=${orderId}`,
      });
    } catch (error: any) {
      if (error.code !== "USER_CANCEL") {
        onError(error);
      }
    }
  };

  return (
    <div>
      <Button onClick={() => handlePayment("카드")}>카드 결제</Button>
      {/* 기타 결제 수단 */}
    </div>
  );
}
```

---

#### 4.3 결제 콜백 처리

**파일:** `app/api/payment/success/route.ts`, `app/api/payment/fail/route.ts`

**구현 예시:**

1. **결제 성공 콜백:**
```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(`/payment/fail?error=missing_params&orderId=${orderId || ""}`, request.url)
    );
  }

  const result = await updateOrderPaymentStatus(
    orderId,
    paymentKey,
    parseInt(amount, 10)
  );

  if (result?.error) {
    return NextResponse.redirect(
      new URL(`/payment/fail?error=${result.error}&orderId=${orderId}`, request.url)
    );
  }

  return NextResponse.redirect(new URL(`/orders/${orderId}`, request.url));
}
```

2. **결제 실패 콜백:**
```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");

  await updateOrderPaymentFailed(orderId!);

  return NextResponse.redirect(
    new URL(`/payment/fail?orderId=${orderId}`, request.url)
  );
}
```

---

### Phase 5: 마이페이지

#### 5.1 주문 내역 조회

**파일:** `app/orders/page.tsx`

**구현 예시:**
```typescript
export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = getServiceRoleClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("clerk_id", userId)
    .order("created_at", { ascending: false });

  return (
    <main>
      {orders?.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {orders.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id}>
              <div>
                <p>주문 번호: {order.id.slice(0, 8)}</p>
                <p>상태: {order.status}</p>
                <p>금액: {formatPrice(order.total_amount)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
```

---

#### 5.2 주문 상세 보기

**파일:** `app/orders/[id]/page.tsx`

**구현 예시:**
```typescript
export default async function OrderDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const supabase = getServiceRoleClient();

  // 주문 조회 (소유자 확인)
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("clerk_id", userId)
    .single();

  if (!order) notFound();

  // 주문 상세 항목 조회
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return (
    <main>
      <h1>주문 상세</h1>
      <div>주문 번호: {order.id}</div>
      <div>상태: {order.status}</div>
      <div>배송지: {order.shipping_address.name}</div>
      <div>
        {orderItems?.map((item) => (
          <div key={item.id}>
            {item.product_name} × {item.quantity}
          </div>
        ))}
      </div>
      <div>총액: {formatPrice(order.total_amount)}</div>
    </main>
  );
}
```

---

## 핵심 기능 구현 상세

### 상품 검색 기능

**구현 위치:** `components/ProductSearch.tsx`

**핵심 로직:**
```typescript
const handleSearch = (value: string) => {
  startTransition(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    
    params.delete("page"); // 검색 시 페이지 리셋
    router.push(`/products?${params.toString()}`);
  });
};
```

**Supabase 쿼리:**
```typescript
if (search && search.trim()) {
  query = query.ilike("name", `%${search.trim()}%`);
}
```

**검색어 하이라이트:**
```typescript
function highlightSearchTerm(text: string, searchTerm?: string) {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm.trim()})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.trim().toLowerCase() ? (
          <mark key={index} className="bg-yellow-200">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
```

---

### 페이지네이션 구현

**구현 위치:** `components/ProductPagination.tsx`

**핵심 로직:**
```typescript
export default function ProductPagination({
  currentPage,
  totalPages,
  category,
  sort,
  search,
}: ProductPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        이전
      </Button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        다음
      </Button>
    </div>
  );
}
```

**Supabase 페이지네이션:**
```typescript
const PRODUCTS_PER_PAGE = 12;
const from = (page - 1) * PRODUCTS_PER_PAGE;
const to = from + PRODUCTS_PER_PAGE - 1;

query.range(from, to);
```

---

### 이미지 최적화

**구현 위치:** `components/ProductImage.tsx`

**구현 예시:**
```typescript
import Image from "next/image";

export default function ProductImage({
  imageUrl,
  alt,
  priority = false,
}: ProductImageProps) {
  const imageSrc = imageUrl || "/placeholder-product.png";

  return (
    <div className="aspect-square w-full relative overflow-hidden bg-muted">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={(e) => {
          // 이미지 로딩 실패 시 플레이스홀더 표시
          e.currentTarget.src = "/placeholder-product.png";
        }}
      />
    </div>
  );
}
```

---

## 파일 구조 및 의존성

### 전체 파일 구조

```
shopping-mall-mvp/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── success/
│   │       │   └── route.ts
│   │       └── fail/
│   │           └── route.ts
│   ├── cart/
│   │   ├── cart-item-list.tsx
│   │   └── page.tsx
│   ├── checkout/
│   │   ├── checkout-form.tsx
│   │   └── page.tsx
│   ├── orders/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.tsx
│   │   └── fail/
│   │       └── page.tsx
│   ├── products/
│   │   ├── [id]/
│   │   │   ├── add-to-cart-button.tsx
│   │   │   ├── related-products.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── back-button.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   └── globals.css
│
├── actions/
│   ├── cart.ts
│   ├── order.ts
│   └── payment.ts
│
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── providers/
│   │   ├── error-boundary-provider.tsx
│   │   └── sync-user-provider.tsx
│   ├── CategoryCard.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── FeaturedProducts.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   ├── PaymentWidget.tsx
│   ├── ProductCard.tsx
│   ├── ProductImage.tsx
│   ├── ProductPagination.tsx
│   ├── ProductSearch.tsx
│   └── ProductSortSelect.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── clerk-client.ts
│   │   ├── server.ts
│   │   ├── service-role.ts
│   │   └── client.ts
│   └── utils/
│       ├── products.ts
│       └── ...
│
├── types/
│   ├── cart.ts
│   ├── env.d.ts
│   ├── order.ts
│   ├── payment.ts
│   └── product.ts
│
├── supabase/
│   └── migrations/
│       ├── db.sql
│       └── 20250103000001_add_payment_status.sql
│
├── docs/
│   ├── FEATURES.md
│   ├── IMPLEMENTATION_DETAILS.md
│   ├── IMPLEMENTATION_GUIDE.md      # 이 문서
│   ├── TEST_SCENARIOS.md
│   ├── DEPLOYMENT.md
│   ├── PRD.md
│   └── TODO.md
│
├── middleware.ts
├── vercel.json
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

### 주요 의존성

**package.json 주요 패키지:**

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.35.6",
    "@clerk/localizations": "^3.26.3",
    "@hookform/resolvers": "^5.0.1",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.49.8",
    "@tosspayments/payment-sdk": "^latest",
    "next": "15.5.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.4",
    "zod": "^3.25.32",
    "lucide-react": "^0.511.0"
  }
}
```

---

## 코드 예제

### 상품 목록 조회 (필터링, 정렬, 검색, 페이지네이션)

```typescript
// app/products/page.tsx
async function getProducts(
  category?: string,
  sort?: string,
  page: number = 1,
  search?: string
): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const { column, ascending } = parseSortParam(sort);

  // 쿼리 빌더 패턴
  let countQuery = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // 카테고리 필터
  if (category) {
    countQuery = countQuery.eq("category", category);
  }

  // 검색 필터
  if (search && search.trim()) {
    countQuery = countQuery.ilike("name", `%${search.trim()}%`);
  }

  const { count } = await countQuery;

  // 페이지네이션 계산
  const PRODUCTS_PER_PAGE = 12;
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  // 상품 목록 조회
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order(column, { ascending })
    .range(from, to);

  // 필터 적용
  if (category) query = query.eq("category", category);
  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data } = await query;

  return {
    products: (data as Product[]) || [],
    total: count || 0,
  };
}
```

---

### 장바구니 추가 (재고 검증 포함)

```typescript
// actions/cart.ts
export async function addToCart(productId: string, quantity: number = 1) {
  const { userId } = await auth();
  if (!userId) return { error: "인증이 필요합니다." };

  const supabase = getServiceRoleClient();

  // 1. 상품 존재 및 활성화 확인
  const { data: product } = await supabase
    .from("products")
    .select("id, stock_quantity, is_active")
    .eq("id", productId)
    .single();

  if (!product) return { error: "상품을 찾을 수 없습니다." };
  if (!product.is_active) return { error: "판매 중지된 상품입니다." };

  // 2. 기존 장바구니 항목 확인
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("clerk_id", userId)
    .eq("product_id", productId)
    .single();

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  // 3. 재고 확인
  if (newQuantity > product.stock_quantity) {
    return {
      error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
    };
  }

  // 4. 장바구니에 추가 또는 업데이트
  await supabase.from("cart_items").upsert(
    {
      clerk_id: userId,
      product_id: productId,
      quantity: newQuantity,
    },
    { onConflict: "clerk_id,product_id" }
  );

  revalidatePath("/cart");
  return { success: true };
}
```

---

### 주문 생성 (트랜잭션 처리)

```typescript
// actions/order.ts
export async function createOrder(
  shippingAddress: ShippingAddress,
  orderNote?: string
) {
  const { userId } = await auth();
  if (!userId) return { error: "인증이 필요합니다." };

  const supabase = getServiceRoleClient();

  try {
    // 1. 장바구니 항목 조회
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products!inner (
          id, name, price, stock_quantity, is_active
        )
      `)
      .eq("clerk_id", userId);

    if (!cartItems || cartItems.length === 0) {
      return { error: "장바구니가 비어있습니다." };
    }

    // 2. 재고 검증 및 총액 계산
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.product as any;

      // 재고 확인
      if (item.quantity > product.stock_quantity) {
        return {
          error: `재고 부족: ${product.name} (재고: ${product.stock_quantity}개)`,
        };
      }

      // 활성화 확인
      if (!product.is_active) {
        return { error: `판매 중지: ${product.name}` };
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 3. 주문 생성
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: userId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress,
        order_note: orderNote || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return { error: "주문 생성에 실패했습니다." };
    }

    // 4. 주문 상세 항목 생성
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        }))
      );

    if (itemsError) {
      // 롤백: 주문 삭제
      await supabase.from("orders").delete().eq("id", order.id);
      return { error: "주문 상세 항목 생성에 실패했습니다." };
    }

    // 5. 장바구니 비우기
    await supabase.from("cart_items").delete().eq("clerk_id", userId);

    revalidatePath("/cart");
    revalidatePath("/orders");

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Create order error:", error);
    return { error: "주문 생성 중 오류가 발생했습니다." };
  }
}
```

---

## 트러블슈팅

### 일반적인 문제

#### 1. 환경 변수 오류

**문제:** `NEXT_PUBLIC_TOSS_CLIENT_KEY is undefined`

**해결:**
1. `.env.local` 파일 확인
2. 환경 변수 이름 확인 (대소문자 구분)
3. 개발 서버 재시작 (`pnpm dev`)

---

#### 2. Supabase 연결 실패

**문제:** `Failed to fetch` 또는 `Invalid API key`

**해결:**
1. Supabase URL과 키 확인
2. Supabase 프로젝트 활성화 상태 확인
3. 네트워크 방화벽 설정 확인

---

#### 3. Clerk 인증 실패

**문제:** 로그인 후 리다이렉트되지 않음

**해결:**
1. Clerk Dashboard에서 허용된 도메인 확인
2. `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` 확인
3. 미들웨어 설정 확인

---

#### 4. 결제 위젯 로드 실패

**문제:** `Toss Payments SDK 로드 실패`

**해결:**
1. `NEXT_PUBLIC_TOSS_CLIENT_KEY` 확인
2. 네트워크 연결 확인
3. Toss Payments 테스트 모드 확인

---

#### 5. 재고 검증 오류

**문제:** 재고가 있는데도 "재고 부족" 에러 발생

**해결:**
1. 데이터베이스에서 실제 재고 수량 확인
2. 동시 주문 처리 확인 (락 필요할 수 있음)
3. 서버 사이드 재고 확인 로직 점검

---

### 성능 최적화 팁

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - 적절한 `sizes` 속성 설정
   - `priority` 속성은 첫 화면 상품에만 사용

2. **데이터베이스 쿼리 최적화**
   - 필요한 필드만 `select()`로 조회
   - 인덱스 활용
   - 페이지네이션으로 데이터 양 제한

3. **캐싱 전략**
   - `revalidatePath()` 적절히 사용
   - 정적 데이터는 캐싱

---

## 배포 체크리스트

배포 전 확인 사항:

- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 마이그레이션 적용 완료
- [ ] Toss Payments 테스트 모드 확인
- [ ] 빌드 성공 확인 (`pnpm build`)
- [ ] 주요 플로우 테스트 완료
- [ ] 에러 처리 확인
- [ ] 반응형 디자인 확인

---

---

## 관련 문서

- **[구현 상세 가이드](IMPLEMENTATION_DETAILS.md)**: 데이터베이스 스키마, Server Actions, API Routes 등 기술적 상세 정보
- **[구현된 기능 목록](FEATURES.md)**: 구현 완료된 기능 요약
- **[테스트 시나리오](TEST_SCENARIOS.md)**: 테스트 가이드
- **[배포 가이드](DEPLOYMENT.md)**: Vercel 배포 상세 가이드

---

**작성일**: 2025-01-03  
**최종 수정일**: 2025-01-03
