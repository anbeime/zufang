import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 创建数据库连接
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const client = postgres(connectionString);
export const db = drizzle(client);

export { roomManager } from "./roomManager";
export { tenantManager } from "./tenantManager";
export { billManager } from "./billManager";
export { paymentManager } from "./paymentManager";
export { couponManager } from "./couponManager";
export { supermarketOrderManager } from "./supermarketOrderManager";

export * from "./shared/schema";
