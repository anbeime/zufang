'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏠</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">智能租户服务</h1>
                <p className="text-xs text-gray-500">扫码自助 · 全自动</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            扫一个二维码，<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">全部都能办</span>
          </h2>
          <p className="text-lg text-gray-600">
            入住、交费、购物、退房，一个通用二维码全部搞定
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 入住 */}
          <Link href="/checkin" className="group">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">租户入住</h3>
              <p className="text-sm text-gray-500">
                选择房间，填写信息完成入住
              </p>
            </div>
          </Link>

          {/* 支付 */}
          <Link href="/pay" className="group">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-green-500">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">账单支付</h3>
              <p className="text-sm text-gray-500">
                查看账单，支持房租电费支付
              </p>
            </div>
          </Link>

          {/* 退房 */}
          <Link href="/checkout-room" className="group">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🚪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">退房办理</h3>
              <p className="text-sm text-gray-500">
                自动结算押金，秒到账
              </p>
            </div>
          </Link>

          {/* 购物 */}
          <Link href="/checkout" className="group">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-orange-500">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">商超购物</h3>
              <p className="text-sm text-gray-500">
                输入金额，优惠券自动抵扣
              </p>
            </div>
          </Link>
        </div>

        {/* 我的 */}
        <Link href="/my" className="block mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">👤 我的</h3>
                <p className="text-blue-100">查看优惠券、账单，获取个人二维码</p>
              </div>
              <div className="text-5xl">→</div>
            </div>
          </div>
        </Link>

        {/* 提示信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">💡 使用流程</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>首次入住：</strong>选择房间，填写姓名和手机号，系统自动绑定</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>后续操作：</strong>扫描通用二维码，选择功能，输入手机号即可</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>更便捷：</strong>在"我的"页面获取个人二维码，扫码自动识别，无需输入手机号</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>优惠券：</strong>月度电费满100元发5元券，满300元发30元券，购物自动抵扣</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
