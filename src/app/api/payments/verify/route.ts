import { NextRequest, NextResponse } from 'next/server';
import { paymentManager, billManager, couponManager } from '@/storage/database';

// PUT - 审核支付（商户后台）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, action, adminPhone } = body;

    // 验证管理员权限
    const adminPhones = process.env.ADMIN_PHONES?.split(',') || [];
    if (!adminPhones.includes(adminPhone)) {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    if (!paymentId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 获取支付记录
    const payments = await paymentManager.getPayments({ status: 'pending' });
    const payment = payments.find((p: any) => p.id === paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: '支付记录不存在' },
        { status: 404 }
      );
    }

    let coupon = null;

    if (action === 'approve') {
      // 批准支付
      // 更新支付状态
      // 注意：这里需要在 paymentManager 中添加 updatePaymentStatus 方法
      
      // 更新账单状态
      if (payment.billId) {
        await billManager.updateBillStatus(
          payment.billId,
          'paid',
          payment.amount,
          new Date()
        );

        // 如果是电费，生成返现券
        if (payment.type === 'electricity') {
          coupon = await couponManager.generateCouponByBill(
            payment.tenantId,
            payment.billId,
            payment.amount
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: '支付已批准',
        coupon,
      });
    } else if (action === 'reject') {
      // 拒绝支付
      // 更新支付状态为已拒绝
      // 更新账单状态为未支付
      if (payment.billId) {
        await billManager.updateBillStatus(
          payment.billId,
          'unpaid',
          '0',
          undefined
        );
      }

      return NextResponse.json({
        success: true,
        message: '支付已拒绝',
      });
    }

    return NextResponse.json(
      { success: false, error: '无效的操作' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - 获取待审核支付列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPhone = searchParams.get('adminPhone');

    // 验证管理员权限
    const adminPhones = process.env.ADMIN_PHONES?.split(',') || [];
    if (!adminPhone || !adminPhones.includes(adminPhone)) {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    // 获取待审核支付
    const payments = await paymentManager.getPayments({ status: 'pending' });

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error('Get pending payments error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
