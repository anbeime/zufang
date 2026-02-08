# 自动推送和部署脚本

Write-Host "🚀 开始推送代码到 GitHub..." -ForegroundColor Green

# 切换到项目目录
Set-Location "C:\D\租房用电商超通"

# 检查 Git 状态
Write-Host "`n📋 检查 Git 状态..." -ForegroundColor Cyan
git status

# 推送代码
Write-Host "`n📤 推送代码到 GitHub..." -ForegroundColor Cyan
$maxRetries = 3
$retryCount = 0
$pushed = $false

while (-not $pushed -and $retryCount -lt $maxRetries) {
    try {
        git push origin master
        $pushed = $true
        Write-Host "✅ 代码推送成功！" -ForegroundColor Green
    }
    catch {
        $retryCount++
        Write-Host "⚠️ 推送失败，重试 $retryCount/$maxRetries..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $pushed) {
    Write-Host "❌ 代码推送失败，请检查网络连接" -ForegroundColor Red
    Write-Host "`n💡 你可以：" -ForegroundColor Yellow
    Write-Host "1. 检查网络连接" -ForegroundColor White
    Write-Host "2. 使用 VPN" -ForegroundColor White
    Write-Host "3. 使用 GitHub Desktop 手动推送" -ForegroundColor White
    Write-Host "4. 稍后重新运行此脚本" -ForegroundColor White
    exit 1
}

# 检查是否安装了 Vercel CLI
Write-Host "`n🔍 检查 Vercel CLI..." -ForegroundColor Cyan
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 安装 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# 部署到 Vercel
Write-Host "`n🌐 部署到 Vercel..." -ForegroundColor Cyan
Write-Host "请在浏览器中完成登录..." -ForegroundColor Yellow

vercel --prod

Write-Host "`n✅ 部署完成！" -ForegroundColor Green
Write-Host "`n📋 下一步操作：" -ForegroundColor Cyan
Write-Host "1. 访问 Vercel Dashboard 查看部署状态" -ForegroundColor White
Write-Host "2. 配置环境变量（DATABASE_URL, ADMIN_PHONES）" -ForegroundColor White
Write-Host "3. 初始化数据库：npx drizzle-kit push" -ForegroundColor White
Write-Host "4. 初始化房间：访问 /api/rooms/initialize" -ForegroundColor White
Write-Host "5. 上传收款码：访问 /admin" -ForegroundColor White
Write-Host "`n📖 详细说明请查看：VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
