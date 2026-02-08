import { eq, and, SQL, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { supermarketOrders, insertSupermarketOrderSchema, coupons } from "./shared/schema";
import type { SupermarketOrder, InsertSupermarketOrder } from "./shared/schema";

export class SupermarketOrderManager {
  async createOrder(data: InsertSupermarketOrder): Promise<SupermarketOrder> {
    const db = await getDb();
    const validated = insertSupermarketOrderSchema.parse(data);
    const [order] = await db.insert(supermarketOrders).values(validated).returning();
    return order;
  }

  async getOrders(options: {
    tenantId?: string;
    status?: string;
  } = {}): Promise<SupermarketOrder[]> {
    const { tenantId, status } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (tenantId !== undefined) conditions.push(eq(supermarketOrders.tenantId, tenantId));
    if (status !== undefined) conditions.push(eq(supermarketOrders.status, status));

    if (conditions.length > 0) {
      return db.select().from(supermarketOrders).where(and(...conditions)).orderBy(desc(supermarketOrders.createdAt));
    }

    return db.select().from(supermarketOrders).orderBy(desc(supermarketOrders.createdAt));
  }

  async getOrderById(id: string): Promise<SupermarketOrder | null> {
    const db = await getDb();
    const [order] = await db.select().from(supermarketOrders).where(eq(supermarketOrders.id, id));
    return order || null;
  }

  async updateOrder(id: string, data: Partial<InsertSupermarketOrder>): Promise<SupermarketOrder | null> {
    const db = await getDb();
    const [order] = await db
      .update(supermarketOrders)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(supermarketOrders.id, id))
      .returning();
    return order || null;
  }

  // 创建订单并自动使用优惠券
  async createOrderWithCoupon(
    tenantId: string,
    totalAmount: string,
    items: any[],
    couponCode?: string
  ): Promise<{ order: SupermarketOrder; couponUsed: boolean; discountAmount: string }> {
    const db = await getDb();

    let couponAmount = 0;
    let couponUsed = false;
    let couponId: string | null = null;

    // 如果提供了优惠券码，检查并使用
    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode));

      if (coupon && coupon.status === 'active') {
        // 检查是否满足使用条件
        if (parseFloat(totalAmount) >= parseFloat(coupon.minSpend)) {
          couponAmount = parseFloat(coupon.amount);
          couponUsed = true;
          couponId = coupon.id;
        }
      }
    }

    const paidAmount = (parseFloat(totalAmount) - couponAmount).toFixed(2);

    const [order] = await db
      .insert(supermarketOrders)
      .values({
        tenantId,
        orderNumber: `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        totalAmount,
        discountAmount: '0.00',
        couponAmount: couponAmount.toString(),
        paidAmount,
        items: JSON.stringify(items),
        status: 'pending',
      })
      .returning();

    // 如果使用了优惠券，标记为已使用
    if (couponUsed && couponId) {
      const { couponManager } = await import('./couponManager');
      await couponManager.useCoupon(couponId, order.id);
    }

    return {
      order,
      couponUsed,
      discountAmount: couponAmount.toString(),
    };
  }

  async deleteOrder(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(supermarketOrders).where(eq(supermarketOrders.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const supermarketOrderManager = new SupermarketOrderManager();
