# 배포 가이드

> Vercel을 사용한 프로덕션 배포 가이드

## 📋 사전 준비사항

1. **Vercel 계정 생성**
   - [Vercel](https://vercel.com)에 가입
   - GitHub 계정 연동 (권장)

2. **GitHub 리포지토리 준비**
   - 프로젝트를 GitHub에 푸시
   - Public 또는 Private 리포지토리 모두 가능

3. **환경 변수 준비**
   - 아래 환경 변수 목록 참고

---

## 🚀 배포 단계

### 1단계: Vercel 프로젝트 생성

1. Vercel 대시보드에서 "Add New Project" 클릭
2. GitHub 리포지토리 선택
3. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (자동 설정됨)
   - **Output Directory**: `.next` (자동 설정됨)
   - **Install Command**: `pnpm install` (자동 설정됨)

### 2단계: 환경 변수 설정

Vercel 대시보드의 "Environment Variables" 섹션에서 다음 환경 변수를 추가합니다:

#### Clerk 인증
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

#### Toss Payments
```
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

**중요**: 
- 모든 환경 변수는 **Production**, **Preview**, **Development** 환경 모두에 추가해야 합니다.
- 민감한 정보(Secret Key 등)는 절대 Git에 커밋하지 마세요.

### 3단계: 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 대기 (약 2-5분)

### 4단계: 배포 후 검증

배포가 완료되면 다음을 확인합니다:

1. **홈페이지 접속**
   - 배포된 URL로 접속
   - 페이지가 정상적으로 로드되는지 확인

2. **인증 테스트**
   - 회원가입/로그인 기능 테스트
   - 로그인 후 리다이렉트 확인

3. **주요 기능 테스트**
   - 상품 목록 조회
   - 장바구니 기능
   - 주문 생성
   - 결제 플로우 (테스트 모드)

4. **환경 변수 확인**
   - Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
   - Supabase 연결 확인
   - Clerk 인증 확인

---

## 🔧 커스텀 도메인 설정 (선택)

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" > "Domains" 메뉴로 이동
3. 도메인 추가
4. DNS 설정 안내에 따라 도메인 설정
5. SSL 인증서 자동 발급 대기 (약 1-2분)

---

## 🔄 재배포

### 자동 배포
- `main` 브랜치에 푸시하면 자동으로 재배포됩니다.
- Pull Request 생성 시 Preview 배포가 자동으로 생성됩니다.

### 수동 배포
1. Vercel 대시보드에서 프로젝트 선택
2. "Deployments" 탭에서 "Redeploy" 클릭

---

## 🐛 트러블슈팅

### 빌드 실패

**문제**: 빌드가 실패하는 경우

**해결 방법**:
1. 빌드 로그 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. `package.json`의 빌드 스크립트 확인
4. 로컬에서 `pnpm build` 실행하여 에러 확인

### 환경 변수 누락

**문제**: 환경 변수가 설정되지 않아 기능이 작동하지 않는 경우

**해결 방법**:
1. Vercel 대시보드에서 환경 변수 확인
2. 모든 환경 변수가 추가되었는지 확인
3. 환경 변수 이름이 정확한지 확인 (대소문자 구분)
4. 재배포 실행

### Supabase 연결 실패

**문제**: Supabase에 연결할 수 없는 경우

**해결 방법**:
1. Supabase URL과 키가 올바른지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 방화벽 설정 확인

### Clerk 인증 실패

**문제**: Clerk 인증이 작동하지 않는 경우

**해결 방법**:
1. Clerk 대시보드에서 API 키 확인
2. Vercel 환경 변수 확인
3. Clerk 대시보드에서 허용된 도메인 확인

---

## 📊 모니터링

### Vercel Analytics (선택)

1. Vercel 대시보드에서 프로젝트 선택
2. "Analytics" 탭 활성화
3. 웹사이트 성능 메트릭 확인

### 로그 확인

1. Vercel 대시보드에서 "Deployments" 탭 선택
2. 배포 항목 클릭
3. "Functions" 탭에서 서버 로그 확인

---

## 🔒 보안 체크리스트

배포 전 다음 사항을 확인하세요:

- [ ] 환경 변수가 Git에 커밋되지 않았는지 확인
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 환경에서 테스트 모드로만 결제가 진행되는지 확인
- [ ] Supabase RLS 정책이 올바르게 설정되었는지 확인 (프로덕션 환경)
- [ ] Clerk 대시보드에서 프로덕션 도메인이 허용되었는지 확인

---

## 📝 배포 후 체크리스트

- [ ] 홈페이지 정상 로드 확인
- [ ] 회원가입/로그인 기능 확인
- [ ] 상품 목록 조회 확인
- [ ] 장바구니 기능 확인
- [ ] 주문 생성 확인
- [ ] 결제 플로우 확인 (테스트 모드)
- [ ] 주문 내역 확인
- [ ] 모바일 반응형 확인
- [ ] 에러 페이지 확인 (404 등)

---

**작성일**: 2025-01-03  
**최종 수정일**: 2025-01-03
