import { NextRequest, NextResponse } from 'next/server';
import { supermarketOrderManager, tenantManager } from '@/storage/database';

// GET - 获取商超订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const orders = await supermarketOrderManager.getOrders({
      tenantId: tenantId || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建商超订单（一招过扫码支付）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.tenantId || !body.totalAmount || !body.items) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：tenantId, totalAmount, items' },
        { status: 400 }
      );
    }

    // 验证租户存在
    const tenant = await tenantManager.getTenantById(body.tenantId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: '租户不存在' },
        { status: 404 }
      );
    }

    // 创建订单并自动使用优惠券
    const result = await supermarketOrderManager.createOrderWithCoupon(
      body.tenantId,
      body.totalAmount,
      body.items,
      body.couponCode
    );

    return NextResponse.json({
      success: true,
      data: {
        order: result.order,
        couponUsed: result.couponUsed,
        discountAmount: result.discountAmount,
        message: result.couponUsed ? '支付成功，已使用优惠券' : '支付成功',
      },
    });
  } catch (error: any) {
    console.error('Create supermarket order error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
