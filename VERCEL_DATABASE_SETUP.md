# 🚀 Vercel 和数据库配置 - 详细步骤

## 📋 当前状态

✅ 代码已推送到 GitHub: https://github.com/anbeime/zufang
✅ Vercel CLI 已安装
⏳ 等待配置 Vercel 项目
⏳ 等待配置数据库

---

## 🌐 步骤 1：在 Vercel 网页端创建项目

### 1.1 访问 Vercel Dashboard

打开浏览器，访问：
```
https://vercel.com/dashboard
```

### 1.2 导入 GitHub 仓库

1. 点击 **"Add New"** 按钮
2. 选择 **"Project"**
3. 在 "Import Git Repository" 中找到 **`anbeime/zufang`**
4. 点击 **"Import"**

### 1.3 配置项目设置

**Framework Preset:** Next.js（自动检测）

**Root Directory:** `./`（保持默认）

**Build Command:** `npm run build`（保持默认）

**Output Directory:** `.next`（保持默认）

**Install Command:** `npm install`（保持默认）

### 1.4 配置环境变量（重要！）

在 "Environment Variables" 部分，点击 "Add" 添加以下变量：

#### 必填变量

1. **ADMIN_PHONES**
   ```
   Name: ADMIN_PHONES
   Value: 你的手机号（例如：13800138000）
   ```

2. **AUTO_CONFIRM_THRESHOLD**
   ```
   Name: AUTO_CONFIRM_THRESHOLD
   Value: 500
   ```

3. **NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD**
   ```
   Name: NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD
   Value: 500
   ```

#### 暂时跳过的变量（稍后添加）

- `DATABASE_URL` - 创建数据库后添加
- `NEXT_PUBLIC_SITE_URL` - 部署后添加

### 1.5 点击 Deploy

点击 **"Deploy"** 按钮，等待首次部署完成（约 2-3 分钟）

**注意：** 首次部署可能会失败，因为还没有配置数据库，这是正常的。

---

## 🗄️ 步骤 2：创建 Vercel Postgres 数据库

### 2.1 进入 Storage 标签

1. 在你的项目页面
2. 点击顶部的 **"Storage"** 标签
3. 点击 **"Create Database"**

### 2.2 选择 Postgres

1. 选择 **"Postgres"**
2. 点击 **"Continue"**

### 2.3 配置数据库

1. **Database Name:** 保持默认或自定义（例如：`zufang-db`）
2. **Region:** 选择离你最近的区域（例如：`Hong Kong (hkg1)`）
3. 点击 **"Create"**

### 2.4 等待创建完成

等待约 30 秒，数据库创建完成后，Vercel 会自动添加以下环境变量：

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 2.5 添加 DATABASE_URL

1. 回到 **Settings → Environment Variables**
2. 点击 **"Add New"**
3. 添加：
   ```
   Name: DATABASE_URL
   Value: 复制 POSTGRES_URL 的值
   ```

### 2.6 更新 NEXT_PUBLIC_SITE_URL

1. 复制你的 Vercel 部署地址（例如：`https://zufang-xxx.vercel.app`）
2. 在 Environment Variables 中添加：
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://zufang-xxx.vercel.app
   ```

### 2.7 重新部署

1. 回到 **Deployments** 标签
2. 点击最新的部署
3. 点击右上角的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 勾选 **"Use existing Build Cache"**（可选）
6. 点击 **"Redeploy"**

---

## 🔧 步骤 3：初始化数据库

### 3.1 拉取环境变量到本地

在本地终端运行：

```bash
cd "C:\D\租房用电商超通"
vercel env pull .env.local
```

这会将 Vercel 的环境变量下载到本地 `.env.local` 文件。

### 3.2 推送数据库结构

```bash
npx drizzle-kit push
```

你应该看到类似输出：
```
✓ Applying migrations...
✓ Done!
```

### 3.3 验证数据库表

在 Vercel Dashboard 中：
1. 进入 **Storage → Postgres**
2. 点击 **"Data"** 标签
3. 应该看到以下表：
   - rooms
   - tenants
   - bills
   - payments
   - coupons
   - supermarket_orders
   - contracts
   - meters
   - system_config
   - coupon_usages

---

## 🏠 步骤 4：初始化房间数据

### 4.1 访问初始化接口

在浏览器中访问：
```
https://你的站点地址.vercel.app/api/rooms/initialize
```

### 4.2 验证结果

应该看到：
```json
{
  "success": true,
  "message": "房间初始化成功",
  "count": 30
}
```

### 4.3 检查房间数据

在 Vercel Postgres Data 标签中：
1. 选择 `rooms` 表
2. 应该看到 30 条记录（201-210, 301-310, 401-410）

---

## 📱 步骤 5：上传收款码

### 5.1 访问管理后台

```
https://你的站点地址.vercel.app/admin
```

### 5.2 登录

输入你在环境变量中配置的管理员手机号

### 5.3 上传收款码

1. 找到收款码上传区域
2. 选择你的收款码图片
3. 上传

---

## ✅ 步骤 6：测试功能

### 6.1 测试入住

访问：`https://你的站点地址.vercel.app/checkin`

