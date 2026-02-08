import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { payments, bills } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { couponManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, adminPhone } = await request.json();

    // 验证管理员权限
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',');
    if (!adminPhones.includes(adminPhone)) {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: '缺少支付ID' },
        { status: 400 }
      );
    }

    // 获取支付记录
    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    const payment = paymentRecords[0];
    if (!payment) {
      return NextResponse.json(
        { success: false, error: '支付记录不存在' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '该支付已处理' },
        { status: 400 }
      );
    }

    // 更新支付状态为已完成
    await db
      .update(payments)
      .set({ 
        status: 'completed',
        remarks: (payment.remarks || '') + `\n[${new Date().toLocaleString()}] 商户确认收款`
      })
      .where(eq(payments.id, paymentId));

    // 更新账单状态
    let coupon = null;
    if (payment.billId) {
      await db
        .update(bills)
        .set({
          status: 'paid',
          paidAmount: payment.amount,
          paidDate: new Date().toISOString(),
        })
        .where(eq(bills.id, payment.billId));

      // 如果是电费，自动发放优惠券
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
      message: '确认成功',
      coupon,
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
