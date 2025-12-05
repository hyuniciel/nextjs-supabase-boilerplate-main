# Vercel CLI 배포 가이드

> Vercel CLI를 사용한 프로덕션 배포 가이드

## 📋 사전 준비사항

1. **Vercel CLI 설치 확인**
   ```bash
   vercel --version
   ```

2. **Vercel 계정 로그인**
   ```bash
   vercel login
   ```

3. **환경 변수 준비**
   - `.env.local` 파일의 모든 환경 변수 확인
   - Vercel 대시보드에서 설정할 환경 변수 목록 준비

---

## 🚀 배포 단계

### 1단계: Vercel CLI 로그인

```bash
vercel login
```

브라우저가 열리면 Vercel 계정으로 로그인합니다.

---

### 2단계: 프로젝트 연결 (최초 배포 시)

```bash
vercel
```

다음 질문에 답변:
- **Set up and deploy?** → `Y`
- **Which scope?** → 본인의 Vercel 계정 선택
- **Link to existing project?** → `N` (새 프로젝트인 경우)
- **Project name?** → 프로젝트 이름 입력 (예: `shopping-mall-mvp`)
- **Directory?** → `.` (현재 디렉토리)
- **Override settings?** → `N` (기본 설정 사용)

---

### 3단계: 환경 변수 설정

**방법 1: Vercel CLI로 설정**

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_TOSS_CLIENT_KEY production
vercel env add TOSS_SECRET_KEY production
```

각 명령어 실행 시 값을 입력하라는 프롬프트가 나타납니다.

**방법 2: Vercel 대시보드에서 설정**

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 각 환경 변수 추가:
   - **Name**: 환경 변수 이름
   - **Value**: 환경 변수 값
   - **Environment**: Production, Preview, Development 모두 선택

---

### 4단계: 프로덕션 배포

```bash
vercel --prod
```

또는

```bash
vercel --prod --yes
```

**배포 과정:**
1. 프로젝트 빌드
2. 배포 파일 업로드
3. 배포 URL 생성

**배포 완료 후:**
- 배포 URL이 표시됩니다 (예: `https://your-project.vercel.app`)
- 배포 로그를 확인할 수 있습니다

---

## 🔍 배포 확인

### 배포 상태 확인

```bash
vercel ls
```

현재 프로젝트의 모든 배포 목록을 확인할 수 있습니다.

---

### 배포 상세 정보 확인

```bash
vercel inspect [deployment-url]
```

특정 배포의 상세 정보를 확인할 수 있습니다.

---

### 배포 로그 확인

```bash
vercel logs [deployment-url]
```

배포의 로그를 확인할 수 있습니다.

---

## 🔄 재배포

### 자동 재배포

GitHub에 푸시하면 자동으로 재배포됩니다:

```bash
git push origin main
```

### 수동 재배포

```bash
vercel --prod
```

---

## 🐛 트러블슈팅

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

---

### 빌드 에러 해결

**문제:** `Module not found` 또는 `Cannot find module`

**해결:**
1. `package.json`의 모든 의존성이 설치되었는지 확인
2. `node_modules` 삭제 후 재설치:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

---

**문제:** `Environment variable not found`

**해결:**
1. Vercel 대시보드에서 환경 변수 확인
2. 환경 변수가 Production 환경에 설정되었는지 확인
3. 환경 변수 이름이 정확한지 확인

---

### 배포 후 기능이 작동하지 않을 때

1. **환경 변수 확인**
   - 브라우저 콘솔에서 에러 확인
   - Vercel 대시보드에서 환경 변수 확인

2. **API 라우트 확인**
   - Vercel Functions 로그 확인
   - 네트워크 탭에서 요청 상태 확인

3. **데이터베이스 연결 확인**
   - Supabase Dashboard에서 연결 상태 확인
   - Supabase 로그 확인

---

## 📝 배포 후 체크리스트

배포 완료 후 다음을 확인하세요:

- [ ] 홈페이지 정상 로드
- [ ] 회원가입/로그인 기능 확인
- [ ] 상품 목록 조회 확인
- [ ] 장바구니 기능 확인
- [ ] 주문 생성 확인
- [ ] 결제 플로우 확인 (테스트 모드)
- [ ] 주문 내역 확인
- [ ] 모바일 반응형 확인
- [ ] 에러 페이지 확인 (404 등)

---

## 🔗 유용한 명령어

```bash
# 프로젝트 정보 확인
vercel project ls

# 현재 프로젝트 정보 확인
vercel project

# 환경 변수 목록 확인
vercel env ls

# 환경 변수 삭제
vercel env rm [variable-name] production

# 배포 삭제
vercel remove [deployment-url]

# 도메인 추가
vercel domains add [your-domain.com]
```

---

## 📚 참고 자료

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments/overview)
- [환경 변수 설정](https://vercel.com/docs/projects/environment-variables)

---

**작성일**: 2025-01-03  
**최종 수정일**: 2025-01-03
