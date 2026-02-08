'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DesktopShortcutDownloader from '@/components/desktop-shortcut-downloader';
import PWAInstallGuide from '@/components/pwa-install-guide';

interface Stats {
  totalTenants: number;
  activeTenants: number;
  totalRooms: number;
  availableRooms: number;
  totalCoupons: number;
  usedCoupons: number;
  supermarketOrders: number;
  supermarketRevenue: number;
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  roomType: string;
  price: string;
  area?: number;
}

const ROOM_TYPE_NAMES: { [key: string]: string } = {
  single: '单房',
  family: '家庭房',
  deluxe: '豪华房',
  suite: '套房',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalTenants: 0,
    activeTenants: 0,
    totalRooms: 0,
    availableRooms: 0,
    totalCoupons: 0,
    usedCoupons: 0,
    supermarketOrders: 0,
    supermarketRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  // 检查管理员登录状态
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const phone = sessionStorage.getItem('adminPhone');

    if (isLoggedIn !== 'true') {
      router.replace('/admin-login');
    } else {
      setIsAuthenticated(true);
      setAdminPhone(phone || '');
    }
  }, [router]);

  // 登出功能
  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    router.push('/');
  };

  const loadStats = async () => {
    try {
      const [tenantsRes, roomsRes, ordersRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/rooms'),
        fetch('/api/supermarket-orders'),
      ]);

      const tenantsData = await tenantsRes.json();
      const roomsData = await roomsRes.json();
      const ordersData = await ordersRes.json();

      if (tenantsData.success && roomsData.success && ordersData.success) {
        const tenants = tenantsData.data;
        const rooms = roomsData.data;
        const orders = ordersData.data;

        const activeTenants = tenants.filter((t: any) => t.status === 'active').length;
        const availableRooms = rooms.filter((r: any) => r.status === 'available').length;
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.paidAmount), 0);

        setStats({
          totalTenants: tenants.length,
          activeTenants,
          totalRooms: rooms.length,
          availableRooms,
          totalCoupons: 0, // TODO: 从优惠券表统计
          usedCoupons: 0,
          supermarketOrders: orders.length,
          supermarketRevenue: totalRevenue,
        });

        setRecentOrders(orders.slice(0, 10));
        setRooms(rooms);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (room: Room) => {
    setEditRoom(room);
    setNewPrice(room.price);
  };

  const handleSavePrice = async () => {
    if (!editRoom || !newPrice) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${editRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });

      const data = await res.json();
      if (data.success) {
        // 更新本地房间数据
        setRooms(rooms.map(r => r.id === editRoom.id ? { ...r, price: newPrice } : r));
        setEditRoom(null);
        setNewPrice('');
        alert('价格更新成功');
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      alert('更新失败');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 未认证时不显示内容
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600">验证中...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">商户管理后台</h1>
                <p className="text-xs text-gray-500">电费管理 · 二维码打印 · 数据监控</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {adminPhone && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                  <span className="text-sm text-green-700">👤 {adminPhone}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 font-medium"
              >
                退出登录
              </button>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                返回首页 →
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 提示信息 */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✓</span>
            <div>
              <p className="font-semibold text-green-700">系统全自动运行中</p>
              <p className="text-sm text-green-600">租户自助办理所有业务，无需人工干预</p>
            </div>
          </div>
        </div>

        {/* PWA 添加到主屏幕引导 */}
        <div className="mb-8">
          <PWAInstallGuide phone={adminPhone} />
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">在住租户</span>
              <span className="text-2xl">🏠</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.activeTenants}</div>
            <div className="text-xs text-gray-400 mt-1">总租户: {stats.totalTenants}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">空房数量</span>
              <span className="text-2xl">🔑</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.availableRooms}</div>
            <div className="text-xs text-gray-400 mt-1">总房间: {stats.totalRooms}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">商超订单</span>
              <span className="text-2xl">🛒</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.supermarketOrders}</div>
            <div className="text-xs text-gray-400 mt-1">总订单数</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">商超营收</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              ￥{stats.supermarketRevenue.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400 mt-1">累计收入</div>
          </div>
        </div>

        {/* 管理操作 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Link href="/electricity" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-yellow-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">电费管理</h3>
                  <p className="text-sm text-gray-500">为租户创建电费账单</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/water" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💧</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">水费管理</h3>
                  <p className="text-sm text-gray-500">为租户创建水费账单</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/room-photos" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📷</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">房间照片</h3>
                  <p className="text-sm text-gray-500">上传和管理房间照片</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/electricity-rules" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-orange-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎁</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">满返规则</h3>
                  <p className="text-sm text-gray-500">设置电费满返优惠</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/qrcodes" className="group">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-green-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🖨️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">二维码管理</h3>
                  <p className="text-sm text-gray-500">打印通用和专用二维码</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 房间价格设置 */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">房间价格设置</h2>
              <span className="text-sm text-gray-500">可调整各类房型的价格</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房间号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">面积</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前价格</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rooms
                  .filter(r => r.type === 'room')
                  .map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ROOM_TYPE_NAMES[room.roomType] || room.roomType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {room.area ? `${room.area}㎡` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      ￥{parseFloat(room.price).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEditPrice(room)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                      >
                        修改价格
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rooms.filter(r => r.type === 'room').length === 0 && (
              <div className="text-center py-8 text-gray-500">暂无房间</div>
            )}
          </div>
        </div>

        {/* 最近订单 */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">租户ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">总金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">优惠</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">实付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.tenantId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ￥{parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      -￥{parseFloat(order.couponAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ￥{parseFloat(order.paidAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">暂无订单</div>
            )}
          </div>
        </div>

        {/* 运行状态 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">自动运行状态</h3>
                <p className="text-sm text-gray-500">所有自动化模块正常运行</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">自助入住系统</span>
                <span className="ml-auto text-xs text-green-600 font-medium">正常</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">自助支付系统</span>
                <span className="ml-auto text-xs text-green-600 font-medium">正常</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">自助退房系统</span>
                <span className="ml-auto text-xs text-green-600 font-medium">正常</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">返现券自动发放</span>
                <span className="ml-auto text-xs text-green-600 font-medium">正常</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">商超自动收银</span>
                <span className="ml-auto text-xs text-green-600 font-medium">正常</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">运营数据</h3>
                <p className="text-sm text-gray-500">实时统计</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">入住率</span>
                  <span className="font-medium">
                    {stats.totalRooms > 0
                      ? ((stats.totalRooms - stats.availableRooms) / stats.totalRooms * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: stats.totalRooms > 0
                        ? ((stats.totalRooms - stats.availableRooms) / stats.totalRooms * 100)
                        : 0
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">商超营收</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ￥{stats.supermarketRevenue.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">累计总收入</p>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">订单总数</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats.supermarketOrders}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">商超订单</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>系统全自动运行，租户扫码即可完成所有操作</p>
          <p className="mt-1">如遇异常情况，请检查系统日志或联系技术支持</p>
        </div>
      </div>

      {/* 修改价格弹窗 */}
      {editRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">修改房间价格</h3>
              <p className="text-gray-600">
                {ROOM_TYPE_NAMES[editRoom.roomType]} · {editRoom.roomNumber}号房
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">当前价格</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-xl font-bold text-gray-900">
                  ￥{parseFloat(editRoom.price).toFixed(0)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新价格（元/月）</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
                  placeholder="请输入新价格"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditRoom(null);
                    setNewPrice('');
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSavePrice}
                  disabled={saving || !newPrice}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 font-semibold disabled:opacity-50"
                >
                  {saving ? '保存中...' : '确认修改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
