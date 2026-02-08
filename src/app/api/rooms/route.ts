import { NextRequest, NextResponse } from 'next/server';
import { roomManager } from '@/storage/database';
import type { InsertRoom } from '@/storage/database';

// GET - 获取房间列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');
    const type = searchParams.get('type');
    const roomType = searchParams.get('roomType');
    const status = searchParams.get('status');

    const rooms = await roomManager.getRooms({
      floor: floor ? parseInt(floor) : undefined,
      type: type || undefined,
      roomType: roomType || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建房间
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.roomNumber || !body.floor || !body.type) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：roomNumber, floor, type' },
        { status: 400 }
      );
    }

    const roomData: InsertRoom = {
      roomNumber: body.roomNumber,
      floor: body.floor,
      type: body.type,
      roomType: body.roomType || 'single',
      area: body.area,
      baseRent: body.baseRent,
      price: body.price || body.baseRent || '500.00',
      status: body.status || 'available',
    };

    const room = await roomManager.createRoom(roomData);

    return NextResponse.json({
      success: true,
      data: room,
      message: '房间创建成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 初始化房间数据
export async function PUT(request: NextRequest) {
  try {
    await roomManager.initializeRooms();

    return NextResponse.json({
      success: true,
      message: '房间数据初始化成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
