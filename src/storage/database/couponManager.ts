import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { coupons, insertCouponSchema } from "./shared/schema";
import type { Coupon, InsertCoupon } from "./shared/schema";

export class CouponManager {
  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const db = await getDb();
    const validated = insertCouponSchema.parse(data);
    const [coupon] = await db.insert(coupons).values(validated).returning();
    return coupon;
  }

  async getCoupons(options: {
    tenantId?: string;
    status?: string;
  } = {}): Promise<Coupon[]> {
    const { tenantId, status } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (tenantId !== undefined) conditions.push(eq(coupons.tenantId, tenantId));
    if (status !== undefined) conditions.push(eq(coupons.status, status));

    if (conditions.length > 0) {
      return db.select().from(coupons).where(and(...conditions)).orderBy(coupons.createdAt);
    }

    return db.select().from(coupons).orderBy(coupons.createdAt);
  }

  async getCouponById(id: string): Promise<Coupon | null> {
    const db = await getDb();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || null;
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const db = await getDb();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon || null;
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | null> {
    const db = await getDb();
    const [coupon] = await db
      .update(coupons)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon || null;
  }

  async updateCouponStatus(id: string, status: string): Promise<Coupon | null> {
    const db = await getDb();
    const [coupon] = await db
      .update(coupons)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon || null;
  }

  // 根据电费账单金额生成返现券（单次支付满返）
  async generateCouponByBill(tenantId: string, billId: string, billAmount: string): Promise<Coupon | null> {
    const db = await getDb();
    const amount = parseFloat(billAmount);

    // 从系统配置中读取电费满返规则
    const { systemConfig: systemConfigTable } = await import('./shared/schema');
    const [electricityRuleConfig] = await db
      .select()
      .from(systemConfigTable)
      .where(eq(systemConfigTable.key, 'electricity_return_rule'));

    if (!electricityRuleConfig) {
      return null; // 未配置满返规则
    }

    // 解析满返规则配置（JSON格式）
    let returnRules: { minAmount: number; returnAmount: number }[] = [];
    try {
      returnRules = JSON.parse(electricityRuleConfig.value);
    } catch (error) {
      console.error('解析电费满返规则失败:', error);
      return null;
    }

    // 按金额从高到低排序，找到最匹配的规则
    returnRules.sort((a, b) => b.minAmount - a.minAmount);

    let matchedRule = null;
    for (const rule of returnRules) {
      if (amount >= rule.minAmount) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return null; // 未达到任何满返条件
    }

    // 检查该账单是否已经发放过优惠券（避免重复发放）
    const existingCoupons = await this.getCoupons({
      tenantId,
      status: 'active',
    });

    const hasBillCoupon = existingCoupons.some(coupon => coupon.billId === billId);
    if (hasBillCoupon) {
      return null; // 该账单已发放过优惠券
    }

    // 生成唯一券码
    const code = `CPN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 设置有效期（30天）
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // 最低消费金额为返现金额的3倍
    const minSpend = Math.ceil(matchedRule.returnAmount * 3);

    const [coupon] = await db
      .insert(coupons)
      .values({
        tenantId,
        billId,
        code,
        amount: matchedRule.returnAmount.toString(),
        minSpend: minSpend.toString(),
        description: `${matchedRule.returnAmount}元券(满${minSpend}用)`,
        status: 'active',
        validUntil: validUntil.toISOString(),
      })
      .returning();

    return coupon;
  }

  // 使用优惠券
  async useCoupon(couponId: string, orderId: string): Promise<Coupon | null> {
    const db = await getDb();
    const [coupon] = await db
      .update(coupons)
      .set({ status: 'used', updatedAt: new Date().toISOString() })
      .where(eq(coupons.id, couponId))
      .returning();

    // 记录使用记录
    const { couponUsages } = await import('./shared/schema');
    const couponData = await this.getCouponById(couponId);
    if (couponData) {
      await db.insert(couponUsages).values({
        couponId,
        tenantId: couponData.tenantId,
        orderId,
        amount: couponData.amount,
      });
    }

    return coupon || null;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const couponManager = new CouponManager();
