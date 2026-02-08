# 💡 现场支付 - 简化方案

## 🎯 方案说明

### 核心理念
- ✅ 现场支付，当面收款
- ✅ 钱直接进个人收款码
- ✅ 系统只做数字记录
- ✅ 简单、快速、实用

### 工作流程

```
租户到店/现场
    ↓
查看未付账单（扫码或输入手机号）
    ↓
扫个人收款码支付
    ↓
商户当面确认收到款
    ↓
点击"确认收款"按钮
    ↓
系统记录支付
    ↓
自动发放优惠券
    ↓
完成！
```

---

## 🎨 优化方案

### 方案一：商户端确认（推荐）

**适用场景：**
- 租户到店交费
- 商户在场确认

**流程：**
1. 租户扫码或输入手机号查看账单
2. 租户扫商户个人收款码支付
3. **商户在自己的手机上点击"确认收款"**
4. 系统记录并发券

**优点：**
- ✅ 商户主动确认，防止误操作
- ✅ 商户有控制权
- ✅ 简单可靠

### 方案二：租户自助确认（当前方案）

**适用场景：**
- 租户自助交费
- 商户信任租户

**流程：**
1. 租户查看账单
2. 租户扫码支付
3. **租户点击"确认已支付"**
4. 系统记录并发券

**优点：**
- ✅ 完全自助
- ✅ 无需商户操作
- ✅ 效率最高

**风险：**
- ⚠️ 可能被恶意点击（但现场支付，风险很小）

### 方案三：双向确认（最安全）

**适用场景：**
- 金额较大
- 需要双重确认

**流程：**
1. 租户查看账单并扫码支付
2. 租户点击"我已支付"
3. **商户收到通知**
4. 商户确认收到款后点击"确认收款"
5. 系统记录并发券

**优点：**
- ✅ 双重确认，最安全
- ✅ 有支付记录

**缺点：**
- ⚠️ 需要两步操作

---

## 🛠️ 技术实现

### 方案一：商户端确认（推荐实现）

#### 1. 商户端页面

