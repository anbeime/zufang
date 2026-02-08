'use client';

import { useState, useEffect } from 'react';

export default function AddToHomeScreen() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // 检查是否已经安装过
    const installed = localStorage.getItem('pwaInstalled');
    if (installed === 'true') {
      return;
    }

    // 检测设备类型
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // 监听安装提示事件（Chrome/Android）
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari 不支持 beforeinstallprompt，需要手动引导
    if (isIOSDevice) {
      // 检查是否是独立模式（已安装）
      const isStandalone = (window as any).navigator.standalone;
      if (!isStandalone) {
        // 延迟显示，避免首次打开就弹窗
        setTimeout(() => {
          const dismissed = sessionStorage.getItem('pwaDismissed');
          if (!dismissed) {
            setShow(true);
          }
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', 'true');
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwaDismissed', 'true');
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-2xl">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📱</span>
              <h3 className="font-bold text-lg">添加到主屏幕</h3>
            </div>

            {isIOS && (
              <div className="text-sm space-y-1">
                <p className="opacity-90">
                  1. 点击底部的分享按钮
                </p>
                <p className="opacity-90">
                  2. 选择"添加到主屏幕"
                </p>
                <p className="opacity-90">
                  3. 点击"添加"完成
                </p>
              </div>
            )}

            {isAndroid && deferredPrompt && (
              <div className="text-sm opacity-90">
                点击下方按钮，将商户管理后台添加到主屏幕
              </div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {isAndroid && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-4 px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            添加到主屏幕
          </button>
        )}
      </div>
    </div>
  );
}
