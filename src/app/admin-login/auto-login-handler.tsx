'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AutoLoginHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 检查URL参数，支持自动登录
    const autoPhone = searchParams.get('phone');
    const auto = searchParams.get('auto');

    if (auto === 'true' && autoPhone) {
      // 自动登录
      handleAutoLogin(autoPhone);
    }
  }, [searchParams, router]);

  const handleAutoLogin = async (phoneNumber: string) => {
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminPhone', phoneNumber);
        router.push('/admin');
      }
    } catch (error) {
      console.error('自动登录失败:', error);
    }
  };

  return null;
}