创建文件：`src/app/admin/confirm-payment/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';

interface PendingPayment {
  id: string;
  tenantName: string;
  tenantPhone: string;
  billType: string;
  amount: string;
  createdAt: string;
}

export default function ConfirmPaymentPage() {
  const [adminPhone, setAdminPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // 管理员登录
  const handleLogin = () => {
    const adminPhones = process.env.NEXT_PUBLIC_ADMIN_PHONES?.split(',') || [];
    if (adminPhones.includes(adminPhone)) {
      setIsLoggedIn(true);
      loadPendingPayments();
    } else {
      alert('无权限访问');
    }
  };

  // 加载待确认支付
  const loadPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/pending');
      const data = await res.json();
      if (data.success) {
        setPendingPayments(data.data);
      }
    } catch (error) {
      console.error('加载失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 确认收款
  const handleConfirm = async (paymentId: string) => {
    if (!confirm('确认已收到款项？')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, adminPhone }),
      });

      const data = await res.json();
      if (data.success) {
        alert('确认成功！' + (data.coupon ? '\n已自动发放优惠券' : ''));
        loadPendingPayments();
      } else {
        alert(data.error || '确认失败');
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 拒绝支付
  const handleReject = async (paymentId: string) => {
    if (!confirm('确认拒绝此支付？')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, adminPhone }),
      });

      const data = await res.json();
      if (data.success) {
        alert('已拒绝');
        loadPendingPayments();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">商户确认收款</h1>
            <p className="text-gray-600">请输入管理员手机号登录</p>
          </div>

          <div className="space-y-4">
            <input
              type="tel"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="管理员手机号"
              autoFocus
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">待确认收款</h1>
              <p className="text-gray-600 mt-1">
                共 {pendingPayments.length} 笔待确认
              </p>
            </div>
            <button
              onClick={loadPendingPayments}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>

        {/* 待确认列表 */}
        {pendingPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              暂无待确认收款
            </h3>
            <p className="text-gray-600">所有支付已处理完成</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.tenantName}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {payment.tenantPhone}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        类型：
                        {payment.billType === 'rent' ? '🏠 房租' : '⚡ 电费'}
                      </div>
                      <div>
                        时间：{new Date(payment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ￥{parseFloat(payment.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(payment.id)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-semibold"
                  >
                    ✓ 确认收款
                  </button>
                  <button
                    onClick={() => handleReject(payment.id)}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 disabled:opacity-50 font-semibold"
                  >
                    ✗ 拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2. API 接口

创建文件：`src/app/api/payments/pending/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { payments, bills, tenants } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 查询待确认的支付记录
    const pendingPayments = await db
      .select({
        id: payments.id,
        tenantId: payments.tenantId,
        billId: payments.billId,
        amount: payments.amount,
        type: payments.type,
        createdAt: payments.createdAt,
        tenantName: tenants.name,
        tenantPhone: tenants.phone,
        billType: bills.type,
      })
      .from(payments)
      .leftJoin(tenants, eq(payments.tenantId, tenants.id))
      .leftJoin(bills, eq(payments.billId, bills.id))
      .where(eq(payments.status, 'pending'))
      .orderBy(payments.createdAt);

    return NextResponse.json({
      success: true,
      data: pendingPayments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

创建文件：`src/app/api/payments/confirm/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymentManager, billManager, couponManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, adminPhone } = await request.json();

    // 验证管理员权限
    const adminPhones = process.env.ADMIN_PHONES?.split(',') || [];
    if (!adminPhones.includes(adminPhone)) {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    // 获取支付记录
    const payment = await paymentManager.getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: '支付记录不存在' },
        { status: 404 }
      );
    }

    // 更新支付状态为已完成
    await paymentManager.updatePaymentStatus(paymentId, 'completed');

    // 更新账单状态
    if (payment.billId) {
      await billManager.updateBillStatus(
        payment.billId,
        'paid',
        payment.amount,
        new Date()
      );

      // 如果是电费，自动发放优惠券
      let coupon = null;
      if (payment.type === 'electricity') {
        coupon = await couponManager.generateCouponByBill(
          payment.tenantId,
          payment.billId,
          payment.amount
        );
      }

      return NextResponse.json({
        success: true,
        message: '确认成功',
        coupon,
      });
    }

    return NextResponse.json({
      success: true,
      message: '确认成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### 3. 修改现有支付流程

修改文件：`src/app/api/payments/route.ts`

```typescript
// 在 POST 方法中，创建支付记录时设置状态为 pending
const paymentData: InsertPayment = {
  tenantId: body.tenantId,
  billId,
  amount: body.amount,
  type: body.type,
  paymentMethod: body.paymentMethod || 'wechat',
  transactionId: body.transactionId,
  status: 'pending', // 改为待确认状态
  remarks: body.remarks,
};

const payment = await paymentManager.createPayment(paymentData);

return NextResponse.json({
  success: true,
  data: payment,
  message: '支付提交成功，等待商户确认',
});
```

---

## 📱 使用场景

### 场景一：租户到店交费

```
1. 租户到店
2. 商户打开 /admin/confirm-payment 页面
3. 租户扫码或输入手机号查看账单
4. 租户扫商户收款码支付
5. 租户点击"确认已支付"
6. 商户在自己手机上看到待确认提示
7. 商户确认收到款后点击"确认收款"
8. 系统记录并自动发券
```

### 场景二：完全自助（信任模式）

```
1. 租户扫码查看账单
2. 租户扫收款码支付
3. 租户点击"确认已支付"
4. 系统直接记录并发券（跳过商户确认）
```

---

## ⚙️ 配置选项

### 环境变量配置

```env
# .env.local

# 是否需要商户确认（true=需要确认，false=自动完成）
REQUIRE_MERCHANT_CONFIRM=true

# 管理员手机号（用于商户确认）
ADMIN_PHONES=13800138000,13900139000

# 自动确认金额阈值（小于此金额自动确认，大于需要商户确认）
AUTO_CONFIRM_THRESHOLD=100
```

### 灵活配置

修改 `src/app/api/payments/route.ts`：

```typescript
// 根据金额决定是否需要确认
const amount = parseFloat(body.amount);
const threshold = parseFloat(process.env.AUTO_CONFIRM_THRESHOLD || '0');
const requireConfirm = process.env.REQUIRE_MERCHANT_CONFIRM === 'true';

let status = 'completed'; // 默认自动完成

if (requireConfirm) {
  // 需要商户确认
  status = 'pending';
} else if (threshold > 0 && amount >= threshold) {
  // 金额超过阈值，需要确认
  status = 'pending';
}

const paymentData: InsertPayment = {
  // ...
  status,
};
```

---

## 🎨 界面优化

### 1. 首页添加商户入口

修改 `src/app/page.tsx`，添加：

```typescript
<a
  href="/admin/confirm-payment"
  className="p-6 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors"
>
  <div className="text-4xl mb-3">💼</div>
  <h3 className="text-lg font-semibold text-gray-900 mb-1">
    商户确认收款
  </h3>
  <p className="text-sm text-gray-600">
    确认租户支付
  </p>
</a>
```

### 2. 支付成功页面优化

修改 `src/app/pay/pay-client.tsx`：

```typescript
{step === 'success' && (
  <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1 className="text-3xl font-bold text-gray-900 mb-3">提交成功！</h1>
    <p className="text-lg text-gray-600 mb-2">支付金额：￥{totalAmount.toFixed(2)}</p>
    
    {/* 根据配置显示不同提示 */}
    {process.env.NEXT_PUBLIC_REQUIRE_MERCHANT_CONFIRM === 'true' ? (
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-blue-700">
          ⏳ 等待商户确认收款...
        </p>
        <p className="text-sm text-blue-600 mt-2">
          商户确认后将自动发放优惠券
        </p>
      </div>
    ) : (
      coupon && (
        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-semibold text-yellow-700">已自动发放返现券</p>
          <p className="text-yellow-600">{coupon.description}</p>
        </div>
      )
    )}

    <a
      href="/"
      className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
    >
      返回首页
    </a>
  </div>
)}
```

---

## 📊 数据库调整

需要在 paymentManager 中添加方法：

```typescript
// src/storage/database/paymentManager.ts

// 获取单个支付记录
async getPaymentById(id: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);
  
  return result[0] || null;
}

// 更新支付状态
async updatePaymentStatus(id: string, status: string) {
  await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, id));
}
```

---

## ✅ 总结

### 最终方案特点

- ✅ **简单实用**：只做数字记录
- ✅ **灵活配置**：可选商户确认或自动完成
- ✅ **现场支付**：适合当面收款场景
- ✅ **自动发券**：确认后自动发放优惠券
- ✅ **无需第三方**：不依赖任何支付接口

### 推荐配置

**小额自动，大额确认：**
```env
REQUIRE_MERCHANT_CONFIRM=false
AUTO_CONFIRM_THRESHOLD=500
```
- 小于500元：自动完成
- 大于500元：需要商户确认

**完全自助：**
```env
REQUIRE_MERCHANT_CONFIRM=false
AUTO_CONFIRM_THRESHOLD=0
```
- 所有金额自动完成

**全部确认：**
```env
REQUIRE_MERCHANT_CONFIRM=true
```
- 所有支付需要商户确认

---

需要我帮你实现这个简化方案吗？我可以：
1. ✅ 创建商户确认页面
2. ✅ 修改现有支付流程
3. ✅ 添加灵活配置选项
4. ✅ 优化用户界面

告诉我你的选择！🚀
