# 🎯 Vercel 配置快速指南

## 📋 配置流程图

```
1. 访问 Vercel Dashboard
   ↓
2. 导入 GitHub 仓库 (anbeime/zufang)
   ↓
3. 配置基础环境变量
   - ADMIN_PHONES
   - AUTO_CONFIRM_THRESHOLD
   - NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD
   ↓
4. 首次部署（可能失败，正常）
   ↓
5. 创建 Vercel Postgres 数据库
   ↓
6. 添加 DATABASE_URL 环境变量
   ↓
7. 添加 NEXT_PUBLIC_SITE_URL
   ↓
8. 重新部署
   ↓
9. 本地推送数据库结构
   ↓
10. 初始化房间数据
   ↓
11. 上传收款码
   ↓
12. 测试功能
   ↓
✅ 完成！
```

---

## 🌐 第一步：在浏览器中打开

### 打开 Vercel Dashboard

```
https://vercel.com/dashboard
```

### 如果还没有登录

1. 使用 GitHub 账号登录
2. 授权 Vercel 访问你的 GitHub 仓库

---

## 📦 第二步：导入项目

### 点击按钮

1. 点击 **"Add New"** → **"Project"**
2. 在列表中找到 **`anbeime/zufang`**
3. 点击 **"Import"**

### 配置页面

保持默认设置：
- Framework: Next.js ✅
- Root Directory: ./ ✅
- Build Command: npm run build ✅

---

## ⚙️ 第三步：配置环境变量

### 在 "Environment Variables" 区域添加：

#### 变量 1: ADMIN_PHONES
```
Name: ADMIN_PHONES
Value: 你的手机号（例如：13800138000）
Environment: Production, Preview, Development
```

#### 变量 2: AUTO_CONFIRM_THRESHOLD
```
Name: AUTO_CONFIRM_THRESHOLD
Value: 500
Environment: Production, Preview, Development
```

#### 变量 3: NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD
```
Name: NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD
Value: 500
Environment: Production, Preview, Development
```

### 点击 Deploy

点击 **"Deploy"** 按钮，等待部署完成。

**注意：** 首次部署可能会失败（因为没有数据库），这是正常的！

---

## 🗄️ 第四步：创建数据库

### 进入 Storage

1. 在项目页面，点击顶部 **"Storage"** 标签
2. 点击 **"Create Database"**
3. 选择 **"Postgres"**
4. 点击 **"Continue"**

### 配置数据库

1. **Database Name:** 保持默认（或自定义）
2. **Region:** 选择 **Hong Kong (hkg1)** 或离你最近的区域
3. 点击 **"Create"**

### 等待创建

等待约 30 秒，数据库创建完成。

---

## 🔗 第五步：连接数据库

### 添加 DATABASE_URL

1. 回到 **Settings** → **Environment Variables**
2. 找到自动添加的 **POSTGRES_URL**
3. 复制它的值
4. 点击 **"Add New"**
5. 添加：
   ```
   Name: DATABASE_URL
   Value: 粘贴 POSTGRES_URL 的值
   Environment: Production, Preview, Development
   ```

### 添加 NEXT_PUBLIC_SITE_URL

1. 复制你的部署地址（例如：`https://zufang-abc123.vercel.app`）
2. 点击 **"Add New"**
3. 添加：
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://zufang-abc123.vercel.app
   Environment: Production, Preview, Development
   ```

---

## 🔄 第六步：重新部署

### 触发重新部署

1. 回到 **Deployments** 标签
2. 点击最新的部署
3. 点击右上角 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 点击 **"Redeploy"** 确认

### 等待完成

等待 2-3 分钟，部署应该成功了！

---

## 💻 第七步：本地初始化数据库

### 打开终端，运行以下命令：

#### 1. 拉取环境变量
```bash
cd "C:\D\租房用电商超通"
vercel env pull .env.local
```

#### 2. 推送数据库结构
```bash
npx drizzle-kit push
```

应该看到：
```
✓ Applying migrations...
✓ Done!
```

---

## 🏠 第八步：初始化房间数据

### 在浏览器中访问：

```
https://你的站点地址.vercel.app/api/rooms/initialize
```

### 应该看到：

```json
{
  "success": true,
  "message": "房间初始化成功",
  "count": 30
}
```

---

## 📱 第九步：上传收款码

### 访问管理后台：

```
https://你的站点地址.vercel.app/admin
```

### 登录并上传

1. 输入你的管理员手机号
2. 找到收款码上传区域
3. 上传你的收款码图片

---

## ✅ 第十步：测试功能

### 测试入住

```
https://你的站点地址.vercel.app/checkin
```

1. 输入手机号：13800138000
2. 输入姓名：测试用户
3. 输入押金：500
4. ✅ 应该自动分配房间

### 测试支付

```
https://你的站点地址.vercel.app/pay
```

1. 输入手机号：13800138000
2. 选择账单支付
3. ✅ 小额自动确认，大额等待确认

### 测试商户确认

```
https://你的站点地址.vercel.app/admin/confirm-payment
```

1. 输入管理员手机号
2. ✅ 确认待确认支付

---

## 🎉 完成！

所有配置完成，系统可以正式使用了！

### 你的站点地址

```
https://你的站点地址.vercel.app
```

### 功能页面

- 入住：`/checkin`
- 交费：`/pay`
- 退房：`/checkout-room`
- 商超：`/checkout`
- 我的：`/my`
- 商户确认：`/admin/confirm-payment`

---

## 📞 需要帮助？

### 详细配置文档

```desktop-local-file
{
  "localPath": "C:\\D\\租房用电商超通\\VERCEL_DATABASE_SETUP.md",
  "fileName": "VERCEL_DATABASE_SETUP.md"
}
```

### 功能使用说明

```desktop-local-file
{
  "localPath": "C:\\D\\租房用电商超通\\THRESHOLD_PAYMENT_GUIDE.md",
  "fileName": "THRESHOLD_PAYMENT_GUIDE.md"
}
```

---

**按照以上步骤操作，10分钟内完成部署！** 🚀
