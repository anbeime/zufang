'use client';

import { useState, useEffect } from 'react';

interface AutoLoginLinkProps {
  phone: string;
}

export default function AutoLoginLink({ phone }: AutoLoginLinkProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/iphone|ipad|ipod|android/.test(userAgent));
  }, []);

  const autoLoginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/admin-login?phone=${phone}&auto=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(autoLoginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestAutoLogin = () => {
    window.location.href = autoLoginUrl;
  };

  if (!isMobile) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-xl">🔗</span>
        <span>自动登录链接</span>
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        将链接保存为书签或添加到主屏幕，下次直接点击即可自动登录
      </p>

      <div className="space-y-3">
        <button
          onClick={handleTestAutoLogin}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-all"
        >
          点击测试自动登录
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium border border-gray-200 transition-all"
        >
          {copied ? '✓ 已复制链接' : '📋 复制自动登录链接'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>链接内容：</p>
        <code className="bg-white px-2 py-1 rounded block mt-1 break-all">
          {autoLoginUrl}
        </code>
      </div>
    </div>
  );
}
