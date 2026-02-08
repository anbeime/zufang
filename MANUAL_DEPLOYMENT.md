# 📦 手动部署指南

## ⚠️ 网络问题说明

由于网络连接问题，无法直接推送到 GitHub。
代码已经提交到本地 Git 仓库，你可以选择以下方式完成部署：

---

## 🔄 方式一：稍后推送（推荐）

### 当网络恢复后：

```bash
cd "C:\D\租房用电商超通"
git push origin master
```

### 或使用 GitHub Desktop：

1. 打开 GitHub Desktop
2. 选择仓库：`zufang`
3. 点击 "Push origin"

---

## 🌐 方式二：直接在 Vercel 部署

### 步骤 1：访问 Vercel

1. 访问：https://vercel.com/dashboard
2. 登录你的账号

### 步骤 2：连接 GitHub 仓库

1. 点击 "Add New" → "Project"
2. 选择 "Import Git Repository"
3. 找到 `anbeime/zufang` 仓库
4. 点击 "Import"

### 步骤 3：配置环境变量

在部署前，添加以下环境变量：

```env
# 必填项
DATABASE_URL=你的数据库连接字符串
ADMIN_PHONES=你的手机号

# 可选项（有默认值）
AUTO_CONFIRM_THRESHOLD=500
NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD=500
```

### 步骤 4：部署

1. 点击 "Deploy"
2. 等待 2-3 分钟
3. 部署完成后会得到一个地址

### 步骤 5：更新站点地址

1. 复制部署后的地址（如：https://zufang-xxx.vercel.app）
2. 回到 Settings → Environment Variables
3. 添加 `NEXT_PUBLIC_SITE_URL`，值为你的站点地址
4. 重新部署

---

## 🗄️ 方式三：配置数据库

### 使用 Vercel Postgres（推荐）

1. 在 Vercel 项目中
2. 点击 "Storage" 标签
3. 点击 "Create Database" → 选择 "Postgres"
4. 等待创建完成
5. 环境变量会自动添加

### 使用 Supabase

1. 访问：https://supabase.com
2. 创建新项目
3. 获取连接字符串
4. 添加到 Vercel 环境变量

---

## 🔧 初始化系统

### 1. 推送数据库结构

在本地运行：

```bash
# 设置环境变量（使用 Vercel 的数据库连接）
$env:DATABASE_URL="你的数据库连接字符串"

# 推送数据库结构
npx drizzle-kit push
```

### 2. 初始化房间数据

访问：
```
https://你的站点地址.vercel.app/api/rooms/initialize
```

### 3. 上传收款码

访问：
```
https://你的站点地址.vercel.app/admin
```

---

## ✅ 已完成的工作

- ✅ 代码已提交到本地 Git
- ✅ 实现金额阈值自动确认功能
- ✅ 创建商户确认页面
- ✅ 优化支付流程
- ✅ 添加完整文档

## ⏳ 待完成的工作

- [ ] 推送代码到 GitHub（网络恢复后）
- [ ] 部署到 Vercel
- [ ] 配置环境变量
- [ ] 初始化数据库
- [ ] 测试功能

---

## 📋 提交信息

```
commit: feat: 实现金额阈值自动确认功能

- 添加金额阈值判断（默认500元）
- 小额支付自动确认并发券
- 大额支付需要商户确认
- 新增商户确认收款页面
- 优化支付成功页面提示
- 添加完整使用文档
```

---

## 📞 需要帮助？

### 详细部署指南

查看文件：`VERCEL_DEPLOYMENT_GUIDE.md`

### 功能使用说明

查看文件：`THRESHOLD_PAYMENT_GUIDE.md`

### 实现总结

查看文件：`IMPLEMENTATION_COMPLETE.md`

---

## 🎯 快速开始

当网络恢复后，只需运行：

```bash
cd "C:\D\租房用电商超通"
git push origin master
```

然后 Vercel 会自动检测并部署（如果已连接）。

---

**代码已准备就绪，等待推送！** 🚀
