-- ==========================================
-- 주문 상태에 결제 관련 상태 추가
-- 파일명: 20250103000001_add_payment_status.sql
-- ==========================================

-- orders 테이블의 status CHECK 제약 조건 수정
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'paid', 'payment_failed', 'confirmed', 'shipped', 'delivered', 'cancelled'));
