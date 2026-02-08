# 💡 简单自动结算方案

## 🎯 问题分析

**当前方案的问题：**
- ❌ 支付凭证上传太麻烦
- ❌ 商户审核需要人工操作
- ❌ 用户体验不够流畅

**理想方案：**
- ✅ 用户扫码支付后自动确认
- ✅ 无需人工审核
- ✅ 自动发放优惠券

---

## 🚀 方案一：微信/支付宝官方支付接口（推荐）

### 优点
- ✅ **完全自动化**：支付成功自动回调
- ✅ **安全可靠**：官方接口，资金有保障
- ✅ **用户体验好**：支付即完成，无需确认
- ✅ **无需审核**：系统自动处理

### 缺点
- ⚠️ 需要企业资质（个体户也可以）
- ⚠️ 有手续费（0.6%）
- ⚠️ 需要开发对接

### 实现方式

#### 1. 微信支付（推荐）

**申请条件：**
- 营业执照（个体户/企业）
- 对公账户或法人银行卡
- 经营场所照片

**费率：**
- 0.6%（例如收款100元，手续费0.6元）

**接入步骤：**
```bash
1. 注册微信支付商户号
   https://pay.weixin.qq.com

2. 获取商户密钥
   - 商户号 (mch_id)
   - API密钥 (api_key)
   - 证书文件

3. 安装 SDK
   npm install wechatpay-node-v3

4. 配置环境变量
   WECHAT_APPID=你的公众号APPID
   WECHAT_MCHID=你的商户号
   WECHAT_API_KEY=你的API密钥
```

**代码示例：**
```typescript
// src/lib/wechat-pay.ts
import { Payment } from 'wechatpay-node-v3';

const payment = new Payment({
  appid: process.env.WECHAT_APPID!,
  mchid: process.env.WECHAT_MCHID!,
  private_key: process.env.WECHAT_PRIVATE_KEY!,
});

// 创建支付订单
export async function createPayment(amount: number, description: string) {
  const result = await payment.native({
    description,
    out_trade_no: `ORDER_${Date.now()}`,
    amount: {
      total: Math.round(amount * 100), // 转为分
    },
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/wechat-callback`,
  });
  
  return result.code_url; // 返回支付二维码链接
}

// 支付回调处理
export async function handlePaymentCallback(data: any) {
  // 验证签名
  const verified = payment.verifySign(data);
  if (!verified) {
    throw new Error('签名验证失败');
  }
  
  // 支付成功，自动处理
  if (data.trade_state === 'SUCCESS') {
    return {
      success: true,
      out_trade_no: data.out_trade_no,
      transaction_id: data.transaction_id,
    };
  }
}
```

**API 路由：**
```typescript
// src/app/api/payments/wechat-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentCallback } from '@/lib/wechat-pay';
import { billManager, couponManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const result = await handlePaymentCallback(JSON.parse(body));
    
    if (result.success) {
      // 从订单号中提取账单ID
      const billId = result.out_trade_no.split('_')[1];
      
      // 更新账单状态
      await billManager.updateBillStatus(billId, 'paid', amount, new Date());
      
      // 自动发放优惠券
      const coupon = await couponManager.generateCouponByBill(
        tenantId,
        billId,
        amount
      );
      
      return NextResponse.json({ code: 'SUCCESS', message: '成功' });
    }
  } catch (error) {
    return NextResponse.json({ code: 'FAIL', message: '失败' });
  }
}
```

#### 2. 支付宝支付

**申请条件：**
- 营业执照
- 对公账户或法人支付宝

**费率：**
- 0.6%

**接入步骤：**
```bash
1. 注册支付宝商家中心
   https://open.alipay.com

2. 创建应用并获取密钥
   - APPID
   - 应用私钥
   - 支付宝公钥

3. 安装 SDK
   npm install alipay-sdk

4. 配置环境变量
   ALIPAY_APPID=你的APPID
   ALIPAY_PRIVATE_KEY=你的应用私钥
   ALIPAY_PUBLIC_KEY=支付宝公钥
```

**代码示例：**
```typescript
// src/lib/alipay.ts
import AlipaySdk from 'alipay-sdk';

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APPID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: 'https://openapi.alipay.com/gateway.do',
});

