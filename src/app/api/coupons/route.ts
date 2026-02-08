import { NextRequest, NextResponse } from 'next/server';
import { couponManager } from '@/storage/database';

// GET - 获取优惠券列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const coupons = await couponManager.getCoupons({
      tenantId: tenantId || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
