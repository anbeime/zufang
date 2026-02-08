import { Suspense } from 'react';
import CheckoutContent from './checkout-client';

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-gray-600">加载中...</div>
    </div>
  );
}

// 主组件 - 使用 Suspense 边界
export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
