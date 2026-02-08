'use client';

import { useState } from 'react';

interface DesktopShortcutDownloaderProps {
  phone: string;
  baseUrl: string;
}

export default function DesktopShortcutDownloader({ phone, baseUrl }: DesktopShortcutDownloaderProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadWindows = () => {
    const url = `${baseUrl}/admin-login?phone=${phone}&auto=true`;
    const content = `[InternetShortcut]\nURL=${url}\nIconFile=ieframe.dll,-176\n`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `商户管理后台-${phone}.url`;
    link.click();
    URL.revokeObjectURL(link.href);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleDownloadMac = () => {
    const url = `${baseUrl}/admin-login?phone=${phone}&auto=true`;
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>URL</key>
    <string>${url}</string>
</dict>
</plist>`;
    const blob = new Blob([content], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `商户管理后台-${phone}.webloc`;
    link.click();
    URL.revokeObjectURL(link.href);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>🖥️</span>
        <span>桌面快捷方式</span>
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        下载快捷方式到桌面，双击即可直接进入管理后台
      </p>

      <div className="space-y-3">
        <button
          onClick={handleDownloadWindows}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-all"
        >
          <span className="text-xl">🪟</span>
          <span>下载 Windows 快捷方式</span>
        </button>

        <button
          onClick={handleDownloadMac}
          className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 font-medium flex items-center justify-center gap-2 transition-all"
        >
          <span className="text-xl">🍎</span>
          <span>下载 Mac 快捷方式</span>
        </button>
      </div>

      {downloaded && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 text-center">
            ✓ 快捷方式已下载，请保存到桌面
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>使用说明：</strong><br/>
          1. 下载对应的快捷方式文件<br/>
          2. 将文件保存到桌面<br/>
          3. 以后双击图标即可直接进入后台<br/>
          4. 快捷方式包含您的手机号，请勿分享给他人
        </p>
      </div>
    </div>
  );
}
