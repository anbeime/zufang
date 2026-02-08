'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Tenant {
  id: string;
  name: string;
  phone: string;
  availableCoupons?: any[];
}

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'phone' | 'pay' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
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

  const handleSearchTenant = async () => {
    if (!phone || phone.length < 11) {
      alert('请输入正确的手机号');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/tenants?phone=${phone}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const tenantData = data.data[0];
        // 获取完整的租户详情包括优惠券
        const detailRes = await fetch(`/api/tenants/${tenantData.id}`);
        const detailData = await detailRes.json();
        if (detailData.success) {
          setTenant(detailData.data);
          setStep('pay');
        }
      } else {
        alert('未找到该租户，请检查手机号是否正确');
      }
    } catch (error) {
      alert('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!tenant) return;

    const totalAmount = parseFloat(amount);
    if (!totalAmount || totalAmount <= 0) {
      alert('请输入有效的付款金额');
      return;
    }

    // 检查优惠券最低消费要求
    if (selectedCoupon) {
      const minSpend = parseFloat(selectedCoupon.minSpend);
      if (totalAmount < minSpend) {
        alert(`该优惠券最低消费 ￥${minSpend}`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        tenantId: tenant.id,
        totalAmount: amount,
        items: [{
          name: '商超购物',
          price: amount,
          quantity: 1,
        }],
      };

      if (selectedCoupon) {
        payload.couponId = selectedCoupon.id;
      }

      const res = await fetch('/api/supermarket-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setOrderId(data.data.order.id);
        setStep('success');
      } else {
        alert(data.error || '支付失败');
      }
    } catch (error) {
      alert('支付失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = parseFloat(amount) || 0;
    if (selectedCoupon) {
      const couponAmount = parseFloat(selectedCoupon.amount);
      total -= couponAmount;
    }
    return Math.max(0, total).toFixed(2);
  };

  // 组件未挂载时显示加载
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">商超收银</h1>
          <p className="text-gray-600">扫码输入金额，自动抵扣优惠券</p>
        </div>

        {/* 步骤1：输入手机号 */}
        {step === 'phone' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
              <h2 className="text-xl font-semibold text-gray-900">输入手机号</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">输入租户手机号</label>
                {isScanned && (
                  <div className="mb-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                    <span>✓</span>
                    <span>扫码已自动识别您的手机号</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchTenant()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入手机号"
                    autoFocus
                  />
                  <button
                    onClick={handleSearchTenant}
                    disabled={loading || phone.length < 11}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 font-medium"
                  >
                    {loading ? '查询中...' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 步骤2：输入金额和选择优惠券 */}
        {step === 'pay' && tenant && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">✓</div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                <h2 className="text-xl font-semibold text-gray-900">确认支付</h2>
              </div>
              <div className="text-sm text-gray-600">
                租户：{tenant.name} ({tenant.phone})
              </div>
            </div>

            <div className="space-y-6 mb-6">
              {/* 付款金额输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">付款金额（元）</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">￥</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePay()}
                    className="w-full pl-12 pr-4 py-6 text-4xl font-bold text-gray-900 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* 优惠券选择 */}
              {tenant.availableCoupons && tenant.availableCoupons.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    可用优惠券 ({tenant.availableCoupons.length}张)
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCoupon(null)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        !selectedCoupon
                          ? 'bg-white border-2 border-green-500 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">不使用优惠券</div>
                        </div>
                        {!selectedCoupon && (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    {tenant.availableCoupons.map((coupon: any) => (
                      <button
                        key={coupon.id}
                        onClick={() => setSelectedCoupon(coupon)}
                        disabled={!!(amount && parseFloat(amount) < parseFloat(coupon.minSpend))}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedCoupon?.id === coupon.id
                            ? 'bg-white border-2 border-green-500 shadow-sm'
                            : 'bg-white border border-gray-200 hover:border-gray-300'
                        } ${amount && parseFloat(amount) < parseFloat(coupon.minSpend) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              ￥{parseFloat(coupon.amount).toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              满￥{parseFloat(coupon.minSpend).toFixed(0)}可用
                            </div>
                          </div>
                          {selectedCoupon?.id === coupon.id && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 支付按钮 */}
            <div className="space-y-3">
              <button
                onClick={handlePay}
                disabled={loading || !amount}
                className="w-full px-4 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? '支付中...' : `支付 ￥${calculateTotal()}`}
              </button>

              <button
                onClick={() => setStep('phone')}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                返回
              </button>
            </div>
          </div>
        )}

        {/* 步骤3：支付成功 */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">支付成功！</h1>
            <p className="text-lg text-gray-600 mb-2">实付：￥{calculateTotal()}</p>
            {selectedCoupon && (
              <p className="text-sm text-green-600 mb-6">已使用优惠券优惠 ￥{parseFloat(selectedCoupon.amount).toFixed(2)}</p>
            )}
            <p className="text-sm text-gray-500 mb-6">订单号：{orderId}</p>
            <button
              onClick={() => {
                setStep('phone');
                setAmount('');
                setSelectedCoupon(null);
                setOrderId('');
                setTenant(null);
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
