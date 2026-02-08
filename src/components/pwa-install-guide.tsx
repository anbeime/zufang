'use client';

import { useState, useEffect } from 'react';

interface PWAInstallGuideProps {
  phone: string;
}

export default function PWAInstallGuide({ phone }: PWAInstallGuideProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        alert('添加成功！现在可以在主屏幕找到"商户后台"图标了');
      }
      setDeferredPrompt(null);
    }
  };

  if (!isIOS && !isAndroid) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📱</span>
          <span>添加到手机主屏幕</span>
        </h3>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showGuide ? '收起' : '查看教程'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        添加后可以像APP一样使用，双击图标直接打开，无需浏览器
      </p>

      {showGuide && (
        <div className="space-y-4">
          {/* iOS 引导 */}
          {isIOS && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>🍎</span>
                <span>iPhone / iPad 操作步骤</span>
              </h4>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <div>
                    <p>点击底部的<span className="font-semibold">分享按钮</span>（向上箭头图标）</p>
                    <p className="text-xs text-blue-600 mt-1">在 Safari 浏览器底部</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <div>
                    <p>在弹出的菜单中选择<span className="font-semibold">"添加到主屏幕"</span></p>
                    <p className="text-xs text-blue-600 mt-1">向下滑动找到该选项</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <div>
                    <p>点击右上角的<span className="font-semibold">"添加"</span>按钮</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <div>
                    <p>在主屏幕找到<span className="font-semibold">"商户后台"</span>图标</p>
                  </div>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>提示：</strong>添加后首次打开时，可能需要再次输入手机号登录一次
                </p>
              </div>
            </div>
          )}

          {/* Android 引导 */}
          {isAndroid && (
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span>🤖</span>
                <span>Android 手机操作步骤</span>
              </h4>

              {deferredPrompt ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-800">
                    点击下方按钮，即可将商户管理后台添加到主屏幕
                  </p>
                  <button
                    onClick={handleInstall}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span>📱</span>
                    <span>添加到主屏幕</span>
                  </button>
                </div>
              ) : (
                <ol className="space-y-3 text-sm text-green-800">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                    <div>
                      <p>点击浏览器右上角的<span className="font-semibold">菜单按钮</span>（三个点）</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                    <div>
                      <p>选择<span className="font-semibold">"添加到主屏幕"</span>或<span className="font-semibold">"安装应用"</span></p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                    <div>
                      <p>点击<span className="font-semibold">"添加"</span>或<span className="font-semibold">"安装"</span></p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                    <div>
                      <p>在主屏幕找到<span className="font-semibold">"商户后台"</span>图标</p>
                    </div>
                  </li>
                </ol>
              )}

              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-green-700">
                  <strong>提示：</strong>使用 Chrome 浏览器效果最佳
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 快速说明 */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">添加后的好处</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 像APP一样独立运行，不占用浏览器</li>
              <li>• 双击图标直接打开，无需输入网址</li>
              <li>• 保持登录状态，下次自动登录</li>
              <li>• 支持自动登录参数，输入手机号更方便</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
