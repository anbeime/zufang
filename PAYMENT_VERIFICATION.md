# 租房用电商超通系统 - 支付凭证功能说明

## 📱 功能概述

为了防止恶意点击"确认已支付"，系统增加了**支付凭证上传**功能：

### 用户端流程
1. 用户扫收款码支付
2. 用户上传支付截图（可选）
3. 点击"确认已支付"
4. 系统记录支付信息

### 商户端流程
1. 查看待审核支付列表
2. 对比支付截图和实际收款
3. 批准或拒绝支付
4. 批准后自动发放优惠券

---

## 🔧 技术实现

### 1. 支付凭证上传 API

**接口**: `POST /api/payments`

**支持两种方式**:

#### 方式一：不上传凭证（当前方式）
```javascript
await fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenantId: 'xxx',
    billId: 'xxx',
    amount: '100.00',
    type: 'electricity',
    paymentMethod: 'wechat',
  }),
});
```

**结果**: 支付直接完成，自动发券

#### 方式二：上传凭证（推荐）
```javascript
const formData = new FormData();
formData.append('tenantId', 'xxx');
formData.append('billId', 'xxx');
formData.append('amount', '100.00');
formData.append('type', 'electricity');
formData.append('paymentMethod', 'wechat');
formData.append('screenshot', file); // 支付截图

await fetch('/api/payments', {
  method: 'POST',
  body: formData,
});
```

**结果**: 支付状态为"待审核"，需商户批准

---

### 2. 商户审核 API

**接口**: `PUT /api/payments/verify`

```javascript
// 批准支付
await fetch('/api/payments/verify', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId: 'xxx',
    action: 'approve', // 或 'reject'
    adminPhone: '13800138000',
  }),
});
```

**接口**: `GET /api/payments/verify?adminPhone=13800138000`

获取待审核支付列表

---

## 📱 前端改造示例

### 修改支付页面（pay-client.tsx）

在收款码弹窗中添加上传功能：

```typescript
const [screenshot, setScreenshot] = useState<File | null>(null);

// 在收款码弹窗中添加
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    上传支付截图（可选）
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  />
  {screenshot && (
    <div className="mt-2 text-sm text-green-600">
      ✓ 已选择: {screenshot.name}
    </div>
  )}
</div>

// 修改确认支付函数
const handleConfirmPayment = async () => {
  setLoading(true);
  setShowQrCode(false);

  try {
    for (const billId of selectedBills) {
      const bill = bills.find(b => b.id === billId);
      if (bill) {
        const formData = new FormData();
        formData.append('tenantId', tenant.id);
        formData.append('billId', billId);
        formData.append('amount', bill.amount);
        formData.append('type', bill.type);
        formData.append('paymentMethod', 'wechat');
        
        if (screenshot) {
          formData.append('screenshot', screenshot);
        }

        await fetch('/api/payments', {
          method: 'POST',
          body: formData,
        });
      }
    }

    setStep('success');
  } catch (error) {
    alert('支付失败');
  } finally {
    setLoading(false);
  }
};
```

---

### 添加商户审核页面

创建文件：`src/app/admin/payments/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function PaymentVerifyPage() {
  const [payments, setPayments] = useState([]);
  const [adminPhone, setAdminPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    if (!adminPhone) return;
    
    const res = await fetch(`/api/payments/verify?adminPhone=${adminPhone}`);
    const data = await res.json();
    
    if (data.success) {
      setPayments(data.data);
    }
  };

  const handleVerify = async (paymentId: string, action: 'approve' | 'reject') => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action,
          adminPhone,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        loadPayments();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">支付审核</h1>

        {/* 管理员登录 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">管理员手机号</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="请输入管理员手机号"
            />
            <button
              onClick={loadPayments}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              查询
            </button>
          </div>
        </div>

        {/* 待审核列表 */}
        {payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div key={payment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {payment.type === 'electricity' ? '⚡ 电费' : '🏠 房租'}
                    </div>
                    <div className="text-sm text-gray-600">
                      租户ID: {payment.tenantId}
                    </div>
                    <div className="text-sm text-gray-600">
                      金额: ￥{parseFloat(payment.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      时间: {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* 支付截图 */}
                  {payment.remarks?.includes('支付凭证：') && (
                    <div>
                      <img
                        src={payment.remarks.match(/https?:\/\/[^\s]+/)?.[0]}
                        alt="支付凭证"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(payment.id, 'approve')}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    批准
                  </button>
                  <button
                    onClick={() => handleVerify(payment.id, 'reject')}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {payments.length === 0 && adminPhone && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-4xl mb-4">✓</div>
            <div className="text-gray-600">暂无待审核支付</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📋 配置建议

### 方案一：强制上传凭证（推荐）
- 所有支付必须上传截图
- 商户审核后才完成支付
- 安全性最高

### 方案二：可选上传凭证（当前）
- 用户可选择是否上传
- 不上传则直接完成
- 上传则需审核
- 灵活性高

### 方案三：金额阈值
- 小额支付（<100元）直接完成
- 大额支付（≥100元）需上传凭证
- 平衡安全与体验

---

## 🔐 安全增强

### 1. 添加支付密码
```typescript
// 在支付确认时要求输入密码
const [paymentPassword, setPaymentPassword] = useState('');

// 验证密码
if (paymentPassword !== tenant.paymentPassword) {
  alert('支付密码错误');
  return;
}
```

### 2. 限制支付频率
```typescript
// 同一租户5分钟内只能支付一次
const lastPaymentTime = await getLastPaymentTime(tenantId);
if (Date.now() - lastPaymentTime < 5 * 60 * 1000) {
  return NextResponse.json(
    { success: false, error: '操作过于频繁，请稍后再试' },
    { status: 429 }
  );
}
```

### 3. 支付通知
```typescript
// 支付成功后发送短信通知商户
await sendSMS(adminPhone, `收到新支付：￥${amount}`);
```

---

## 📊 数据统计

在管理后台添加：
- 今日收款总额
- 待审核支付数量
- 已拒绝支付列表
- 收款趋势图表

---

## 🎯 总结

**当前状态**:
- ✅ 支持个人收款码支付
- ✅ 支持支付凭证上传
- ✅ 支持商户审核
- ✅ 自动发放优惠券

**建议配置**:
1. 启用支付凭证上传（可选或强制）
2. 添加商户审核页面
3. 定期导出对账单
4. 设置支付通知

**部署后测试**:
1. 测试不上传凭证的支付流程
2. 测试上传凭证的支付流程
3. 测试商户审核功能
4. 测试优惠券自动发放

完成以上配置后，系统即可安全运行！🎉
