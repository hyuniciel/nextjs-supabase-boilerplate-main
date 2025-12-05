# Phase 2 상품 기능 개선 계획

## 현재 완료된 기능

- ✅ 홈 페이지: 프로모션/카테고리 진입 동선
- ✅ 상품 목록 페이지: 페이지네이션/정렬/카테고리 필터
- ✅ 상품 상세 페이지: 재고/가격/설명 표시
- ✅ 어드민 상품 등록: 대시보드에서 수기 관리

## 개선 및 추가 기능 계획

### 1. 상품 검색 기능

**목표**: 사용자가 상품명으로 검색할 수 있는 기능 추가

**구현 내용**:
- 검색 입력 필드 추가 (`components/ProductSearch.tsx`)
- URL 쿼리 파라미터로 검색어 관리 (`?search=이어폰`)
- Supabase `ilike` 쿼리로 상품명 검색
- 검색 결과 하이라이트 표시
- 검색어와 카테고리 필터 동시 사용 가능

**기술 스택**:
- Server Component에서 검색 처리
- Supabase `.ilike()` 또는 `.textSearch()` 사용
- URL 쿼리 파라미터 통합

**파일 구조**:
```
components/
  ProductSearch.tsx          # 검색 입력 컴포넌트
app/products/
  page.tsx                   # 검색 파라미터 추가
lib/utils/
  products.ts                # 검색 관련 유틸리티 추가
```

**구현 순서**:
1. `ProductSearch` 컴포넌트 생성
2. 상품 목록 페이지에 검색 기능 통합
3. 검색 결과 표시 및 하이라이트

---

### 2. 상품 이미지 기능

**목표**: 상품에 이미지를 추가하고 표시할 수 있는 기능

**구현 내용**:
- `products` 테이블에 `image_url` 컬럼 추가 (마이그레이션)
- Supabase Storage를 사용한 이미지 업로드 (어드민용, 나중에)
- 상품 카드 및 상세 페이지에 이미지 표시
- 이미지 로딩 실패 시 플레이스홀더 표시
- Next.js Image 컴포넌트 사용 (최적화)

**데이터베이스 변경**:
```sql
-- 마이그레이션 파일: supabase/migrations/YYYYMMDDHHmmss_add_product_images.sql
ALTER TABLE products 
ADD COLUMN image_url TEXT;

-- 샘플 데이터 업데이트 (선택적)
UPDATE products SET image_url = 'https://via.placeholder.com/400' WHERE image_url IS NULL;
```

**파일 구조**:
```
supabase/migrations/
  YYYYMMDDHHmmss_add_product_images.sql
components/
  ProductImage.tsx           # 이미지 표시 컴포넌트
types/
  product.ts                 # Product 타입에 image_url 추가
```

**구현 순서**:
1. 마이그레이션 파일 생성 및 적용
2. Product 타입에 `image_url` 추가
3. `ProductImage` 컴포넌트 생성
4. `ProductCard` 및 상세 페이지에 이미지 적용

---

### 3. 상품 상세 페이지 개선

**목표**: 상품 상세 페이지의 정보 표시 개선

**구현 내용**:
- 상품 설명 섹션 개선 (마크다운 지원 고려)
- 관련 상품 추천 (같은 카테고리 상품)
- 상품 정보 탭 (상세 정보, 배송 정보 등)
- 이미지 갤러리 (여러 이미지 지원 시)
- 공유 기능 (URL 복사, SNS 공유)

**파일 구조**:
```
app/products/[id]/
  page.tsx                   # 상세 페이지 개선
  related-products.tsx        # 관련 상품 컴포넌트
components/
  ProductTabs.tsx             # 상품 정보 탭
  ShareButton.tsx             # 공유 버튼
```

**구현 순서**:
1. 상품 상세 페이지 레이아웃 개선
2. 관련 상품 컴포넌트 추가
3. 상품 정보 탭 추가
4. 공유 기능 추가

---

### 4. 홈페이지 프로모션 배너 개선

**목표**: 홈페이지의 프로모션 섹션을 더 매력적으로 개선

