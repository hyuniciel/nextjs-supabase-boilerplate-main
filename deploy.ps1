# Vercel 배포 스크립트
# PowerShell 스크립트

Write-Host "🚀 Vercel 배포를 시작합니다..." -ForegroundColor Green

# 1. Vercel CLI 설치 확인
Write-Host "`n1. Vercel CLI 확인 중..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel CLI가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "다음 명령어로 설치하세요: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Vercel CLI 버전: $vercelVersion" -ForegroundColor Green

# 2. 로그인 상태 확인
Write-Host "`n2. 로그인 상태 확인 중..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Vercel에 로그인되어 있지 않습니다." -ForegroundColor Yellow
    Write-Host "다음 명령어로 로그인하세요: vercel login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ 로그인됨: $whoami" -ForegroundColor Green

# 3. 프로젝트 연결 확인
Write-Host "`n3. 프로젝트 연결 확인 중..." -ForegroundColor Yellow
if (-not (Test-Path ".vercel")) {
    Write-Host "⚠️  프로젝트가 Vercel에 연결되어 있지 않습니다." -ForegroundColor Yellow
    Write-Host "프로젝트를 연결합니다..." -ForegroundColor Yellow
    vercel link --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 프로젝트 연결 실패" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 프로젝트 연결 완료" -ForegroundColor Green
} else {
    Write-Host "✅ 프로젝트가 이미 연결되어 있습니다." -ForegroundColor Green
}

# 4. 빌드 테스트
Write-Host "`n4. 빌드 테스트 중..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 빌드 성공" -ForegroundColor Green

# 5. 환경 변수 확인
Write-Host "`n5. 환경 변수 확인 중..." -ForegroundColor Yellow
Write-Host "⚠️  환경 변수는 Vercel 대시보드에서 수동으로 설정해야 합니다." -ForegroundColor Yellow
Write-Host "필요한 환경 변수:" -ForegroundColor Yellow
Write-Host "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" -ForegroundColor Cyan
Write-Host "  - CLERK_SECRET_KEY" -ForegroundColor Cyan
Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan
Write-Host "  - NEXT_PUBLIC_STORAGE_BUCKET" -ForegroundColor Cyan
Write-Host "  - NEXT_PUBLIC_TOSS_CLIENT_KEY" -ForegroundColor Cyan
Write-Host "  - TOSS_SECRET_KEY" -ForegroundColor Cyan

# 6. 배포 진행
Write-Host "`n6. 프로덕션 배포 진행 중..." -ForegroundColor Yellow
Write-Host "이 작업은 몇 분이 걸릴 수 있습니다..." -ForegroundColor Yellow
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 배포 실패" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ 배포 완료!" -ForegroundColor Green
Write-Host "배포 URL을 확인하려면: vercel ls" -ForegroundColor Cyan
