#!/bin/bash

# 租房用电商超通系统 - 快速部署脚本

echo "🚀 开始部署租房用电商超通系统..."

# 1. 检查环境
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 安装 Vercel Blob（推荐）
echo "📦 安装 Vercel Blob..."
npm install @vercel/blob

# 4. 配置环境变量
echo "⚙️ 配置环境变量..."
if [ ! -f .env.local ]; then
    echo "创建 .env.local 文件..."
    cat > .env.local << EOF
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
EOF
    echo "✅ .env.local 已创建，请填写数据库连接信息"
else
    echo "✅ .env.local 已存在"
fi

# 5. 生成数据库迁移
echo "🗄️ 生成数据库迁移..."
npx drizzle-kit generate

# 6. 推送数据库结构（需要先配置 DATABASE_URL）
if [ -n "$DATABASE_URL" ]; then
    echo "📤 推送数据库结构..."
    npx drizzle-kit push
else
    echo "⚠️ 未配置 DATABASE_URL，跳过数据库推送"
    echo "   部署后请运行: npx drizzle-kit push"
fi

# 7. 构建项目
echo "🔨 构建项目..."
npm run build

# 8. 提示下一步
echo ""
echo "✅ 本地准备完成！"
echo ""
echo "📋 下一步操作："
echo "1. 创建数据库（Vercel Postgres / Supabase / Neon）"
echo "2. 配置 .env.local 中的 DATABASE_URL"
echo "3. 运行: npx drizzle-kit push"
echo "4. 推送代码到 GitHub"
echo "5. 在 Vercel 导入项目"
echo "6. 配置 Vercel 环境变量"
echo "7. 访问: https://your-project.vercel.app/api/rooms/initialize"
echo ""
echo "📖 详细文档: DEPLOYMENT_GUIDE.md"
echo ""
