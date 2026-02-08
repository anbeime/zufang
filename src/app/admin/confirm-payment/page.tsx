'use client';

import { useState, useEffect } from 'react';

interface PendingPayment {
  id: string;
  tenantName: string;
  tenantPhone: string;
  billType: string;
  amount: string;
  createdAt: string;
  tenantId: string;
  billId: string;
}

export default function ConfirmPaymentPage() {
  const [adminPhone, setAdminPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // 管理员登录
  const handleLogin = () => {
    const adminPhones = (process.env.NEXT_PUBLIC_ADMIN_PHONES || '').split(',');
    if (adminPhones.includes(adminPhone)) {
      setIsLoggedIn(true);
      localStorage.setItem('adminPhone', adminPhone);
      loadPendingPayments();
    } else {
      alert('无权限访问');
    }
  };

  // 页面加载时检查是否已登录
  useEffect(() => {
    const savedPhone = localStorage.getItem('adminPhone');
    if (savedPhone) {
      setAdminPhone(savedPhone);
      const adminPhones = (process.env.NEXT_PUBLIC_ADMIN_PHONES || '').split(',');
      if (adminPhones.includes(savedPhone)) {
        setIsLoggedIn(true);
        loadPendingPayments();
      }
    }
  }, []);

  // 加载待确认支付
  const loadPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/pending');
      const data = await res.json();
      if (data.success) {
        setPendingPayments(data.data || []);
      }
    } catch (error) {
      console.error('加载失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 确认收款
  const handleConfirm = async (payment: PendingPayment) => {
    if (!confirm(`确认已收到 ${payment.tenantName} 的 ￥${parseFloat(payment.amount).toFixed(2)} 吗？`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          adminPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        let message = '确认成功！';
        if (data.coupon) {
          message += `\n已自动发放 ￥${parseFloat(data.coupon.amount).toFixed(0)} 优惠券`;
        }
        alert(message);
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
  const handleReject = async (payment: PendingPayment) => {
    const reason = prompt('请输入拒绝原因（可选）：');
    if (reason === null) return; // 用户取消

    setLoading(true);
    try {
      const res = await fetch('/api/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          adminPhone,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('已拒绝该支付');
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

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('adminPhone');
    setIsLoggedIn(false);
    setAdminPhone('');
    setPendingPayments([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💼</span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="管理员手机号"
              autoFocus
            />
            <button
              onClick={handleLogin}
              disabled={!adminPhone}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
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
            <div className="flex gap-2">
              <button
                onClick={loadPendingPayments}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {loading ? '刷新中...' : '刷新'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                退出
              </button>
            </div>
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
                        {payment.billType === 'rent' ? '🏠 房租' : 
                         payment.billType === 'electricity' ? '⚡ 电费' : '💧 水费'}
                      </div>
                      <div>
                        时间：{new Date(payment.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ￥{parseFloat(payment.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      大额支付
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(payment)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-semibold"
                  >
                    ✓ 确认收款
                  </button>
                  <button
                    onClick={() => handleReject(payment)}
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
