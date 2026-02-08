import { NextRequest, NextResponse } from 'next/server';
import { paymentManager, billManager, couponManager, tenantManager } from '@/storage/database';
import { uploadFile } from '@/lib/storage';
import type { InsertPayment } from '@/storage/database';

// GET - 获取支付记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const billId = searchParams.get('billId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const payments = await paymentManager.getPayments({
      tenantId: tenantId || undefined,
      billId: billId || undefined,
      type: type || undefined,
      status: status || undefined,
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建支付（支付房租或电费）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.tenantId || !body.amount || !body.type) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：tenantId, amount, type' },
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

    const amount = parseFloat(body.amount);
    let billId = body.billId;
    let coupon = null;

    // 金额阈值判断（从环境变量读取，默认500元）
    const autoConfirmThreshold = parseFloat(process.env.AUTO_CONFIRM_THRESHOLD || '500');
    const needsConfirmation = amount >= autoConfirmThreshold;

    // 确定支付状态
    const paymentStatus = needsConfirmation ? 'pending' : 'completed';
    const billStatus = needsConfirmation ? 'pending' : 'paid';

    // 如果支付电费，需要关联账单
    if (body.type === 'electricity' && billId) {
      const bill = await billManager.getBillById(billId);
      if (!bill) {
        return NextResponse.json(
          { success: false, error: '账单不存在' },
          { status: 404 }
        );
      }

      // 更新账单状态
      await billManager.updateBillStatus(
        billId,
        billStatus,
        body.amount,
        needsConfirmation ? undefined : new Date()
      );

      // 如果是小额自动确认，立即生成返现券
      if (!needsConfirmation) {
        coupon = await couponManager.generateCouponByBill(
          body.tenantId,
          billId,
          body.amount
        );
      }
    }

    // 如果支付房租
    if (body.type === 'rent' && billId) {
      const bill = await billManager.getBillById(billId);
      if (!bill) {
        return NextResponse.json(
          { success: false, error: '账单不存在' },
          { status: 404 }
        );
      }

      // 更新账单状态
      await billManager.updateBillStatus(
        billId,
        billStatus,
        body.amount,
        needsConfirmation ? undefined : new Date()
      );
    }

    // 创建支付记录
    const paymentData: InsertPayment = {
      tenantId: body.tenantId,
      billId,
      amount: body.amount,
      type: body.type,
      paymentMethod: body.paymentMethod || 'wechat',
      transactionId: body.transactionId,
      status: paymentStatus,
      remarks: needsConfirmation 
        ? `大额支付，等待商户确认（金额：￥${amount}）${body.remarks ? '\n' + body.remarks : ''}`
        : body.remarks,
    };

    const payment = await paymentManager.createPayment(paymentData);

    // 返回不同的消息
    let message = '支付成功';
    if (needsConfirmation) {
      message = `支付提交成功，金额较大（≥￥${autoConfirmThreshold}），等待商户确认`;
    } else if (coupon) {
      message = '支付成功，已自动发放返现券';
    }

    return NextResponse.json({
      success: true,
      data: payment,
      coupon,
      needsConfirmation,
      message,
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