// 创建支付订单
export async function createPayment(amount: number, subject: string) {
  const result = await alipaySdk.exec('alipay.trade.precreate', {
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/alipay-callback`,
    bizContent: {
      out_trade_no: `ORDER_${Date.now()}`,
      total_amount: amount.toFixed(2),
      subject,
    },
  });
  
  return result.qr_code; // 返回支付二维码链接
}
```

---

## 🎯 方案二：聚合支付平台（最简单）

### 优点
- ✅ **一次对接，支持多种支付方式**（微信、支付宝、云闪付）
- ✅ **无需企业资质**（部分平台支持个人）
- ✅ **开发简单**：统一接口
- ✅ **完全自动化**：支付成功自动回调

### 缺点
- ⚠️ 费率稍高（0.8%-1.2%）
- ⚠️ 需要选择可靠平台

### 推荐平台

#### 1. Ping++ (推荐)

**特点：**
- ✅ 支持个人开发者
- ✅ 统一 API 对接
- ✅ 支持微信、支付宝、银联
- ✅ 费率：0.6%-1%

**接入步骤：**
```bash
1. 注册 Ping++
   https://www.pingxx.com

2. 创建应用
   获取 API Key 和 Secret

3. 安装 SDK
   npm install pingpp

4. 配置环境变量
   PINGPP_API_KEY=你的API_KEY
   PINGPP_APP_ID=你的APP_ID
```

**代码示例：**
```typescript
// src/lib/pingpp.ts
import pingpp from 'pingpp';

pingpp.setPrivateKey(process.env.PINGPP_API_KEY!);

// 创建支付订单
export async function createCharge(amount: number, channel: 'wx' | 'alipay') {
  const charge = await pingpp.charges.create({
    order_no: `ORDER_${Date.now()}`,
    app: { id: process.env.PINGPP_APP_ID! },
    channel: channel === 'wx' ? 'wx_pub_qr' : 'alipay_qr',
    amount: Math.round(amount * 100), // 转为分
    currency: 'cny',
    subject: '租房费用',
    body: '房租/电费',
    client_ip: '127.0.0.1',
    extra: {
      product_id: 'rent_payment',
    },
  });
  
  return charge.credential[channel === 'wx' ? 'wx_pub_qr' : 'alipay_qr'];
}

// Webhook 回调处理
export async function verifyWebhook(signature: string, rawBody: string) {
  return pingpp.webhooks.verify(rawBody, signature);
}
```

#### 2. PayJS (个人推荐)

**特点：**
- ✅ **支持个人**（无需营业执照）
- ✅ 只需身份证和银行卡
- ✅ 费率：0.8%
- ✅ T+1 结算

**接入步骤：**
```bash
1. 注册 PayJS
   https://payjs.cn

2. 实名认证
   上传身份证和银行卡

3. 获取密钥
   - 商户号 (mchid)
   - 通信密钥 (key)

4. 安装 SDK
   npm install payjs-node
```

**代码示例：**
```typescript
// src/lib/payjs.ts
import PayJS from 'payjs-node';

const payjs = new PayJS({
  mchid: process.env.PAYJS_MCHID!,
  key: process.env.PAYJS_KEY!,
});

// 创建支付订单
export async function createNative(amount: number, body: string) {
  const result = await payjs.native({
    out_trade_no: `ORDER_${Date.now()}`,
    total_fee: Math.round(amount * 100), // 转为分
    body,
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/payjs-callback`,
  });
  
  return result.qrcode; // 返回支付二维码链接
}

// 回调验证
export function verifySign(data: any) {
  return payjs.checkSign(data);
}
```

---

## 🔄 方案三：第三方收款监控（折中方案）

### 原理
监控你的个人微信/支付宝收款记录，自动匹配订单

### 优点
- ✅ 无需企业资质
- ✅ 无手续费
- ✅ 使用个人收款码

### 缺点
- ⚠️ 依赖第三方服务
- ⚠️ 可能违反平台规则
- ⚠️ 稳定性不如官方接口

### 实现方式

#### 使用「码支付」等监控服务

**原理：**
1. 用户扫你的个人收款码支付
2. 监控服务检测到收款
3. 通过金额和备注匹配订单
4. 回调你的系统确认支付

**代码示例：**
```typescript
// src/lib/payment-monitor.ts

// 创建订单时生成唯一金额
export function generateUniqueAmount(baseAmount: number) {
  // 例如：100元 → 100.01, 100.02, 100.03...
  const random = Math.floor(Math.random() * 99) + 1;
  return baseAmount + random / 100;
}

// 接收监控服务回调
export async function handleMonitorCallback(data: {
  amount: number;
  remark: string;
  timestamp: number;
}) {
  // 根据金额匹配订单
  const order = await findOrderByAmount(data.amount);
  
  if (order) {
    // 自动确认支付
    await confirmPayment(order.id);
    return { success: true };
  }
  
  return { success: false, error: '订单未找到' };
}
```

**注意：**
- ⚠️ 此方案可能不稳定
- ⚠️ 不推荐用于生产环境
- ⚠️ 仅作为临时方案

---

## 💰 方案四：虚拟账户充值（最简单）

### 原理
用户先充值到虚拟账户，消费时从账户扣款

### 优点
- ✅ 无需每次支付
- ✅ 自动扣款
- ✅ 用户体验好

### 缺点
- ⚠️ 充值环节仍需支付
- ⚠️ 需要管理账户余额

### 实现方式

**流程：**
```
1. 用户充值（扫码支付）
   ↓
