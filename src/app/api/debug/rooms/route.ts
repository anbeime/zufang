import { NextResponse } from 'next/server';
import { roomManager } from '@/storage/database';

export async function GET() {
  try {
    console.log('[Debug] 开始获取可用房间...');

    const rooms = await roomManager.getRooms({
      status: 'available',
      type: 'room',
    });

    console.log('[Debug] 获取到房间数量:', rooms.length);

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

    console.log('[Debug] 分组后的房间组数量:', roomGroups.length);

    return NextResponse.json({
      success: true,
      debug: {
        totalRooms: rooms.length,
        groupedRooms: roomGroups.length,
        groups: roomGroups,
      },
    });
  } catch (error: any) {
    console.error('[Debug] 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
