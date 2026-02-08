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
    const contentType = request.headers.get('content-type');
    let body: any;
    let screenshotUrl: string | undefined;

    // 处理文件上传（支付凭证）
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // 提取字段
      body = {
        tenantId: formData.get('tenantId') as string,
        billId: formData.get('billId') as string,
        amount: formData.get('amount') as string,
        type: formData.get('type') as string,
        paymentMethod: formData.get('paymentMethod') as string,
        transactionId: formData.get('transactionId') as string,
        remarks: formData.get('remarks') as string,
      };

      // 上传支付截图
      const screenshot = formData.get('screenshot') as File;
      if (screenshot) {
        screenshotUrl = await uploadFile(screenshot, 'payment-screenshots');
      }
    } else {
      body = await request.json();
    }

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

    let billId = body.billId;
    let coupon = null;

    // 如果支付电费，需要关联账单
    if (body.type === 'electricity' && billId) {
      const bill = await billManager.getBillById(billId);
      if (!bill) {
        return NextResponse.json(
          { success: false, error: '账单不存在' },
          { status: 404 }
        );
      }

      // 更新账单状态（如果有支付凭证，设为待审核，否则直接完成）
      const paymentStatus = screenshotUrl ? 'pending' : 'paid';
      await billManager.updateBillStatus(
        billId,
        paymentStatus,
        body.amount,
        new Date()
      );

      // 如果直接完成支付，自动生成返现券
      if (paymentStatus === 'paid') {
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
      const paymentStatus = screenshotUrl ? 'pending' : 'paid';
      await billManager.updateBillStatus(
        billId,
        paymentStatus,
        body.amount,
        new Date()
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
      status: screenshotUrl ? 'pending' : 'completed',
      remarks: screenshotUrl 
        ? `支付凭证：${screenshotUrl}${body.remarks ? '\n' + body.remarks : ''}`
        : body.remarks,
    };

    const payment = await paymentManager.createPayment(paymentData);

    return NextResponse.json({
      success: true,
      data: payment,
      coupon,
      message: screenshotUrl 
        ? '支付提交成功，待商户审核' 
        : coupon 
          ? '支付成功，已自动发放返现券' 
          : '支付成功',
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
