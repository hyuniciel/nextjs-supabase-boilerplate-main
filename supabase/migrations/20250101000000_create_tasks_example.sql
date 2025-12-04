-- 예제: Tasks 테이블 생성 (Clerk + Supabase 통합 예제)
-- 
-- 이 마이그레이션은 Clerk와 Supabase 통합의 모범 사례를 보여줍니다.
-- 공식 문서: https://clerk.com/docs/guides/development/integrations/databases/supabase
--
-- 주요 특징:
-- 1. user_id 컬럼이 auth.jwt()->>'sub' (Clerk user ID)를 기본값으로 사용
-- 2. RLS 정책으로 사용자별 데이터 접근 제한
-- 3. Clerk 세션 토큰의 'sub' 클레임으로 사용자 식별

-- Tasks 테이블 생성
CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 tasks만 조회 가능
CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.jwt()->>'sub') = user_id::text
    );

-- RLS 정책: 사용자는 자신의 tasks만 생성 가능
CREATE POLICY "Users can insert their own tasks"
    ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT auth.jwt()->>'sub') = user_id::text
    );

-- RLS 정책: 사용자는 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT auth.jwt()->>'sub') = user_id::text
    )
    WITH CHECK (
        (SELECT auth.jwt()->>'sub') = user_id::text
    );

-- RLS 정책: 사용자는 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    TO authenticated
    USING (
        (SELECT auth.jwt()->>'sub') = user_id::text
    );

-- 테이블 소유자 설정
ALTER TABLE public.tasks OWNER TO postgres;

-- 권한 부여
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE tasks_id_seq TO authenticated;

