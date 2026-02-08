# 租房用电商超通系统 - 部署指南

## 📋 目录
1. [个人收款码支付方案](#个人收款码支付方案)
2. [数据库配置（Vercel Postgres）](#数据库配置)
3. [文件存储配置（Vercel Blob）](#文件存储配置)
4. [Vercel 部署步骤](#vercel-部署步骤)
5. [系统初始化](#系统初始化)

---

## 🎯 个人收款码支付方案

### 方案说明
由于使用个人收款码，无法自动回调确认支付状态，采用**手动确认**方式：
1. 用户扫码支付
2. 用户点击"确认已支付"
3. 系统记录支付并发放优惠券
4. 商户后台可查看支付记录

### 优化建议
为了防止恶意点击"确认已支付"，建议：
- 添加支付凭证上传功能（截图）
- 商户后台增加支付审核功能
- 定期核对收款记录

---

## 💾 数据库配置（Vercel Postgres）

### 方案一：Vercel Postgres（推荐）

#### 1. 创建数据库
```bash
# 在 Vercel 项目中
1. 进入项目 Dashboard
2. 点击 Storage 标签
3. 点击 Create Database
4. 选择 Postgres
5. 选择区域（建议选择离用户最近的）
6. 点击 Create
```

#### 2. 获取连接信息
创建后会自动生成环境变量：
```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

#### 3. 本地开发配置
```bash
# 拉取环境变量到本地
vercel env pull .env.local

# 或手动添加到 .env.local
DATABASE_URL="你的数据库连接字符串"
```

### 方案二：Supabase（免费额度更大）

#### 1. 创建项目
```bash
1. 访问 https://supabase.com
2. 创建新项目
3. 等待数据库初始化（约2分钟）
```

#### 2. 获取连接字符串
```bash
# 在 Supabase Dashboard
Settings -> Database -> Connection string -> URI

# 格式如下
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### 3. 配置环境变量
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 方案三：Neon（推荐用于开发）

#### 1. 创建数据库
```bash
1. 访问 https://neon.tech
2. 创建新项目
3. 选择区域
```

#### 2. 获取连接字符串
```bash
# Dashboard -> Connection Details
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## 📦 文件存储配置（Vercel Blob）

### 方案一：Vercel Blob（推荐）

#### 1. 启用 Blob Storage
```bash
# 在 Vercel 项目中
1. 进入项目 Dashboard
2. 点击 Storage 标签
3. 点击 Create Database
4. 选择 Blob
5. 点击 Create
```

#### 2. 安装依赖
```bash
npm install @vercel/blob
```

#### 3. 修改上传代码
创建文件：`src/lib/storage.ts`
```typescript
import { put, del } from '@vercel/blob';

export async function uploadFile(file: File, folder: string = 'uploads') {
  const blob = await put(`${folder}/${file.name}`, file, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteFile(url: string) {
  await del(url);
}
```

#### 4. 更新 API 路由
修改 `src/app/api/rooms/[id]/upload-photo/route.ts`：
```typescript
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // 上传到 Vercel Blob
  const url = await uploadFile(file, 'room-photos');
  
  // 保存到数据库
  // ...
}
```

### 方案二：Cloudflare R2（兼容 S3 API）

#### 1. 创建 R2 存储桶
```bash
1. 访问 Cloudflare Dashboard
2. 进入 R2 Object Storage
3. 创建存储桶
4. 获取 API 令牌
```

#### 2. 配置环境变量
```env
AWS_ACCESS_KEY_ID="你的 R2 Access Key"
AWS_SECRET_ACCESS_KEY="你的 R2 Secret Key"
AWS_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
AWS_S3_BUCKET="你的存储桶名称"
AWS_REGION="auto"
```

#### 3. 修改 S3 客户端配置
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT, // Cloudflare R2 endpoint
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

---

## 🚀 Vercel 部署步骤

### 1. 准备代码仓库

```bash
# 初始化 Git（如果还没有）
cd C:\D\租房用电商超通
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/租房用电商超通.git
git branch -M main
git push -u origin main
```

### 2. 连接 Vercel

```bash
# 方式一：使用 Vercel CLI
npm i -g vercel
vercel login
vercel

# 方式二：通过网页导入
1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库
3. 配置项目名称
```

### 3. 配置环境变量

在 Vercel Dashboard -> Settings -> Environment Variables 添加：

```env
# 数据库连接
DATABASE_URL="你的数据库连接字符串"

# 管理员手机号
ADMIN_PHONES="13800138000,13900139000"

# 站点地址（部署后自动生成）
NEXT_PUBLIC_SITE_URL="https://your-project.vercel.app"

# 文件存储（如使用 Cloudflare R2）
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_ENDPOINT="..."
AWS_S3_BUCKET="..."
AWS_REGION="auto"
```

### 4. 部署

```bash
# 自动部署（推送代码后自动触发）
git push

# 或手动部署
vercel --prod
```

### 5. 配置自定义域名（可选）

```bash
# 在 Vercel Dashboard
1. Settings -> Domains
2. 添加你的域名
3. 配置 DNS 记录（按提示操作）
```

---

## 🔧 系统初始化

### 1. 创建数据库表结构

```bash
# 安装 Drizzle Kit
npm install -D drizzle-kit

# 生成迁移文件
npx drizzle-kit generate

# 推送到数据库
npx drizzle-kit push
```

### 2. 初始化房间数据

访问：`https://your-project.vercel.app/api/rooms/initialize`

或使用 API：
```bash
curl -X POST https://your-project.vercel.app/api/rooms/initialize
```

### 3. 配置系统参数

访问管理后台：`https://your-project.vercel.app/admin`

配置：
- 电费单价
- 水费单价
- 优惠券规则
- 收款码图片

---

## 📱 生成租户二维码

### 1. 创建二维码生成脚本

创建文件：`scripts/generate-qrcodes.ts`
```typescript
import QRCode from 'qrcode';
import fs from 'fs';

const baseUrl = 'https://your-project.vercel.app';

async function generateQRCodes() {
  // 入住二维码
  await QRCode.toFile('public/qr-checkin.png', `${baseUrl}/checkin`);
  
  // 交费二维码
  await QRCode.toFile('public/qr-pay.png', `${baseUrl}/pay`);
  
  // 退房二维码
  await QRCode.toFile('public/qr-checkout.png', `${baseUrl}/checkout-room`);
  
  // 商超二维码
  await QRCode.toFile('public/qr-supermarket.png', `${baseUrl}/checkout`);
  
  console.log('二维码生成完成！');
}

generateQRCodes();
```

### 2. 运行脚本
```bash
npx ts-node scripts/generate-qrcodes.ts
```

---

## 🔐 安全建议

### 1. 添加支付凭证上传

修改支付流程，要求用户上传支付截图：
```typescript
// 在支付确认时
const formData = new FormData();
formData.append('screenshot', file);
formData.append('billId', billId);

await fetch('/api/payments/verify', {
  method: 'POST',
  body: formData,
});
```

### 2. 商户审核功能

在管理后台添加待审核支付列表：
```typescript
// GET /api/payments?status=pending
// 显示待审核的支付记录
// 商户可以批准或拒绝
```

### 3. 定期对账

导出支付记录与实际收款对比：
```typescript
// GET /api/payments/export?startDate=2024-01-01&endDate=2024-01-31
// 导出 Excel 对账单
```

---

## 📊 监控与维护

### 1. 查看日志
```bash
# Vercel Dashboard -> Deployments -> 选择部署 -> Runtime Logs
```

### 2. 性能监控
```bash
# Vercel Dashboard -> Analytics
# 查看访问量、响应时间等
```

### 3. 数据库备份
```bash
# Vercel Postgres 自动备份
# Supabase: Settings -> Database -> Backups

# 手动备份
pg_dump $DATABASE_URL > backup.sql
```

---

## 🆘 常见问题

### Q1: 数据库连接失败
```bash
# 检查环境变量
vercel env ls

# 检查数据库是否可访问
psql $DATABASE_URL
```

### Q2: 文件上传失败
```bash
# 检查 Blob 存储是否启用
# 检查文件大小限制（Vercel Blob 免费版 100MB）
```

### Q3: 部署后页面空白
```bash
# 查看构建日志
vercel logs

# 检查环境变量是否配置
```

### Q4: 二维码扫描无反应
```bash
# 检查 NEXT_PUBLIC_SITE_URL 是否正确
# 确保使用 HTTPS
```

---

## 📞 技术支持

如遇问题，请检查：
1. Vercel 部署日志
2. 浏览器控制台错误
3. 数据库连接状态
4. 环境变量配置

---

## 🎉 部署完成检查清单

- [ ] 数据库创建并连接成功
- [ ] 环境变量配置完成
- [ ] 代码推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 数据库表结构初始化
- [ ] 房间数据初始化
- [ ] 收款码图片上传
- [ ] 生成功能二维码
- [ ] 测试入住流程
- [ ] 测试支付流程
- [ ] 测试商超购物
- [ ] 管理后台访问正常

全部完成后，系统即可正式使用！🚀