**구현 내용**:
- 프로모션 배너 슬라이더 (여러 배너 순환)
- 인기 상품 섹션 추가 (판매량 기반)
- 신상품 섹션 추가
- 할인 상품 섹션 추가 (가격 할인율 표시)

**데이터베이스 변경** (선택적):
```sql
-- products 테이블에 할인 관련 컬럼 추가
ALTER TABLE products 
ADD COLUMN discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN original_price DECIMAL(10,2);

-- 할인 가격 계산 함수
CREATE OR REPLACE FUNCTION calculate_discounted_price(
  base_price DECIMAL,
  discount_percent INTEGER
) RETURNS DECIMAL AS $$
BEGIN
  RETURN base_price * (1 - discount_percent / 100.0);
END;
$$ LANGUAGE plpgsql;
```

**파일 구조**:
```
app/
  page.tsx                   # 홈페이지 개선
components/
  PromotionBanner.tsx         # 프로모션 배너
  FeaturedProducts.tsx        # 인기 상품 섹션
  NewProducts.tsx             # 신상품 섹션
lib/utils/
  products.ts                # 할인 가격 계산 함수
```

**구현 순서**:
1. 프로모션 배너 컴포넌트 생성
2. 인기 상품 섹션 추가
3. 신상품 섹션 추가
4. 할인 상품 기능 추가 (선택적)

---

### 5. 상품 필터링 고급 기능

**목표**: 더 세밀한 상품 필터링 기능 추가

**구현 내용**:
- 가격 범위 필터 (최소/최대 가격)
- 재고 상태 필터 (재고 있음/품절)
- 여러 카테고리 동시 선택 (다중 선택)
- 필터 초기화 버튼
- 필터 상태 URL 쿼리 파라미터로 관리

**파일 구조**:
```
components/
  ProductFilters.tsx          # 고급 필터 컴포넌트
  PriceRangeFilter.tsx        # 가격 범위 필터
  StockFilter.tsx             # 재고 상태 필터
app/products/
  page.tsx                    # 필터 파라미터 통합
lib/utils/
  products.ts                 # 필터 관련 유틸리티
```

**구현 순서**:
1. 필터 컴포넌트들 생성
2. 상품 목록 페이지에 필터 통합
3. URL 쿼리 파라미터로 필터 상태 관리

---

## 우선순위별 구현 계획

### 우선순위 1 (핵심 기능)
1. **상품 검색 기능** - 사용자 경험 향상에 필수
2. **상품 이미지 기능** - 시각적 매력 향상

### 우선순위 2 (개선 기능)
3. **상품 상세 페이지 개선** - 정보 제공 강화
4. **홈페이지 프로모션 배너 개선** - 첫인상 개선

### 우선순위 3 (고급 기능)
5. **상품 필터링 고급 기능** - 탐색 경험 향상

---

## 구현 시 고려사항

### 성능 최적화
- 이미지 최적화 (Next.js Image 컴포넌트 사용)
- 검색 결과 캐싱 (필요 시)
- 페이지네이션과 필터 조합 시 성능 고려

### 사용자 경험
- 로딩 상태 표시
- 빈 상태 메시지 개선
- 에러 처리 강화
- 반응형 디자인 유지

### 데이터 일관성
- 이미지 URL 유효성 검증
- 검색어 입력 검증
- 필터 파라미터 검증

---

## 예상 개발 시간

- 상품 검색 기능: 2-3시간
- 상품 이미지 기능: 3-4시간
- 상품 상세 페이지 개선: 2-3시간
- 홈페이지 프로모션 배너 개선: 2-3시간
- 상품 필터링 고급 기능: 3-4시간

**총 예상 시간**: 12-17시간

---

## 성공 기준

- 검색 기능으로 상품을 빠르게 찾을 수 있음
- 상품 이미지가 정상적으로 표시됨
- 상품 상세 페이지에서 충분한 정보를 제공함
- 홈페이지가 사용자의 관심을 끌 수 있음
- 필터링으로 원하는 상품을 쉽게 찾을 수 있음

