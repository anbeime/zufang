import { NextRequest, NextResponse } from 'next/server';
import { tenantManager, roomManager, billManager, paymentManager, couponManager } from '@/storage/database';
import type { InsertTenant } from '@/storage/database';

// GET - 获取租户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');

    const tenants = await tenantManager.getTenants({
      roomId: roomId || undefined,
      status: status || undefined,
      phone: phone || undefined,
    });

    return NextResponse.json({ success: true, data: tenants });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建租户（入住）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.phone || !body.roomId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：name, phone, roomId' },
        { status: 400 }
      );
    }

    // 检查房间是否可用
    const room = await roomManager.getRoomById(body.roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }
    if (room.status !== 'available') {
      return NextResponse.json(
        { success: false, error: '房间不可用' },
        { status: 400 }
      );
    }

    // 检查手机号是否已注册
    const existingTenant = await tenantManager.getTenantByPhone(body.phone);
    if (existingTenant) {
      return NextResponse.json(
        { success: false, error: '该手机号已注册' },
        { status: 400 }
      );
    }

    // 创建租户
    const tenantData: InsertTenant = {
      roomId: body.roomId,
      name: body.name,
      phone: body.phone,
      idCard: body.idCard,
      familyMembers: body.familyMembers || 1,
      deposit: body.deposit || '0.00',
      status: 'active',
      moveInDate: body.moveInDate ? new Date(body.moveInDate).toISOString() : new Date().toISOString(),
      remarks: body.remarks,
    };

    const tenant = await tenantManager.createTenant(tenantData);

    // 更新房间状态
    await roomManager.updateRoomStatus(body.roomId, 'occupied');

    // 创建押金支付记录
    if (body.deposit && parseFloat(body.deposit) > 0) {
      await paymentManager.createPayment({
        tenantId: tenant.id,
        amount: body.deposit,
        type: 'deposit',
        paymentMethod: body.paymentMethod || 'wechat',
        status: 'completed',
        remarks: '入住押金',
      });
    }

    // 创建首月房租账单
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await billManager.generateRentBill(
      tenant.id,
      body.roomId,
      body.monthlyRent || room.baseRent || '1500.00',
      nextMonth
    );

    return NextResponse.json({
      success: true,
      data: tenant,
      message: '入住成功',
    });
  } catch (error: any) {
    console.error('Create tenant error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
