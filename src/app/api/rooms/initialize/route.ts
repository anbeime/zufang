import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { rooms } from '@/storage/database/shared/schema';
import { roomManager } from '@/storage/database/roomManager';

// 初始化房间数据
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // 检查是否已有房间数据
    const existingRooms = await db.select().from(rooms);

    if (existingRooms.length > 0) {
      return NextResponse.json({
        success: false,
        error: '房间数据已存在，请先清空旧数据',
        existingCount: existingRooms.length,
      });
    }

    // 调用初始化方法
    await roomManager.initializeRooms();

    // 返回初始化后的房间列表
    const roomsList = await db.select().from(rooms);

    return NextResponse.json({
      success: true,
      data: {
        message: '房间数据初始化成功',
        count: roomsList.length,
        rooms: roomsList,
      },
    });
  } catch (error: any) {
    console.error('初始化房间失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 清空并重新初始化房间数据
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();

    // 删除所有房间数据
    await db.delete(rooms);

    // 重新初始化
    await roomManager.initializeRooms();

    // 返回初始化后的房间列表
    const roomsList = await db.select().from(rooms);

    return NextResponse.json({
      success: true,
      data: {
        message: '房间数据已重置',
        count: roomsList.length,
        rooms: roomsList,
      },
    });
  } catch (error: any) {
    console.error('重置房间失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
