import { eq, and, SQL, desc } from "drizzle-orm";
import { db } from "./index";
import { payments, insertPaymentSchema } from "./shared/schema";
import type { Payment, InsertPayment } from "./shared/schema";

export class PaymentManager {
  async createPayment(data: InsertPayment): Promise<Payment> {
    
    const validated = insertPaymentSchema.parse(data);
    const [payment] = await db.insert(payments).values(validated).returning();
    return payment;
  }

  async getPayments(options: {
    tenantId?: string;
    billId?: string;
    type?: string;
    status?: string;
  } = {}): Promise<Payment[]> {
    const { tenantId, billId, type, status } = options;
    

    const conditions: SQL[] = [];
    if (tenantId !== undefined) conditions.push(eq(payments.tenantId, tenantId));
    if (billId !== undefined) conditions.push(eq(payments.billId, billId));
    if (type !== undefined) conditions.push(eq(payments.type, type));
    if (status !== undefined) conditions.push(eq(payments.status, status));

    if (conditions.length > 0) {
      return db.select().from(payments).where(and(...conditions)).orderBy(desc(payments.createdAt));
    }

    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || null;
  }

  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | null> {
    
    const [payment] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return payment || null;
  }

  async deletePayment(id: string): Promise<boolean> {
    
    const result = await db.delete(payments).where(eq(payments.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const paymentManager = new PaymentManager();
