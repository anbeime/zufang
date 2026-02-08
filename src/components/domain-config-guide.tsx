'use client';

export default function DomainConfigGuide() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-6">
      <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
        <span>⚙️</span>
        <span>手机访问配置说明</span>
      </h4>

      <div className="space-y-3 text-sm text-amber-800">
        <div>
          <p className="font-semibold mb-1">为什么需要配置？</p>
          <p>当前自动登录链接使用 <code className="bg-white px-1 py-0.5 rounded">localhost:5000</code>，手机无法访问此地址。</p>
        </div>

        <div>
          <p className="font-semibold mb-1">如何配置？</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              找到项目根目录的 <code className="bg-white px-1 py-0.5 rounded">.env.local</code> 文件
            </li>
            <li>
              修改 <code className="bg-white px-1 py-0.5 rounded">NEXT_PUBLIC_SITE_URL</code> 的值
            </li>
            <li>
              开发环境使用电脑的局域网IP地址（如 <code className="bg-white px-1 py-0.5 rounded">http://192.168.1.100:5000</code>）
            </li>
            <li>
              生产环境使用真实域名（如 <code className="bg-white px-1 py-0.5 rounded">https://your-domain.com</code>）
            </li>
            <li>
              重启服务使配置生效
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-lg p-3 mt-3">
          <p className="font-semibold mb-2">示例配置：</p>
          <code className="block bg-gray-50 px-3 py-2 rounded text-xs">
            NEXT_PUBLIC_SITE_URL=http://192.168.1.100:5000
          </code>
        </div>

        <div className="bg-white rounded-lg p-3">
          <p className="font-semibold mb-1">如何查看电脑的局域网IP？</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
            <li>Windows：打开命令提示符，输入 <code className="bg-gray-50 px-1 py-0.5 rounded">ipconfig</code> 查看 IPv4 地址</li>
            <li>Mac/Linux：打开终端，输入 <code className="bg-gray-50 px-1 py-0.5 rounded">ifconfig</code> 或 <code className="bg-gray-50 px-1 py-0.5 rounded">ip addr</code></li>
          </ul>
        </div>

        <div className="pt-2 border-t border-amber-200">
          <p className="text-xs text-amber-700">
            💡 提示：确保手机和电脑连接到同一个 Wi-Fi 网络
          </p>
        </div>
      </div>
    </div>
  );
}
