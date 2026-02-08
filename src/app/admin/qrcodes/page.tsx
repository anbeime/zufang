'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrCodesPage() {
  const [selectedType, setSelectedType] = useState<'common'>('common');

  // 获取基础URL（用于生成二维码）
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  // 二维码配置
  const qrConfig = {
    title: '通用二维码',
    description: '租户扫码后进入首页，选择入住/支付/购物/退房等功能',
    icon: '🏢',
    url: `${getBaseUrl()}/`,
    color: '#0f172a',
    instructions: `使用流程：

1. 打印后张贴位置：
   - 商超收银台
   - 1楼大厅
   - 电梯口
   - 入口显眼处

2. 租户使用方式：
   - 扫此二维码进入首页
   - 选择需要的功能（入住/支付/购物/退房）
   - 输入手机号登录并操作

3. 首次入住：
   - 选择"租户入住"
   - 查看所有可用房间（像选座位一样）
   - 选择房间后填写姓名、手机号
   - 完成（手机号与房间自动绑定）

4. 后续操作：
   - 扫码选择功能 → 输入手机号 → 自动识别身份
   - 或在"我的"页面获取个人二维码，扫码自动识别

5. 数据管理：
   - 手机号是唯一标识
   - 通过手机号关联租户信息和房间
   - 所有操作记录自动绑定到对应租户`,
  };

  // 打印二维码
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                ← 返回
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">通用二维码</h1>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              🖨️ 打印
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧：二维码展示 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{qrConfig.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {qrConfig.title}
              </h2>
              <p className="text-gray-600">{qrConfig.description}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <QRCodeCanvas
                value={qrConfig.url}
                size={280}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                租户扫描此二维码进入首页
              </p>
              <p className="text-xs text-gray-500 mt-1">
                URL: {qrConfig.url}
              </p>
            </div>
          </div>

          {/* 右侧：使用说明 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 h-full">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <span className="text-2xl">💡</span>
                使用说明
              </h3>
              <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans leading-relaxed">
                {qrConfig.instructions}
              </pre>
            </div>
          </div>
        </div>

        {/* 重要提示 */}
        <div className="mt-8 bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-6">
          <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            重要提示
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>只需这一个通用二维码，张贴在收银台、大厅、电梯口等显眼位置即可</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>租户首次入住时会选择房间并填写手机号，系统自动建立手机号与房间的绑定关系</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>后续所有操作通过手机号识别身份，建议租户在"我的"页面生成个人二维码方便扫码</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>所有数据自动关联到对应租户，无需人工管理</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
