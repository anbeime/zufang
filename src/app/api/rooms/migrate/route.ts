import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { rooms } from '@/storage/database/shared/schema';

// 房间配置映射
const ROOM_CONFIG = {
  // 二楼（4套）
  '201': { roomType: '二房', area: 50, price: '800.00' },
  '202': { roomType: '二房', area: 50, price: '800.00' },
  '203': { roomType: '二房一厅', area: 60, price: '700.00' },
  '204': { roomType: '二房一厅', area: 60, price: '700.00' },

  // 三楼（8套）
  '301': { roomType: '小单间', area: 25, price: '300.00' },
  '302': { roomType: '小单间', area: 25, price: '300.00' },
  '303': { roomType: '小单间', area: 25, price: '300.00' },
  '304': { roomType: '小单间', area: 25, price: '300.00' },
  '305': { roomType: '单间', area: 30, price: '400.00' },
  '306': { roomType: '单间', area: 30, price: '400.00' },
  '307': { roomType: '大单间', area: 35, price: '500.00' },
  '308': { roomType: '大单间', area: 35, price: '500.00' },

  // 四楼（8套复式）
  '401': { roomType: '小复式', area: 45, price: '400.00' },
  '402': { roomType: '复式', area: 55, price: '500.00' },
  '403': { roomType: '复式', area: 55, price: '500.00' },
  '404': { roomType: '复式', area: 55, price: '500.00' },
  '405': { roomType: '复式', area: 55, price: '500.00' },
  '406': { roomType: '复式', area: 55, price: '500.00' },
  '407': { roomType: '大复式', area: 70, price: '700.00' },
  '408': { roomType: '大复式', area: 70, price: '700.00' },
};

// 迁移房间数据
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    const updatedRooms = [];
    const skippedRooms = [];

    // 更新所有配置中的房间
    for (const [roomNumber, config] of Object.entries(ROOM_CONFIG)) {
      const [existingRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomNumber, roomNumber));

      if (existingRoom) {
        // 更新现有房间
        const [updatedRoom] = await db
          .update(rooms)
          .set({
            roomType: config.roomType,
            area: config.area,
            baseRent: config.price,
            price: config.price,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(rooms.roomNumber, roomNumber))
          .returning();

        updatedRooms.push({
          roomNumber,
          oldConfig: {
            roomType: existingRoom.roomType,
            area: existingRoom.area,
            price: existingRoom.price,
          },
          newConfig: config,
        });
      } else {
        skippedRooms.push({
          roomNumber,
          reason: '房间不存在',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '房间数据迁移完成',
        updatedCount: updatedRooms.length,
        skippedCount: skippedRooms.length,
        updatedRooms,
        skippedRooms,
      },
    });
  } catch (error: any) {
    console.error('迁移房间失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
