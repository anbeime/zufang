import { Suspense } from 'react';
import CheckoutRoomContent from './checkout-room-client';

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-gray-600">加载中...</div>
    </div>
  );
}

// 主组件 - 使用 Suspense 边界
export default function CheckoutRoomPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutRoomContent />
    </Suspense>
  );
}
