import { NextRequest, NextResponse } from 'next/server';
import { roomManager } from '@/storage/database';

// GET - 获取单个房间信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await roomManager.getRoomById(id);

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - 更新房间信息（包括价格）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 允许更新的字段
    const allowedFields = [
      'roomType',
      'price',
      'area',
      'baseRent',
      'status',
      'photos',
    ];

    // 过滤只允许更新的字段
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 验证至少有一个字段需要更新
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可更新的字段' },
        { status: 400 }
      );
    }

    // 验证价格格式
    if (updateData.price !== undefined) {
      const priceNum = parseFloat(updateData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { success: false, error: '价格必须是有效的正数' },
          { status: 400 }
        );
      }
      updateData.price = priceNum.toFixed(2);
    }

    const room = await roomManager.updateRoom(id, updateData);

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
      message: '房间信息更新成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - 删除房间
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const success = await roomManager.deleteRoom(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '房间不存在或删除失败' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '房间删除成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
