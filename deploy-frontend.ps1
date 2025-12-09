# Quick deploy script for ChatPsy Frontend
# Usage: .\deploy-frontend.ps1

Write-Host "🚀 Starting frontend deployment..." -ForegroundColor Cyan

# Build locally
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Commit and push
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
}
git push

# Deploy to VPS
Write-Host "🌐 Deploying to VPS..." -ForegroundColor Yellow
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 @"
cd /tmp
rm -rf frontend-build
git clone https://github.com/FIREguardSPB/chatpsy-front.git frontend-build
cd frontend-build
npm install --silent
npm run build
rm -rf /var/www/chatpsy/frontend/*
cp -r dist/* /var/www/chatpsy/frontend/
echo '✅ Frontend deployed successfully!'
"@

Write-Host "✨ Deployment complete! Check https://chatpsy.online" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Quick commands:" -ForegroundColor Cyan
Write-Host "  View logs:    ssh -i C:\RSA_KEYS\id_rsa root@77.222.60.126 'journalctl -u chatpsy-backend -n 50'"
Write-Host "  Restart backend: ssh -i C:\RSA_KEYS\id_rsa root@77.222.60.126 'systemctl restart chatpsy-backend'"
