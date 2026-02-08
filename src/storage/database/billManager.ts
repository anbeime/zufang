import { eq, and, SQL, sql } from "drizzle-orm";
import { db } from "./index";
import { bills, insertBillSchema, tenants, rooms } from "./shared/schema";
import type { Bill, InsertBill } from "./shared/schema";

export class BillManager {
  async createBill(data: InsertBill): Promise<Bill> {
    
    const validated = insertBillSchema.parse(data);
    const [bill] = await db.insert(bills).values(validated).returning();
    return bill;
  }

  async getBills(options: {
    tenantId?: string;
    roomId?: string;
    type?: string;
    status?: string;
  } = {}): Promise<Bill[]> {
    const { tenantId, roomId, type, status } = options;
    

    const conditions: SQL[] = [];
    if (tenantId !== undefined) conditions.push(eq(bills.tenantId, tenantId));
    if (roomId !== undefined) conditions.push(eq(bills.roomId, roomId));
    if (type !== undefined) conditions.push(eq(bills.type, type));
    if (status !== undefined) conditions.push(eq(bills.status, status));

    if (conditions.length > 0) {
      return db.select().from(bills).where(and(...conditions)).orderBy(bills.createdAt);
    }

    return db.select().from(bills).orderBy(bills.createdAt);
  }

  async getBillById(id: string): Promise<Bill | null> {
    
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill || null;
  }

  async updateBill(id: string, data: Partial<InsertBill>): Promise<Bill | null> {
    
    const [bill] = await db
      .update(bills)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(bills.id, id))
      .returning();
    return bill || null;
  }

  async updateBillStatus(id: string, status: string, paidAmount?: string, paidDate?: Date): Promise<Bill | null> {
    
    const updateData: any = { status, updatedAt: new Date().toISOString() };
    if (paidAmount) updateData.paidAmount = paidAmount;
    if (paidDate) updateData.paidDate = paidDate.toISOString();

    const [bill] = await db
      .update(bills)
      .set(updateData)
      .where(eq(bills.id, id))
      .returning();
    return bill || null;
  }

  // 生成电费账单
  async generateElectricityBill(tenantId: string, roomId: string, usage: number, unitPrice: string): Promise<Bill> {
    const amount = (usage * parseFloat(unitPrice)).toFixed(2);

    
    const [bill] = await db
      .insert(bills)
      .values({
        tenantId,
        roomId,
        type: 'electricity',
        amount,
        paidAmount: '0.00',
        status: 'unpaid',
        details: JSON.stringify({ usage, unitPrice }),
      })
      .returning();

    return bill;
  }

  // 生成房租账单
  async generateRentBill(tenantId: string, roomId: string, amount: string, dueDate: Date): Promise<Bill> {
    
    const [bill] = await db
      .insert(bills)
      .values({
        tenantId,
        roomId,
        type: 'rent',
        amount,
        paidAmount: '0.00',
        status: 'unpaid',
        dueDate: dueDate.toISOString(),
      })
      .returning();

    return bill;
  }

  async deleteBill(id: string): Promise<boolean> {
    
    const result = await db.delete(bills).where(eq(bills.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const billManager = new BillManager();
