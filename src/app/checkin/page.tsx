import { Suspense } from 'react';
import { roomManager } from '@/storage/database';
import CheckInClientContent from './checkin-client';

// 服务器端获取房间数据
async function getAvailableRooms() {
  try {
    const rooms = await roomManager.getRooms({
      status: 'available',
      type: 'room',
    });
    return rooms;
  } catch (error) {
    console.error('[CheckIn] 获取房间列表失败:', error);
    return [];
  }
}

export default async function CheckInPage() {
  const rooms = await getAvailableRooms();

  // 按房间类型分组
  const grouped: { [key: string]: any[] } = {};
  rooms.forEach((room: any) => {
    const type = room.roomType || 'single';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(room);
  });

  const roomGroups = Object.entries(grouped).map(([roomType, rooms]) => ({
    roomType,
    rooms,
  }));

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <CheckInClientContent initialRoomGroups={roomGroups} />
    </Suspense>
  );
}
