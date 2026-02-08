import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: '请输入手机号' },
        { status: 400 }
      );
    }

    // 从环境变量获取管理员手机号白名单
    const adminPhones = process.env.ADMIN_PHONES?.split(',').map(p => p.trim()) || [];

    // 验证手机号是否在白名单中
    const isValid = adminPhones.includes(phone);

    if (!isValid) {
      return NextResponse.json(
        { error: '您没有管理员权限' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      phone,
    });
  } catch (error) {
    console.error('[AdminLogin] 登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
