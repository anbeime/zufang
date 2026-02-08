'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ElectricityRule {
  minAmount: number;
  returnAmount: number;
}

export default function ElectricityRules() {
  const [rules, setRules] = useState<ElectricityRule[]>([
    { minAmount: 200, returnAmount: 20 },
    { minAmount: 300, returnAmount: 30 },
    { minAmount: 500, returnAmount: 50 },
  ]);
  const [loading, setLoading] = useState(false);
  const [currentRule, setCurrentRule] = useState<ElectricityRule>({ minAmount: 0, returnAmount: 0 });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const res = await fetch('/api/system-config?key=electricity_return_rule');
      const data = await res.json();
      if (data.success && data.data) {
        const parsedRules = JSON.parse(data.data.value);
        setRules(parsedRules);
      }
    } catch (error) {
      console.error('加载规则失败:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'electricity_return_rule',
          value: JSON.stringify(rules),
          description: '电费满返规则（单次支付）',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('规则保存成功');
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    if (currentRule.minAmount > 0 && currentRule.returnAmount > 0) {
      // 检查是否重复
      const exists = rules.some(r => r.minAmount === currentRule.minAmount);
      if (exists) {
        alert('该消费金额的规则已存在');
        return;
      }
      setRules([...rules, { ...currentRule }]);
      setCurrentRule({ minAmount: 0, returnAmount: 0 });
    }
  };

  const handleEditRule = (index: number) => {
    setEditIndex(index);
    setCurrentRule({ ...rules[index] });
  };

  const handleUpdateRule = () => {
    if (editIndex !== null) {
      const newRules = [...rules];
      newRules[editIndex] = { ...currentRule };
      setRules(newRules);
      setEditIndex(null);
      setCurrentRule({ minAmount: 0, returnAmount: 0 });
    }
  };

  const handleDeleteRule = (index: number) => {
    if (confirm('确定删除该规则吗？')) {
      const newRules = rules.filter((_, i) => i !== index);
      setRules(newRules);
    }
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setCurrentRule({ minAmount: 0, returnAmount: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">← 返回管理后台</Link>
            <h1 className="text-lg font-bold text-gray-900">🎁 电费满返规则</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 说明 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-700 mb-2">💡 满返规则说明</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• 租户单次支付电费达到消费金额后，自动发放返现券</li>
            <li>• 返现券可在商超购物时使用，有最低消费门槛</li>
            <li>• 规则按消费金额从高到低匹配，优先满足高金额规则</li>
          </ul>
        </div>

        {/* 添加/编辑规则 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editIndex !== null ? '编辑规则' : '添加新规则'}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                消费金额（元）
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentRule.minAmount}
                onChange={(e) =>
                  setCurrentRule({
                    ...currentRule,
                    minAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="如：200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                返现金额（元）
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentRule.returnAmount}
                onChange={(e) =>
                  setCurrentRule({
                    ...currentRule,
                    returnAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="如：20"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {editIndex !== null ? (
              <>
                <button
                  onClick={handleUpdateRule}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-300 font-semibold"
                >
                  更新规则
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  取消编辑
                </button>
              </>
            ) : (
              <button
                onClick={handleAddRule}
                disabled={loading}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-300 font-semibold"
              >
                添加规则
              </button>
            )}
          </div>
        </div>

        {/* 规则列表 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">当前规则</h2>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无规则</div>
          ) : (
            <div className="space-y-3">
              {rules
                .sort((a, b) => b.minAmount - a.minAmount)
                .map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200"
                  >
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">
                        单次支付满 ¥{rule.minAmount}
                      </div>
                      <div className="text-sm text-gray-600">
                        返现 ¥{rule.returnAmount} 优惠券（最低消费 ¥
                        {Math.ceil(rule.returnAmount * 3)}）
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRule(index)}
                        className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteRule(index)}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 保存按钮 */}
          {rules.length > 0 && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-semibold text-lg"
            >
              {loading ? '保存中...' : '保存所有规则'}
            </button>
          )}
        </div>

        {/* 返回链接 */}
        <div className="mt-6 text-center">
          <Link
            href="/admin"
            className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
          >
            返回管理后台
          </Link>
        </div>
      </div>
    </div>
  );
}
