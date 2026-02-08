'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyCouponsPage() {
  const [phone, setPhone] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFindCoupons = async () => {
    if (!phone) {
      alert('请输入手机号');
      return;
    }

    setLoading(true);

    try {
      const tenantsRes = await fetch(`/api/tenants?phone=${phone}`);
      const tenantsData = await tenantsRes.json();

      if (!tenantsData.success || tenantsData.data.length === 0) {
        alert('未找到该租户');
        setLoading(false);
        return;
      }

      const tenantId = tenantsData.data[0].id;

      const couponsRes = await fetch(`/api/coupons?tenantId=${tenantId}`);
      const couponsData = await couponsRes.json();

      if (couponsData.success) {
        setCoupons(couponsData.data);
      }
    } catch (error) {
      alert('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 查询区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎫</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">我的优惠券</h1>
            <p className="text-gray-600">输入手机号查看可用的返现券</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFindCoupons()}
                className="w-full px-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="请输入手机号"
              />
            </div>

            <button
              onClick={handleFindCoupons}
              disabled={loading || phone.length < 11}
              className="w-full px-4 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? '查询中...' : '查看我的券'}
            </button>
          </div>
        </div>

        {/* 券列表 */}
        {coupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              可用优惠券 ({coupons.length}张)
            </h2>

            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="flex">
                  {/* 左侧金额 */}
                  <div className="w-1/3 bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold">￥{parseFloat(coupon.amount).toFixed(0)}</div>
                    <div className="text-sm mt-1">优惠券</div>
                  </div>

                  {/* 右侧信息 */}
                  <div className="flex-1 p-6">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      {coupon.description}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      满{parseFloat(coupon.minSpend).toFixed(0)}元可用
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        有效期至 {formatDate(coupon.validUntil)}
                      </div>
                      <Link
                        href="/checkout"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
                      >
                        去使用
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {phone && coupons.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无优惠券</h3>
            <p className="text-gray-600 mb-6">
              交满100元电费自动发5元券，满300发30元券
            </p>
            <Link
              href="/pay"
              className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium"
            >
              去交费领券
            </Link>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📖 如何获得优惠券</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">🎁</span>
              <span>一次性交满100元电费 → 自动发放5元券（满10用）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">🎁</span>
              <span>一次性交满300元电费 → 自动发放30元券（满60用）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">🎁</span>
              <span>一次性交满500元电费 → 自动发放70元券（满140用）</span>
            </li>
          </ul>

          <h3 className="font-semibold text-gray-900 mb-3 mt-6">💡 使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>在商超购物时，系统会自动匹配最优优惠券</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>优惠券有效期30天，过期自动失效</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>每张券只能使用一次，使用后自动核销</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
