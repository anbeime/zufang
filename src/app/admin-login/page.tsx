'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import AutoLoginHandler from './auto-login-handler';
import AutoLoginLink from '@/components/auto-login-link';
import DomainConfigGuide from '@/components/domain-config-guide';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 检查是否已经登录
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 调用API验证手机号
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        // 设置登录状态
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminPhone', phone);
        router.push('/admin');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <AutoLoginHandler />
      </Suspense>

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">商户管理后台</h1>
          <p className="text-gray-600">请输入管理员手机号</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                管理员手机号
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入11位手机号"
                maxLength={11}
                autoFocus
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 11}
              className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? '验证中...' : '登录'}
            </button>
          </form>

          {/* 返回首页 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="block w-full px-4 py-3 text-center text-gray-600 hover:text-gray-900 font-medium"
            >
              ← 返回首页
            </a>
          </div>
        </div>

        {/* 自动登录链接提示（仅手机端显示） */}
        <div className="mt-6">
          <AutoLoginLink phone={phone} />
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>测试管理员手机号：<span className="font-mono bg-gray-100 px-2 py-1 rounded">13800138000</span></p>
          <p className="mt-2">实际项目中请在 .env.local 中配置</p>
        </div>

        {/* 配置说明 */}
        <DomainConfigGuide />
      </div>
    </div>
  );
}
