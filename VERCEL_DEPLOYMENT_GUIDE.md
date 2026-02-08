# 🚀 Vercel 部署指南

## 📋 当前状态

✅ 代码已提交到本地 Git 仓库
⏳ 等待推送到 GitHub
⏳ 等待部署到 Vercel

---

## 🔄 步骤 1：推送代码到 GitHub

### 方式一：命令行推送（推荐）

```bash
cd "C:\D\租房用电商超通"
git push origin master
```

如果遇到网络问题，可以：
1. 检查网络连接
2. 使用 VPN
3. 或使用方式二

### 方式二：GitHub Desktop 推送

1. 打开 GitHub Desktop
2. 选择仓库：`zufang`
3. 点击 "Push origin"

### 方式三：直接在 GitHub 网页上传

1. 访问：https://github.com/anbeime/zufang
2. 点击 "Add file" → "Upload files"
3. 上传修改的文件

---

## 🌐 步骤 2：部署到 Vercel

### 方式一：自动部署（推荐）

如果你的 GitHub 仓库已连接到 Vercel：

1. 推送代码后，Vercel 会自动检测
2. 自动开始构建
3. 约 2-3 分钟后部署完成

### 方式二：手动部署

#### 2.1 访问 Vercel Dashboard

访问：https://vercel.com/dashboard

#### 2.2 选择项目

找到你的项目（如果已存在）或创建新项目

#### 2.3 导入 GitHub 仓库

1. 点击 "Add New" → "Project"
2. 选择 "Import Git Repository"
3. 选择 `anbeime/zufang`
4. 点击 "Import"

#### 2.4 配置项目

**Framework Preset:** Next.js（自动检测）

**Root Directory:** `./`（默认）

**Build Command:** `npm run build`（自动）

**Output Directory:** `.next`（自动）

#### 2.5 配置环境变量

点击 "Environment Variables"，添加以下变量：

```env
# 数据库连接（必填）
DATABASE_URL=你的数据库连接字符串

# 管理员手机号（必填）
ADMIN_PHONES=你的手机号

# 站点地址（部署后自动生成，先留空）
NEXT_PUBLIC_SITE_URL=

# 金额阈值（可选，默认500）
AUTO_CONFIRM_THRESHOLD=500
NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD=500
```

**重要：** 
- `DATABASE_URL` 必须填写，否则无法启动
- `ADMIN_PHONES` 填写你的手机号
- `NEXT_PUBLIC_SITE_URL` 部署后再填写

#### 2.6 点击 Deploy

点击 "Deploy" 按钮，等待部署完成

---

## 🗄️ 步骤 3：配置数据库

### 方式一：Vercel Postgres（推荐）

#### 3.1 创建数据库

1. 在 Vercel Dashboard 中
2. 进入你的项目
3. 点击 "Storage" 标签
4. 点击 "Create Database"
5. 选择 "Postgres"
6. 选择区域（建议选择离你最近的）
7. 点击 "Create"

#### 3.2 连接数据库

1. 创建完成后，Vercel 会自动添加环境变量
2. 主要是 `POSTGRES_URL`
3. 复制这个值到 `DATABASE_URL`

#### 3.3 初始化数据库

```bash
# 本地连接到 Vercel Postgres
# 设置环境变量
$env:DATABASE_URL="你的POSTGRES_URL"

# 推送数据库结构
npx drizzle-kit push
```

或者使用 Vercel CLI：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 拉取环境变量
vercel env pull .env.local

# 推送数据库结构
npx drizzle-kit push
```

### 方式二：Supabase

#### 3.1 创建项目

1. 访问：https://supabase.com
2. 创建新项目
3. 等待初始化（约2分钟）

#### 3.2 获取连接字符串

1. 进入项目 Dashboard
2. 点击 Settings → Database
3. 复制 Connection string (URI)
4. 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### 3.3 配置到 Vercel

1. 回到 Vercel Dashboard
2. 进入项目 Settings → Environment Variables
3. 添加 `DATABASE_URL`，值为上面的连接字符串
4. 点击 "Save"
5. 重新部署项目

#### 3.4 初始化数据库

```bash
# 设置环境变量
$env:DATABASE_URL="你的Supabase连接字符串"

# 推送数据库结构
npx drizzle-kit push
```

---

## 🔧 步骤 4：初始化系统

### 4.1 更新站点地址

部署完成后，Vercel 会给你一个地址，例如：
```
https://zufang-xxx.vercel.app
```

1. 复制这个地址
2. 回到 Vercel Dashboard
3. Settings → Environment Variables
4. 编辑 `NEXT_PUBLIC_SITE_URL`
5. 填入你的站点地址
6. 保存并重新部署

### 4.2 初始化房间数据

访问：
```
https://你的站点地址.vercel.app/api/rooms/initialize
```

应该看到：
```json
{
  "success": true,
  "message": "房间初始化成功",
  "count": 30
}
```

### 4.3 上传收款码

1. 访问：`https://你的站点地址.vercel.app/admin`
2. 输入管理员手机号登录
3. 上传收款码图片

