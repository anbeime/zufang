'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutRoomContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'phone' | 'confirm' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [tenant, setTenant] = useState<any>(null);
  const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
  const [refundDeposit, setRefundDeposit] = useState(true);
  const [isScanned, setIsScanned] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件已挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 检查URL参数，如果扫个人二维码自动填充手机号
  useEffect(() => {
    if (!isMounted) return;
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
      setIsScanned(true);
    }
  }, [searchParams, isMounted]);

  const handleFindTenant = async () => {
    if (!phone) {
      alert('请输入手机号');
      return;
    }

    setLoading(true);

    try {
      // 查询租户（只使用手机号）
      const tenantsRes = await fetch(`/api/tenants?phone=${phone}`);
      const tenantsData = await tenantsRes.json();

      if (!tenantsData.success || tenantsData.data.length === 0) {
        alert('未找到该租户');
        setLoading(false);
        return;
      }

      const tenantData = tenantsData.data[0];
      setTenant(tenantData);

      // 获取未付账单
      const detailRes = await fetch(`/api/tenants/${tenantData.id}`);
      const detailData = await detailRes.json();

      if (detailData.success) {
        setUnpaidBills(detailData.data.unpaidBills || []);
        setStep('confirm');
      }
    } catch (error) {
      alert('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (unpaidBills.length > 0) {
      alert('还有未支付的账单，请先支付');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundDeposit,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        alert(data.error || '退房失败');
      }
    } catch (error) {
      alert('退房失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件未挂载时显示加载
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤1：输入手机号 */}
        {step === 'phone' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚪</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">扫码退房</h1>
              <p className="text-gray-600">输入手机号办理退房手续</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                {isScanned && (
                  <div className="mb-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                    <span>✓</span>
                    <span>扫码已自动识别您的手机号</span>
                  </div>
                )}
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFindTenant()}
                  className="w-full px-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入手机号"
                  autoFocus
                />
              </div>

              <button
                onClick={handleFindTenant}
                disabled={loading || phone.length < 11}
                className="w-full px-4 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? '查询中...' : '下一步'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700 text-center">
                💡 退房时押金将自动结算并退回
              </p>
            </div>
          </div>
        )}

        {/* 步骤2：确认退房 */}
        {step === 'confirm' && tenant && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">确认退房信息</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span>{tenant.name}</span>
                <span className="text-gray-300">·</span>
                <span>{tenant.phone}</span>
              </div>
            </div>

            {/* 账单状态 */}
            <div className={`p-4 rounded-xl mb-6 ${
              unpaidBills.length === 0
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {unpaidBills.length === 0 ? (
                  <>
                    <span className="text-2xl">✓</span>
                    <span className="font-semibold text-green-700">账单已全部结清</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">⚠️</span>
                    <span className="font-semibold text-red-700">还有未支付的账单</span>
                  </>
                )}
              </div>
              {unpaidBills.length > 0 && (
                <div className="mt-3 space-y-2">
                  {unpaidBills.map((bill) => (
                    <div key={bill.id} className="flex justify-between text-sm">
                      <span>{bill.type === 'rent' ? '房租' : '电费'}</span>
                      <span className="font-semibold">￥{parseFloat(bill.amount).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>总计</span>
                    <span>￥{unpaidBills.reduce((sum: number, b: any) => sum + parseFloat(b.amount), 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 押金信息 */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <span className="font-semibold text-blue-700">押金结算</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">押金金额</span>
                <span className="text-2xl font-bold text-blue-600">
                  ￥{parseFloat(tenant.deposit).toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="refund"
                  checked={refundDeposit}
                  onChange={(e) => setRefundDeposit(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="refund" className="text-sm text-gray-700">
                  退房时退还押金
                </label>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || unpaidBills.length > 0}
              className="w-full px-4 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? '处理中...' : '确认退房'}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full mt-4 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              返回
            </button>
          </div>
        )}

        {/* 步骤3：退房成功 */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">退房成功</h1>
            <p className="text-gray-600 mb-8">感谢您的入住，期待再次见面！</p>

            {refundDeposit && tenant && (
              <div className="bg-blue-50 rounded-xl p-4 mb-8">
                <p className="text-sm text-blue-700">
                  押金 ￥{parseFloat(tenant.deposit).toFixed(2)} 已退还
                </p>
              </div>
            )}

            <Link
              href="/"
              className="inline-block px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-lg"
            >
              返回首页
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
