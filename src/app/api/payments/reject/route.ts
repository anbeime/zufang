import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { payments, bills } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, adminPhone, reason } = await request.json();

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

    // 更新支付状态为已拒绝
    const rejectReason = reason ? `拒绝原因：${reason}` : '商户拒绝';
    await db
      .update(payments)
      .set({ 
        status: 'rejected',
        remarks: (payment.remarks || '') + `\n[${new Date().toLocaleString()}] ${rejectReason}`
      })
      .where(eq(payments.id, paymentId));

    // 更新账单状态为未支付
    if (payment.billId) {
      await db
        .update(bills)
        .set({
          status: 'unpaid',
          paidAmount: '0',
          paidDate: null,
        })
        .where(eq(bills.id, payment.billId));
    }

    return NextResponse.json({
      success: true,
      message: '已拒绝该支付',
    });
  } catch (error: any) {
    console.error('Reject payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
