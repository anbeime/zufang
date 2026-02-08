import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { systemConfig } from '@/storage/database/shared/schema';

// 获取配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const db = await getDb();

    if (key) {
      // 获取单个配置
      const [config] = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.key, key));

      return NextResponse.json({
        success: true,
        data: config || null,
      });
    } else {
      // 获取所有配置
      const configs = await db.select().from(systemConfig);
      return NextResponse.json({
        success: true,
        data: configs,
      });
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    );
  }
}

// 设置配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查配置是否已存在
    const [existing] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key));

    if (existing) {
      // 更新现有配置
      await db
        .update(systemConfig)
        .set({ value, description, updatedAt: new Date().toISOString() })
        .where(eq(systemConfig.key, key));
    } else {
      // 创建新配置
      await db.insert(systemConfig).values({
        key,
        value,
        description,
      });
    }

    return NextResponse.json({
      success: true,
      data: { key, value, description },
    });
  } catch (error) {
    console.error('设置配置失败:', error);
    return NextResponse.json(
      { success: false, error: '设置配置失败' },
      { status: 500 }
    );
  }
}
