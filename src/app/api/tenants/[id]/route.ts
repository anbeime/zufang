import { NextRequest, NextResponse } from 'next/server';
import { tenantManager, roomManager, billManager, paymentManager, couponManager } from '@/storage/database';
import type { UpdateTenant } from '@/storage/database';

// GET - 获取租户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenant = await tenantManager.getTenantById(id);

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: '租户不存在' },
        { status: 404 }
      );
    }

    // 获取关联的房间信息
    const room = tenant.roomId ? await roomManager.getRoomById(tenant.roomId) : null;

    // 获取未支付账单
    const unpaidBills = await billManager.getBills({
      tenantId: id,
      status: 'unpaid',
    });

    // 获取可用优惠券
    const availableCoupons = await couponManager.getCoupons({
      tenantId: id,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      data: {
        ...tenant,
        room,
        unpaidBills,
        availableCoupons,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - 更新租户信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: UpdateTenant = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.idCard !== undefined) updateData.idCard = body.idCard;
    if (body.familyMembers !== undefined) updateData.familyMembers = body.familyMembers;
    if (body.deposit !== undefined) updateData.deposit = body.deposit;
    if (body.remarks !== undefined) updateData.remarks = body.remarks;

    const tenant = await tenantManager.updateTenant(id, updateData);

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: '租户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tenant,
      message: '更新成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - 删除租户（退房）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 获取租户信息
    const tenant = await tenantManager.getTenantById(id);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: '租户不存在' },
        { status: 404 }
      );
    }

    // 检查是否有未支付账单
    const unpaidBills = await billManager.getBills({
      tenantId: id,
      status: 'unpaid',
    });

    if (unpaidBills.length > 0) {
      return NextResponse.json(
        { success: false, error: '存在未支付账单，无法退房' },
        { status: 400 }
      );
    }

    // 根据合同条款处理押金
    let refundAmount = '0.00';
    if (body.refundDeposit) {
      refundAmount = tenant.deposit || '0.00';

      // 创建退款记录
      await paymentManager.createPayment({
        tenantId: id,
        amount: refundAmount,
        type: 'refund',
        paymentMethod: 'wechat',
        status: 'completed',
        remarks: '退房押金退款',
      });
    }

    // 更新租户状态
    await tenantManager.updateTenantStatus(
      id,
      'checkout',
      body.moveOutDate ? new Date(body.moveOutDate) : new Date()
    );

    // 更新房间状态为可用
    if (tenant.roomId) {
      await roomManager.updateRoomStatus(tenant.roomId, 'available');
    }

    return NextResponse.json({
      success: true,
      data: { refundAmount },
      message: '退房成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
