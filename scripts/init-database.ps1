# 数据库初始化脚本

$env:DATABASE_URL="postgresql://neondb_owner:npg_KcOVCboD2ga0@ep-divine-haze-aiy0b6or-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "开始创建数据库表..." -ForegroundColor Green

# 使用 --yes 参数自动确认
npx drizzle-kit push --yes

Write-Host "数据库表创建完成！" -ForegroundColor Green
