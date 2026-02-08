import { NextRequest, NextResponse } from 'next/server';
import { roomManager } from '@/storage/database/roomManager';

// 获取房间照片列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await roomManager.getRoomById(id);

    if (!room) {
      return NextResponse.json(
        { error: '房间不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      photos: room.photos || [],
    });
  } catch (error) {
    console.error('[GetRoomPhotos] 获取失败:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}

// 添加房间照片
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { photoUrl } = body;

    if (!photoUrl) {
      return NextResponse.json(
        { error: '缺少照片URL' },
        { status: 400 }
      );
    }

    const room = await roomManager.getRoomById(id);

    if (!room) {
      return NextResponse.json(
        { error: '房间不存在' },
        { status: 404 }
      );
    }

    // 更新照片列表
    const currentPhotos = room.photos || [];
    const updatedPhotos = [...currentPhotos, photoUrl];

    const updatedRoom = await roomManager.updateRoom(id, {
      photos: updatedPhotos,
    });

    return NextResponse.json({
      success: true,
      photos: updatedRoom?.photos || [],
    });
  } catch (error) {
    console.error('[AddRoomPhoto] 添加失败:', error);
    return NextResponse.json(
      { error: '添加失败' },
      { status: 500 }
    );
  }
}

// 删除房间照片
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { photoUrl } = body;

    if (!photoUrl) {
      return NextResponse.json(
        { error: '缺少照片URL' },
        { status: 400 }
      );
    }

    const room = await roomManager.getRoomById(id);

    if (!room) {
      return NextResponse.json(
        { error: '房间不存在' },
        { status: 404 }
      );
    }

    // 删除指定照片
    const currentPhotos = room.photos || [];
    const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);

    const updatedRoom = await roomManager.updateRoom(id, {
      photos: updatedPhotos,
    });

    return NextResponse.json({
      success: true,
      photos: updatedRoom?.photos || [],
    });
  } catch (error) {
    console.error('[DeleteRoomPhoto] 删除失败:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}
