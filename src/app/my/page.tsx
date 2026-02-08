'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';

interface Coupon {
  id: string;
  type: string;
  amount: string;
  minSpend: string;
  description: string;
  status: string;
  expiresAt: string;
}

interface Bill {
  id: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  roomNumber: string;
}

export default function MyPage() {
  const [step, setStep] = useState<'phone' | 'home' >('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // 从本地存储获取上次登录的手机号
  useEffect(() => {
    const savedPhone = localStorage.getItem('lastLoginPhone');
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  const handleLogin = async () => {
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
        // 获取完整的租户详情
        const detailRes = await fetch(`/api/tenants/${tenantData.id}`);
        const detailData = await detailRes.json();

        if (detailData.success) {
          setTenant({
            id: detailData.data.id,
            name: detailData.data.name,
            phone: detailData.data.phone,
            roomNumber: detailData.data.room?.roomNumber || '',
          });
          setCoupons(detailData.data.availableCoupons || []);
          setBills(detailData.data.unpaidBills || []);

          // 保存手机号到本地存储
          localStorage.setItem('lastLoginPhone', phone);

          setStep('home');
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

  const getPersonalQrCodeUrl = () => {
    if (!tenant) return '';
    // 个人二维码URL：包含手机号，扫码后自动识别身份
    return `${window.location.origin}?phone=${tenant.phone}`;
  };

  // 手机号登录
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* 顶部 */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">我的</h1>
              <p className="text-gray-600">输入手机号查看个人信息</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入手机号"
                  autoFocus
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || phone.length < 11}
                className="w-full px-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? '查询中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主页面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 租户信息 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {tenant?.name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tenant?.name}</h2>
              <p className="text-gray-600">{tenant?.phone}</p>
            </div>
          </div>
          {tenant?.roomNumber && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-blue-600">🏠</span>
              <span className="text-blue-700 font-medium">{tenant.roomNumber}号房</span>
            </div>
          )}
        </div>

        {/* 个人二维码 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">我的二维码</h3>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              {tenant && (
                <QRCodeCanvas
                  value={getPersonalQrCodeUrl()}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              )}
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              扫此二维码可自动识别您的身份<br />
              用于支付、退房、购物等操作
            </p>
          </div>
        </div>

        {/* 优惠券 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🎫 我的优惠券</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {coupons.length}张可用
            </span>
          </div>

          {coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>暂无可用优惠券</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        ￥{parseFloat(coupon.amount).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        满￥{parseFloat(coupon.minSpend).toFixed(0)}可用
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        有效期至：{new Date(coupon.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 未付账单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">📋 未付账单</h3>
            <Link href="/pay" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              去支付 →
            </Link>
          </div>

          {bills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✓</div>
              <p>没有未付账单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => (
                <div key={bill.id} className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {bill.type === 'rent' ? '🏠 房租' : '⚡ 电费'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-red-600">
                      ￥{parseFloat(bill.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href="/pay" className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">💳</div>
            <div className="text-sm text-gray-700">支付</div>
          </Link>
          <Link href="/checkout" className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-sm text-gray-700">购物</div>
          </Link>
          <Link href="/checkout-room" className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🚪</div>
            <div className="text-sm text-gray-700">退房</div>
          </Link>
        </div>

        {/* 退出登录 */}
        <button
          onClick={() => {
            setStep('phone');
            setTenant(null);
            setCoupons([]);
            setBills([]);
          }}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