1. 输入手机号：`13800138000`
2. 输入姓名：`测试用户`
3. 输入押金：`500`
4. 点击"确认入住"
5. ✅ 应该自动分配房间（201）

### 6.2 测试小额支付

访问：`https://你的站点地址.vercel.app/pay`

1. 输入手机号：`13800138000`
2. 查看账单
3. 如果有小于 500 元的账单，选择并支付
4. ✅ 应该显示"支付成功，自动完成"

### 6.3 测试大额支付

1. 如果有大于 500 元的账单，选择并支付
2. ✅ 应该显示"等待商户确认"

### 6.4 测试商户确认

访问：`https://你的站点地址.vercel.app/admin/confirm-payment`

1. 输入管理员手机号
2. 查看待确认列表
3. 点击"确认收款"
4. ✅ 应该自动发放优惠券（如果是电费）

### 6.5 测试商超购物

访问：`https://你的站点地址.vercel.app/checkout`

1. 输入手机号：`13800138000`
2. 输入金额：`150`
3. 选择优惠券（如果有）
4. 点击"支付"
5. ✅ 应该自动抵扣优惠券

---

## 🎯 环境变量完整清单

部署完成后，你的环境变量应该包含：

```env
# 管理员配置
ADMIN_PHONES=你的手机号

# 金额阈值
AUTO_CONFIRM_THRESHOLD=500
NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD=500

# 站点地址
NEXT_PUBLIC_SITE_URL=https://你的站点地址.vercel.app

# 数据库连接（Vercel 自动添加）
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

---

## 🔍 常见问题

### Q1: 部署失败，提示 "DATABASE_URL is not defined"

**解决：**
1. 确认已创建 Vercel Postgres 数据库
2. 确认已添加 `DATABASE_URL` 环境变量
3. 重新部署

### Q2: 初始化房间失败

**解决：**
1. 确认数据库表已创建（运行 `npx drizzle-kit push`）
2. 检查 Vercel 部署日志
3. 重新访问初始化接口

### Q3: 无法登录管理后台

**解决：**
1. 检查 `ADMIN_PHONES` 环境变量
2. 确认手机号格式正确（无空格、无特殊字符）
3. 重新部署

### Q4: 支付后没有自动发券

**解决：**
1. 检查电费金额是否 ≥ 100 元
2. 小额支付（< 500）应该立即发券
3. 大额支付（≥ 500）需要商户确认后发券

---

## 📊 部署检查清单

### Vercel 配置
- [ ] 项目已导入
- [ ] 环境变量已配置
  - [ ] ADMIN_PHONES
  - [ ] AUTO_CONFIRM_THRESHOLD
  - [ ] NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD
  - [ ] DATABASE_URL
  - [ ] NEXT_PUBLIC_SITE_URL
- [ ] 首次部署完成

### 数据库配置
- [ ] Vercel Postgres 已创建
- [ ] 数据库表已创建（drizzle-kit push）
- [ ] 房间数据已初始化（30 个房间）

### 功能测试
- [ ] 入住功能正常
- [ ] 小额支付自动确认
- [ ] 大额支付需要确认
- [ ] 商户确认页面正常
- [ ] 优惠券自动发放
- [ ] 商超购物正常

### 其他配置
- [ ] 收款码已上传
- [ ] 二维码已生成（可选）

---

## 🎉 完成！

完成以上步骤后，你的系统就可以正式使用了！

### 访问地址

- **首页：** `https://你的站点地址.vercel.app`
- **入住：** `https://你的站点地址.vercel.app/checkin`
- **交费：** `https://你的站点地址.vercel.app/pay`
- **退房：** `https://你的站点地址.vercel.app/checkout-room`
- **商超：** `https://你的站点地址.vercel.app/checkout`
- **商户确认：** `https://你的站点地址.vercel.app/admin/confirm-payment`

### 生成二维码

使用草料二维码：https://cli.im/

为以上链接生成二维码，打印后贴在墙上即可使用！

---

**祝部署成功！** 🚀
