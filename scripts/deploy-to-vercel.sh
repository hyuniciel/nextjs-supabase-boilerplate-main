#!/bin/bash
# Vercel 배포 자동화 스크립트

set -e

echo "🚀 Vercel 배포를 시작합니다..."

# 1. Vercel CLI 확인
echo ""
echo "1. Vercel CLI 확인 중..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요: npm install -g vercel"
    exit 1
fi
echo "✅ Vercel CLI 설치됨: $(vercel --version)"

# 2. 로그인 상태 확인
echo ""
echo "2. 로그인 상태 확인 중..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Vercel에 로그인되어 있지 않습니다."
    echo "다음 명령어로 로그인하세요: vercel login"
    exit 1
fi
echo "✅ 로그인됨: $(vercel whoami)"

# 3. 프로젝트 연결 확인
echo ""
echo "3. 프로젝트 연결 확인 중..."
if [ ! -d ".vercel" ]; then
    echo "⚠️  프로젝트가 Vercel에 연결되어 있지 않습니다."
    echo "프로젝트를 연결합니다..."
    vercel link --yes
    echo "✅ 프로젝트 연결 완료"
else
    echo "✅ 프로젝트가 이미 연결되어 있습니다."
fi

# 4. 빌드 테스트
echo ""
echo "4. 빌드 테스트 중..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi
echo "✅ 빌드 성공"

# 5. 환경 변수 안내
echo ""
echo "5. 환경 변수 확인"
echo "⚠️  환경 변수는 Vercel 대시보드에서 설정해야 합니다."
echo ""
echo "필요한 환경 변수:"
echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "  - CLERK_SECRET_KEY"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - NEXT_PUBLIC_STORAGE_BUCKET"
echo "  - NEXT_PUBLIC_TOSS_CLIENT_KEY"
echo "  - TOSS_SECRET_KEY"
echo ""
read -p "환경 변수를 설정했습니까? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  환경 변수를 설정한 후 다시 실행하세요."
    exit 1
fi

# 6. 배포 진행
echo ""
echo "6. 프로덕션 배포 진행 중..."
echo "이 작업은 몇 분이 걸릴 수 있습니다..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 배포 완료!"
    echo ""
    echo "배포 URL을 확인하려면: vercel ls"
    echo "배포 상태를 확인하려면: vercel inspect"
else
    echo ""
    echo "❌ 배포 실패"
    exit 1
fi
