#!/bin/bash
# Quick deploy script for ChatPsy Frontend

echo "🚀 Starting frontend deployment..."

# Build locally
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Commit and push
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push

# Deploy to VPS
echo "🌐 Deploying to VPS..."
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 << 'ENDSSH'
cd /tmp
rm -rf frontend-build
git clone https://github.com/FIREguardSPB/chatpsy-front.git frontend-build
cd frontend-build
npm install
npm run build
rm -rf /var/www/chatpsy/frontend/*
cp -r dist/* /var/www/chatpsy/frontend/
echo "✅ Frontend deployed!"
ENDSSH

echo "✨ Deployment complete! Check https://chatpsy.online"
