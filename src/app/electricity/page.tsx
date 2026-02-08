'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  phone: string;
  roomNumber: string;
  roomId: string;
  status: string;
}

export default function ElectricityManagement() {
  const [step, setStep] = useState<'tenant' | 'confirm' | 'success'>('tenant');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [usage, setUsage] = useState('');
  const [unitPrice, setUnitPrice] = useState('0.6'); // 默认电价 0.6 元/度
  const [loading, setLoading] = useState(false);

  const loadTenants = async () => {
    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      if (data.success) {
        // 只显示在住的租户
        const activeTenants = data.data.filter((t: Tenant) => t.status === 'active');
        setTenants(activeTenants);
      }
    } catch (error) {
      console.error('加载租户失败:', error);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const calculateAmount = () => {
    if (!usage || !selectedTenant) return 0;
    return (parseFloat(usage) * parseFloat(unitPrice)).toFixed(2);
  };

  const handleGenerateBill = async () => {
    if (!selectedTenant || !usage) {
      alert('请选择租户并输入用电量');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          roomId: selectedTenant.roomId,
          type: 'electricity',
          amount: calculateAmount(),
          details: JSON.stringify({
            usage: parseFloat(usage),
            unitPrice: parseFloat(unitPrice),
          }),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        alert(data.error || '生成账单失败');
      }
    } catch (error) {
      alert('生成账单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  const handleReset = () => {
    setStep('tenant');
    setSelectedTenant(null);
    setUsage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</Link>
            <h1 className="text-lg font-bold text-gray-900">⚡ 电费管理</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤1：选择租户 */}
        {step === 'tenant' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">创建电费账单</h2>
              <p className="text-gray-600">选择租户，输入用电量生成账单</p>
            </div>

            {tenants.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无在住租户</h3>
                <p className="text-gray-600 mb-6">需要租户入住后才能创建电费账单</p>
                <Link
                  href="/checkin"
                  className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700"
                >
                  去办理入住
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择租户</label>
                  <div className="space-y-2">
                    {tenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        onClick={() => setSelectedTenant(tenant)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedTenant?.id === tenant.id
                            ? 'bg-yellow-100 border-2 border-yellow-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedTenant?.id === tenant.id
                                ? 'bg-yellow-500 border-yellow-500 text-white'
                                : 'border-gray-300'
                            }`}>
                              {selectedTenant?.id === tenant.id && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{tenant.name}</div>
                              <div className="text-sm text-gray-500">
                                {tenant.roomNumber} · {tenant.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTenant && (
                  <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        用电量（度）
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={usage}
                        onChange={(e) => setUsage(e.target.value)}
                        className="w-full px-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="请输入用电量"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        单价（元/度）
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    {usage && (
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">预估金额</span>
                          <span className="text-3xl font-bold text-yellow-600">
                            ￥{calculateAmount()}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleConfirm}
                      disabled={!usage}
                      className="w-full px-6 py-4 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
                    >
                      下一步
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 步骤2：确认信息 */}
        {step === 'confirm' && selectedTenant && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">确认账单信息</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">租户姓名</span>
                <span className="font-semibold text-gray-900">{selectedTenant.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">房间号</span>
                <span className="font-semibold text-gray-900">{selectedTenant.roomNumber}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">用电量</span>
                <span className="font-semibold text-gray-900">{usage} 度</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">单价</span>
                <span className="font-semibold text-gray-900">￥{unitPrice}/度</span>
              </div>
              <div className="flex justify-between items-center py-4 bg-yellow-50 rounded-xl px-4">
                <span className="text-lg font-semibold text-gray-900">应付金额</span>
                <span className="text-3xl font-bold text-yellow-600">
                  ￥{calculateAmount()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerateBill}
                disabled={loading}
                className="w-full px-6 py-4 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:bg-gray-300 font-semibold text-lg"
              >
                {loading ? '生成中...' : '确认生成账单'}
              </button>
              <button
                onClick={() => setStep('tenant')}
                className="w-full px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                返回修改
              </button>
            </div>
          </div>
        )}

        {/* 步骤3：成功 */}
        {step === 'success' && selectedTenant && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">账单生成成功！</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg text-gray-600">
                {selectedTenant.name} - {selectedTenant.roomNumber}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                ￥{calculateAmount()}
              </p>
            </div>

            <p className="text-gray-600 mb-8">
              账单已发送至租户账单列表，租户可在"账单支付"中完成支付
            </p>

            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full px-6 py-4 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 font-semibold text-lg"
              >
                继续创建账单
              </button>
              <Link
                href="/"
                className="block w-full px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-center"
              >
                返回首页
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
