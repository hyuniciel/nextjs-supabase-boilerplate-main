# Vercel 배포 체크리스트

배포 전에 다음 항목을 확인하세요.

## ✅ 사전 준비사항

- [ ] Vercel CLI 설치됨 (`vercel --version`)
- [ ] Vercel 계정 로그인됨 (`vercel login`)
- [ ] 프로젝트 빌드 성공 (`pnpm build`)
- [ ] Git 저장소에 커밋됨 (선택사항)

## 🔐 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 **모두** 설정해야 합니다:

### Clerk 인증
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (기본값: `/sign-in`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` (기본값: `/`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` (기본값: `/`)

### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STORAGE_BUCKET` (기본값: `uploads`)

### Toss Payments
- [ ] `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- [ ] `TOSS_SECRET_KEY`

**중요**: 모든 환경 변수는 **Production**, **Preview**, **Development** 환경 모두에 추가해야 합니다.

## 🚀 배포 실행

터미널에서 다음 명령어를 실행하세요:

```bash
# 프로젝트 디렉토리로 이동
cd c:\coding\1203_oz\nextjs-supabase-boilerplate-main

# 프로덕션 배포
vercel --prod
```

또는 자동 확인 없이 배포:

```bash
vercel --prod --yes
```

## 📋 배포 후 확인사항

배포가 완료되면 다음을 확인하세요:

- [ ] 배포 URL 접속 가능
- [ ] 홈페이지 정상 로드
- [ ] 회원가입/로그인 기능 작동
- [ ] 상품 목록 조회 가능
- [ ] 장바구니 기능 작동
- [ ] 주문 생성 가능
- [ ] 결제 플로우 작동 (테스트 모드)
- [ ] 주문 내역 확인 가능

## 🔍 유용한 명령어

```bash
# 배포 목록 확인
vercel ls

# 현재 프로젝트 정보
vercel project

# 환경 변수 목록 확인
vercel env ls

# 배포 로그 확인
vercel logs [deployment-url]

# 배포 상세 정보
vercel inspect [deployment-url]
```

## 🐛 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**
   ```bash
   vercel logs [deployment-url]
   ```

2. **로컬 빌드 테스트**
   ```bash
   pnpm build
   ```

3. **환경 변수 확인**
   - Vercel 대시보드에서 모든 환경 변수가 설정되었는지 확인
   - 환경 변수 이름이 정확한지 확인 (대소문자 구분)

### 빌드 에러 해결

**문제**: `Module not found` 또는 `Cannot find module`

**해결**:
```bash
rm -rf node_modules
pnpm install
pnpm build
```

**문제**: `Environment variable not found`

**해결**:
1. Vercel 대시보드에서 환경 변수 확인
2. Production 환경에 설정되었는지 확인
3. 환경 변수 이름이 정확한지 확인

## 📚 참고 문서

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [환경 변수 설정](https://vercel.com/docs/projects/environment-variables)
- [배포 가이드](./docs/DEPLOYMENT.md)
- [Vercel CLI 배포 가이드](./docs/VERCEL_DEPLOYMENT.md)
