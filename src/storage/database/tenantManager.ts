import { eq, and, SQL, like } from "drizzle-orm";
import { db } from "./index";
import { tenants, insertTenantSchema, updateTenantSchema } from "./shared/schema";
import type { Tenant, InsertTenant, UpdateTenant } from "./shared/schema";

export class TenantManager {
  async createTenant(data: InsertTenant): Promise<Tenant> {
    
    const validated = insertTenantSchema.parse(data);
    const [tenant] = await db.insert(tenants).values({
      ...validated,
    }).returning();
    return tenant;
  }

  async getTenants(options: {
    roomId?: string;
    status?: string;
    phone?: string;
  } = {}): Promise<Tenant[]> {
    const { roomId, status, phone } = options;
    

    const conditions: SQL[] = [];
    if (roomId !== undefined) conditions.push(eq(tenants.roomId, roomId));
    if (status !== undefined) conditions.push(eq(tenants.status, status));
    if (phone !== undefined) conditions.push(like(tenants.phone, `%${phone}%`));

    if (conditions.length > 0) {
      return db.select().from(tenants).where(and(...conditions)).orderBy(tenants.createdAt);
    }

    return db.select().from(tenants).orderBy(tenants.createdAt);
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || null;
  }

  async getTenantByPhone(phone: string): Promise<Tenant | null> {
    
    const [tenant] = await db.select().from(tenants).where(eq(tenants.phone, phone));
    return tenant || null;
  }

  async updateTenant(id: string, data: UpdateTenant): Promise<Tenant | null> {
    
    const validated = updateTenantSchema.parse(data);
    const [tenant] = await db
      .update(tenants)
      .set({ ...validated, updatedAt: new Date().toISOString() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant || null;
  }

  async updateTenantStatus(id: string, status: string, moveOutDate?: Date): Promise<Tenant | null> {
    
    const updateData: any = { status, updatedAt: new Date().toISOString() };
    if (moveOutDate) updateData.moveOutDate = moveOutDate.toISOString();

    const [tenant] = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, id))
      .returning();
    return tenant || null;
  }

  async deleteTenant(id: string): Promise<boolean> {
    
    const result = await db.delete(tenants).where(eq(tenants.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const tenantManager = new TenantManager();
