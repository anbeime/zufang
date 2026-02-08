import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { payments, bills, tenants } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 查询待确认的支付记录（状态为 pending）
    const pendingPayments = await db
      .select({
        id: payments.id,
        tenantId: payments.tenantId,
        billId: payments.billId,
        amount: payments.amount,
        type: payments.type,
        createdAt: payments.createdAt,
        tenantName: tenants.name,
        tenantPhone: tenants.phone,
        billType: bills.type,
      })
      .from(payments)
      .leftJoin(tenants, eq(payments.tenantId, tenants.id))
      .leftJoin(bills, eq(payments.billId, bills.id))
      .where(eq(payments.status, 'pending'))
      .orderBy(payments.createdAt);

    return NextResponse.json({
      success: true,
      data: pendingPayments,
    });
  } catch (error: any) {
    console.error('Get pending payments error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
