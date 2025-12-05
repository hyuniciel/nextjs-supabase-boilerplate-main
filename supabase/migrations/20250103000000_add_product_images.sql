-- 상품 이미지 기능 추가
-- products 테이블에 image_url 컬럼 추가

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 기존 상품에 플레이스홀더 이미지 URL 추가 (선택적)
-- UPDATE public.products SET image_url = 'https://via.placeholder.com/400' WHERE image_url IS NULL;

-- 이미지 URL에 대한 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_products_image_url ON public.products(image_url) WHERE image_url IS NOT NULL;

