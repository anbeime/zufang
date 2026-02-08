import { getDb } from "coze-coding-dev-sdk";

// 导出 db 实例
export const db = await getDb();

export { roomManager } from "./roomManager";
export { tenantManager } from "./tenantManager";
export { billManager } from "./billManager";
export { paymentManager } from "./paymentManager";
export { couponManager } from "./couponManager";
export { supermarketOrderManager } from "./supermarketOrderManager";

export * from "./shared/schema";
