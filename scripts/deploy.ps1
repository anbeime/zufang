# 租房用电商超通系统 - 快速部署脚本（Windows）

Write-Host "🚀 开始部署租房用电商超通系统..." -ForegroundColor Green

# 1. 检查环境
Write-Host "📋 检查环境..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git 未安装，请先安装 Git" -ForegroundColor Red
    exit 1
}

# 2. 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Cyan
npm install

# 3. 安装 Vercel Blob（推荐）
Write-Host "📦 安装 Vercel Blob..." -ForegroundColor Cyan
npm install @vercel/blob

# 4. 配置环境变量
Write-Host "⚙️ 配置环境变量..." -ForegroundColor Cyan
if (-not (Test-Path .env.local)) {
    Write-Host "创建 .env.local 文件..." -ForegroundColor Yellow
    @"
# 管理员手机号白名单（多个手机号用逗号分隔）
ADMIN_PHONES=13800138000,13900139000

# PWA站点访问地址
NEXT_PUBLIC_SITE_URL=http://localhost:5000

# 数据库连接（部署后填写）
# DATABASE_URL=postgresql://...

# Vercel Blob（部署后自动生成）
# BLOB_READ_WRITE_TOKEN=...

# 或使用 Cloudflare R2 / AWS S3
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_ENDPOINT=...
# AWS_S3_BUCKET=...
# AWS_REGION=auto
"@ | Out-File -FilePath .env.local -Encoding UTF8
    Write-Host "✅ .env.local 已创建，请填写数据库连接信息" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local 已存在" -ForegroundColor Green
}

# 5. 生成数据库迁移
Write-Host "🗄️ 生成数据库迁移..." -ForegroundColor Cyan
npx drizzle-kit generate

# 6. 推送数据库结构（需要先配置 DATABASE_URL）
if ($env:DATABASE_URL) {
    Write-Host "📤 推送数据库结构..." -ForegroundColor Cyan
    npx drizzle-kit push
} else {
    Write-Host "⚠️ 未配置 DATABASE_URL，跳过数据库推送" -ForegroundColor Yellow
    Write-Host "   部署后请运行: npx drizzle-kit push" -ForegroundColor Yellow
}

# 7. 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Cyan
npm run build

# 8. 提示下一步
Write-Host ""
Write-Host "✅ 本地准备完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Cyan
Write-Host "1. 创建数据库（Vercel Postgres / Supabase / Neon）"
Write-Host "2. 配置 .env.local 中的 DATABASE_URL"
Write-Host "3. 运行: npx drizzle-kit push"
Write-Host "4. 推送代码到 GitHub"
Write-Host "5. 在 Vercel 导入项目"
Write-Host "6. 配置 Vercel 环境变量"
Write-Host "7. 访问: https://your-project.vercel.app/api/rooms/initialize"
Write-Host ""
Write-Host "📖 详细文档: DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