---

## ✅ 步骤 5：测试功能

### 5.1 测试入住

访问：`https://你的站点地址.vercel.app/checkin`

1. 输入手机号：13800138000
2. 输入姓名：测试用户
3. 输入押金：500
4. 点击"确认入住"
5. ✅ 应该自动分配房间（201）

### 5.2 测试支付（小额）

访问：`https://你的站点地址.vercel.app/pay`

1. 输入手机号：13800138000
2. 查看账单
3. 选择小于500元的账单
4. 点击"支付"
5. 点击"确认已支付"
6. ✅ 应该显示"支付成功，自动完成"

### 5.3 测试支付（大额）

1. 选择大于500元的账单
2. 点击"支付"
3. 点击"确认已支付"
4. ✅ 应该显示"等待商户确认"

### 5.4 测试商户确认

访问：`https://你的站点地址.vercel.app/admin/confirm-payment`

1. 输入管理员手机号
2. 查看待确认列表
3. 点击"确认收款"
4. ✅ 应该自动发放优惠券

### 5.5 测试商超购物

访问：`https://你的站点地址.vercel.app/checkout`

1. 输入手机号：13800138000
2. 输入金额：150
3. 选择优惠券
4. 点击"支付"
5. ✅ 应该自动抵扣优惠券

---

## 🔍 常见问题

### Q1: 部署失败，提示 "DATABASE_URL is not defined"

**解决方法：**
1. 检查环境变量是否配置
2. 确保 `DATABASE_URL` 已添加
3. 重新部署

### Q2: 访问页面显示 500 错误

**解决方法：**
1. 检查 Vercel 部署日志
2. 查看 Runtime Logs
3. 确认数据库连接正常
4. 确认数据库表已创建

### Q3: 初始化房间失败

**解决方法：**
1. 确认数据库结构已推送
2. 运行 `npx drizzle-kit push`
3. 重新访问初始化接口

### Q4: 商户确认页面无法登录

**解决方法：**
1. 检查 `ADMIN_PHONES` 环境变量
2. 确认手机号格式正确
3. 重新部署

### Q5: 优惠券没有自动发放

**解决方法：**
1. 检查电费金额是否 ≥100元
2. 查看支付记录状态
3. 确认商户已确认收款（大额支付）

---

## 📊 部署检查清单

### 代码推送
- [ ] 代码已提交到本地 Git
- [ ] 代码已推送到 GitHub
- [ ] GitHub 仓库可访问

### Vercel 配置
- [ ] 项目已导入到 Vercel
- [ ] 环境变量已配置
  - [ ] DATABASE_URL
  - [ ] ADMIN_PHONES
  - [ ] NEXT_PUBLIC_SITE_URL
  - [ ] AUTO_CONFIRM_THRESHOLD
- [ ] 部署成功

### 数据库配置
- [ ] 数据库已创建
- [ ] 连接字符串已获取
- [ ] 数据库结构已推送
- [ ] 房间数据已初始化

### 功能测试
- [ ] 入住功能正常
- [ ] 小额支付自动确认
- [ ] 大额支付需要确认
- [ ] 商户确认页面正常
- [ ] 优惠券自动发放
- [ ] 商超购物正常

### 其他配置
- [ ] 收款码已上传
- [ ] 自定义域名已配置（可选）
- [ ] HTTPS 已启用（Vercel 自动）

---

## 🎯 快速命令

### 推送代码
```bash
cd "C:\D\租房用电商超通"
git push origin master
```

### 部署到 Vercel（CLI）
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 初始化数据库
```bash
# 拉取环境变量
vercel env pull .env.local

# 推送数据库结构
npx drizzle-kit push
```

### 查看部署日志
```bash
vercel logs
```

---

## 📞 需要帮助？

### Vercel 文档
- https://vercel.com/docs

### Drizzle ORM 文档
- https://orm.drizzle.team/docs/overview

### Next.js 文档
- https://nextjs.org/docs

---

## 🎉 部署完成后

访问你的站点：
```
https://你的站点地址.vercel.app
```

生成二维码：
1. 使用草料二维码：https://cli.im/
2. 生成以下链接的二维码：
   - 入住：`https://你的站点/checkin`
   - 交费：`https://你的站点/pay`
   - 退房：`https://你的站点/checkout-room`
   - 商超：`https://你的站点/checkout`
   - 商户确认：`https://你的站点/admin/confirm-payment`

打印二维码，贴在墙上，开始使用！🎊

---

**祝部署顺利！** 🚀