2. 商户手动确认到账
   ↓
3. 系统增加虚拟账户余额
   ↓
4. 产生账单时自动扣款
   ↓
5. 余额不足时提醒充值
```

**数据库结构：**
```typescript
// 添加账户余额表
export const accounts = pgTable("accounts", {
  id: varchar({ length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull(),
  balance: numeric({ precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// 充值记录表
export const recharges = pgTable("recharges", {
  id: varchar({ length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull(),
  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  status: varchar({ length: 20 }).default('pending'), // pending/completed
  createdAt: timestamp("created_at").defaultNow(),
});
```

**代码示例：**
```typescript
// 自动扣款
export async function autoDeduct(tenantId: string, billId: string) {
  const account = await getAccount(tenantId);
  const bill = await getBill(billId);
  
  if (account.balance >= bill.amount) {
    // 余额充足，自动扣款
    await updateBalance(tenantId, -bill.amount);
    await updateBillStatus(billId, 'paid');
    await generateCoupon(tenantId, billId, bill.amount);
    
    return { success: true, message: '自动扣款成功' };
  } else {
    // 余额不足
    return { success: false, message: '余额不足，请充值' };
  }
}
```

---

## 📊 方案对比

| 方案 | 自动化程度 | 开发难度 | 费用 | 资质要求 | 推荐度 |
|------|-----------|---------|------|---------|--------|
| 微信/支付宝官方 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 0.6% | 营业执照 | ⭐⭐⭐⭐⭐ |
| Ping++ 聚合支付 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 0.6-1% | 营业执照 | ⭐⭐⭐⭐ |
| PayJS 个人支付 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 0.8% | 身份证 | ⭐⭐⭐⭐⭐ |
| 收款监控 | ⭐⭐⭐ | ⭐⭐⭐ | 0% | 无 | ⭐⭐ |
| 虚拟账户充值 | ⭐⭐⭐⭐ | ⭐⭐ | 0% | 无 | ⭐⭐⭐ |
| 当前方案（手动确认）| ⭐ | ⭐ | 0% | 无 | ⭐ |

---

## 🎯 推荐方案

### 如果你有营业执照（个体户也可以）
👉 **方案一：微信支付官方接口**
- 最稳定、最安全
- 用户体验最好
- 费率最低（0.6%）

### 如果你是个人（无营业执照）
👉 **方案二：PayJS**
- 只需身份证和银行卡
- 完全自动化
- 费率可接受（0.8%）

### 如果你想零成本
👉 **方案四：虚拟账户充值**
- 用户先充值
- 自动扣款
- 无手续费

---

## 🚀 快速实现：PayJS 方案（推荐）

### 为什么选择 PayJS？
- ✅ **无需营业执照**（个人即可）
- ✅ **完全自动化**（支付成功自动回调）
- ✅ **开发简单**（SDK 完善）
- ✅ **费率合理**（0.8%）

### 实现步骤（30分钟）

#### 1. 注册 PayJS（5分钟）
```bash
1. 访问 https://payjs.cn
2. 注册账号
3. 实名认证（上传身份证）
4. 绑定银行卡
5. 获取商户号和密钥
```

#### 2. 安装依赖（1分钟）
```bash
npm install crypto
```

#### 3. 配置环境变量（1分钟）
```env
# .env.local
PAYJS_MCHID=你的商户号
PAYJS_KEY=你的通信密钥
```

#### 4. 创建支付工具（10分钟）

创建文件：`src/lib/payjs.ts`
```typescript
import crypto from 'crypto';

interface PayJSConfig {
  mchid: string;
  key: string;
}

class PayJS {
  private config: PayJSConfig;

  constructor(config: PayJSConfig) {
    this.config = config;
  }

  // 生成签名
  private sign(data: Record<string, any>): string {
    const keys = Object.keys(data).sort();
    const str = keys
      .map(key => `${key}=${data[key]}`)
      .join('&') + `&key=${this.config.key}`;
    
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  }

  // 创建扫码支付
  async native(params: {
    out_trade_no: string;
    total_fee: number;
    body: string;
    notify_url: string;
  }) {
    const data = {
      mchid: this.config.mchid,
      ...params,
    };
    
    data.sign = this.sign(data);

    const response = await fetch('https://payjs.cn/api/native', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return await response.json();
  }

  // 验证回调签名
  checkSign(data: Record<string, any>): boolean {
    const sign = data.sign;
    delete data.sign;
    return this.sign(data) === sign;
  }
}

export const payjs = new PayJS({
  mchid: process.env.PAYJS_MCHID!,
  key: process.env.PAYJS_KEY!,
});
```

#### 5. 修改支付 API（10分钟）

修改文件：`src/app/api/payments/create/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { payjs } from '@/lib/payjs';

export async function POST(request: NextRequest) {
  try {
    const { billId, amount, description } = await request.json();

    // 创建 PayJS 订单
    const result = await payjs.native({
      out_trade_no: `BILL_${billId}_${Date.now()}`,
      total_fee: Math.round(amount * 100), // 转为分
      body: description || '租房费用',
      notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/payjs-callback`,
    });

    if (result.return_code === 1) {
      return NextResponse.json({
        success: true,
        qrcode: result.qrcode, // 支付二维码链接
        code_url: result.code_url, // 二维码内容
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.return_msg,
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
```

#### 6. 创建回调接口（10分钟）

创建文件：`src/app/api/payments/payjs-callback/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { payjs } from '@/lib/payjs';
import { billManager, couponManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 验证签名
    if (!payjs.checkSign(data)) {
      return NextResponse.json({ return_code: 0, return_msg: '签名错误' });
    }

    // 支付成功
    if (data.return_code === 1) {
      // 从订单号中提取账单ID
      const [, billId] = data.out_trade_no.split('_');
      
      // 获取账单信息
      const bill = await billManager.getBillById(billId);
      if (!bill) {
        return NextResponse.json({ return_code: 0, return_msg: '账单不存在' });
      }

      // 更新账单状态
      await billManager.updateBillStatus(
        billId,
        'paid',
        (data.total_fee / 100).toString(),
        new Date()
      );

      // 创建支付记录
      await paymentManager.createPayment({
        tenantId: bill.tenantId,
        billId,
        amount: (data.total_fee / 100).toString(),
        type: bill.type,
        paymentMethod: 'payjs',
        transactionId: data.payjs_order_id,
        status: 'completed',
      });

      // 自动发放优惠券（如果是电费）
      if (bill.type === 'electricity') {
        await couponManager.generateCouponByBill(
          bill.tenantId,
          billId,
          (data.total_fee / 100).toString()
        );
      }

      return NextResponse.json({ return_code: 1, return_msg: '成功' });
    }

    return NextResponse.json({ return_code: 0, return_msg: '支付失败' });
  } catch (error: any) {
    console.error('PayJS callback error:', error);
    return NextResponse.json({ return_code: 0, return_msg: error.message });
  }
}
```

#### 7. 修改前端支付页面（5分钟）

修改文件：`src/app/pay/pay-client.tsx`
```typescript
// 在 handlePay 函数中
const handlePay = async () => {
  if (selectedBills.length === 0) {
    alert('请选择要支付的账单');
    return;
  }

  setLoading(true);

  try {
    // 创建支付订单
    const bill = bills.find(b => b.id === selectedBills[0]);
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billId: bill.id,
        amount: bill.amount,
        description: `${bill.type === 'rent' ? '房租' : '电费'}`,
      }),
    });

    const data = await res.json();
    
    if (data.success) {
      // 显示支付二维码
      setPaymentQrCode(data.qrcode);
      setShowQrCode(true);
      
      // 开始轮询支付状态
      startPollingPaymentStatus(bill.id);
    } else {
      alert(data.error || '创建支付失败');
    }
  } catch (error) {
    alert('支付失败');
  } finally {
    setLoading(false);
  }
};

// 轮询支付状态
const startPollingPaymentStatus = (billId: string) => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/bills/${billId}`);
    const data = await res.json();
    
    if (data.success && data.data.status === 'paid') {
      clearInterval(interval);
      setShowQrCode(false);
      setStep('success');
    }
  }, 2000); // 每2秒查询一次

  // 5分钟后停止轮询
  setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
};
```

---

## ✅ 完成！

使用 PayJS 方案后：
- ✅ 用户扫码支付
- ✅ PayJS 自动回调
- ✅ 系统自动确认
- ✅ 自动发放优惠券
- ✅ 无需人工操作

**完全自动化！** 🎉

---

## 📞 需要帮助？

如果你选择了某个方案，我可以帮你：
1. 完整实现代码
2. 修改现有文件
3. 测试支付流程
4. 部署到生产环境

告诉我你选择哪个方案，我立即帮你实现！
