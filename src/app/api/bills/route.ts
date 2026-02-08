import { NextRequest, NextResponse } from 'next/server';
import { billManager } from '@/storage/database';

// GET - 获取账单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const roomId = searchParams.get('roomId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const bills = await billManager.getBills({
      tenantId: tenantId || undefined,
      roomId: roomId || undefined,
      type: type || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: bills });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建账单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { tenantId, roomId, type, amount, details, dueDate } = body;

    if (!tenantId || !roomId || !type || !amount) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const bill = await billManager.createBill({
      tenantId,
      roomId,
      type,
      amount,
      paidAmount: '0.00',
      status: 'unpaid',
      details,
      dueDate,
    });

    return NextResponse.json({ success: true, data: bill });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
