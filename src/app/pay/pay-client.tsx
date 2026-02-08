'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Bill {
  id: string;
  type: string;
  amount: string;
  status: string;
  details?: string;
  roomId: string;
  createdAt: string;
}

export default function PayContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'phone' | 'bills' | 'qrcode' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [tenant, setTenant] = useState<any>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [showQrCode, setShowQrCode] = useState(false);
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

  const handleFindBills = async () => {
    if (!phone) {
      alert('请输入手机号');
      return;
    }

    setLoading(true);

    try {
      // 查询租户（只支持手机号）
      const tenantsRes = await fetch(`/api/tenants?phone=${phone}`);
      const tenantsData = await tenantsRes.json();

      if (!tenantsData.success || tenantsData.data.length === 0) {
        alert('未找到该租户，请检查手机号是否正确');
        setLoading(false);
        return;
      }

      const tenantData = tenantsData.data[0];
      setTenant(tenantData);

      // 获取租户详情（包含未付账单）
      const detailRes = await fetch(`/api/tenants/${tenantData.id}`);
      const detailData = await detailRes.json();

      if (detailData.success) {
        setBills(detailData.data.unpaidBills || []);
        setStep('bills');
      }
    } catch (error) {
      alert('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBill = (billId: string) => {
    if (selectedBills.includes(billId)) {
      setSelectedBills(selectedBills.filter(id => id !== billId));
    } else {
      setSelectedBills([...selectedBills, billId]);
    }
  };

  const handlePayAll = () => {
    setSelectedBills(bills.map(b => b.id));
  };

  const handlePay = () => {
    if (selectedBills.length === 0) {
      alert('请选择要支付的账单');
      return;
    }
    setShowQrCode(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setShowQrCode(false);

    try {
      let needsConfirmation = false;
      let responseCoupon = null;

      // 逐个支付账单
      for (const billId of selectedBills) {
        const bill = bills.find(b => b.id === billId);
        if (bill) {
          const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId: tenant.id,
              billId,
              amount: bill.amount,
              type: bill.type,
              paymentMethod: 'wechat',
            }),
          });

          const data = await res.json();
          if (data.needsConfirmation) {
            needsConfirmation = true;
          }
          if (data.coupon) {
            responseCoupon = data.coupon;
          }
        }
      }

      // 保存状态用于成功页面显示
      if (needsConfirmation) {
        setCoupon({ needsConfirmation: true });
      } else if (responseCoupon) {
        setCoupon(responseCoupon);
      }

      setStep('success');
    } catch (error) {
      alert('支付失败');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedBills.reduce((sum, billId) => {
    const bill = bills.find(b => b.id === billId);
    return sum + (bill ? parseFloat(bill.amount) : 0);
  }, 0);

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
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤1：输入登录信息 */}
        {step === 'phone' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💳</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">扫码交费</h1>
              <p className="text-gray-600">输入手机号查看未付账单</p>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleFindBills()}
                  className="w-full px-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入手机号"
                  autoFocus
                />
              </div>

              <button
                onClick={handleFindBills}
                disabled={loading || phone.length < 11}
                className="w-full px-4 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? '查询中...' : '查看账单'}
              </button>
            </div>
          </div>
        )}

        {/* 步骤2：选择账单 */}
        {step === 'bills' && tenant && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">未付账单</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span>{tenant.name}</span>
                <span className="text-gray-300">·</span>
                <span>{tenant.phone}</span>
              </div>
            </div>

            {bills.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">没有未付账单</h3>
                <p className="text-gray-600 mb-6">所有账单已结清</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  返回首页
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {bills.map((bill) => (
                    <div
                      key={bill.id}
                      onClick={() => handleSelectBill(bill.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedBills.includes(bill.id)
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedBills.includes(bill.id)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300'
                          }`}>
                            {selectedBills.includes(bill.id) && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {bill.type === 'rent' ? '🏠 房租' : bill.type === 'water' ? '💧 水费' : '⚡ 电费'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(bill.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          ￥{parseFloat(bill.amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedBills.length > 0 && (
                  <>
                    <div className="bg-green-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">应付金额</span>
                        <span className="text-3xl font-bold text-green-600">
                          ￥{totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-2">
                        💡 电费满100元自动发5元券，满300发30元券，购物时自动抵扣
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('phone')}
                        className="flex-1 px-4 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        返回
                      </button>
                      <button
                        onClick={handlePay}
                        disabled={loading}
                        className="flex-1 px-4 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-semibold"
                      >
                        {loading ? '支付中...' : `支付 ￥${totalAmount.toFixed(2)}`}
                      </button>
                    </div>
                  </>
                )}

                {selectedBills.length === 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('phone')}
                      className="flex-1 px-4 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                    >
                      返回
                    </button>
                    <button
                      onClick={handlePayAll}
                      className="flex-1 px-4 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
                    >
                      全选并支付
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 步骤3：支付成功 */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {coupon?.needsConfirmation ? '提交成功！' : '支付成功！'}
            </h1>
            <p className="text-lg text-gray-600 mb-2">支付金额：￥{totalAmount.toFixed(2)}</p>
            
            {/* 根据金额显示不同提示 */}
            {coupon?.needsConfirmation ? (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="text-3xl mb-2">⏳</div>
                <p className="font-semibold text-blue-700">等待商户确认收款</p>
                <p className="text-blue-600 mt-2">
                  金额较大（≥￥{process.env.NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD || '500'}），需要商户确认
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  商户确认后将自动发放优惠券
                </p>
              </div>
            ) : coupon ? (
              <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-semibold text-yellow-700">已自动发放返现券</p>
                <p className="text-yellow-600">{coupon.description}</p>
                <p className="text-sm text-yellow-600 mt-2">可在商超购物时自动抵扣</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="text-3xl mb-2">✓</div>
                <p className="font-semibold text-green-700">支付已记录</p>
                <p className="text-sm text-green-600 mt-2">
                  小额支付（&lt;￥{process.env.NEXT_PUBLIC_AUTO_CONFIRM_THRESHOLD || '500'}），自动完成
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <a
                href="/my-coupons"
                className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="text-3xl mb-2">🎫</div>
                <div className="font-semibold text-gray-900">查看我的券</div>
              </a>
              <a
                href="/checkout"
                className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="text-3xl mb-2">🛒</div>
                <div className="font-semibold text-gray-900">去购物</div>
              </a>
            </div>

            <a
              href="/"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              返回首页
            </a>
          </div>
        )}

        {/* 收款码弹窗 */}
        {showQrCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">扫码支付</h3>
                <p className="text-gray-600">请使用微信或支付宝扫码支付</p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src="/收款码.jpg"
                    alt="收款码"
                    className="w-64 h-64 object-contain border-4 border-gray-100 rounded-2xl"
                  />
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    收款码
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">应付金额</div>
                  <div className="text-4xl font-bold text-blue-700">
                    ￥{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-semibold text-lg"
                >
                  {loading ? '确认中...' : '确认已支付'}
                </button>
                <button
                  onClick={() => setShowQrCode(false)}
                  disabled={loading}
                  className="w-full px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  取消支付
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>💡 扫码支付完成后，请点击"确认已支付"</p>
                <p className="mt-1">如遇支付问题，请联系管理员</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
