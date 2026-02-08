import { pgTable, index, foreignKey, unique, varchar, integer, numeric, timestamp, text, boolean, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

const { createInsertSchema } = createSchemaFactory({
  coerce: { date: true }
})


export const tenants = pgTable("tenants", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	roomId: varchar("room_id", { length: 36 }),
	name: varchar({ length: 128 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	idCard: varchar("id_card", { length: 20 }),
	familyMembers: integer("family_members").default(1),
	deposit: numeric({ precision: 10, scale:  2 }).default('0.00'),
	status: varchar({ length: 20 }).default('active').notNull(),
	moveInDate: timestamp("move_in_date", { withTimezone: true, mode: 'string' }),
	moveOutDate: timestamp("move_out_date", { withTimezone: true, mode: 'string' }),
	remarks: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	tenantCode: varchar("tenant_code", { length: 10 }),
}, (table) => [
	index("tenants_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("tenants_room_id_idx").using("btree", table.roomId.asc().nullsLast().op("text_ops")),
	index("tenants_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("tenants_tenant_code_idx").using("btree", table.tenantCode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "tenants_room_id_rooms_id_fk"
		}),
	unique("tenants_tenant_code_key").on(table.tenantCode),
]);

export const coupons = pgTable("coupons", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	tenantId: varchar("tenant_id", { length: 36 }).notNull(),
	billId: varchar("bill_id", { length: 36 }),
	code: varchar({ length: 50 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	minSpend: numeric("min_spend", { precision: 10, scale:  2 }).notNull(),
	description: varchar({ length: 200 }),
	status: varchar({ length: 20 }).default('active').notNull(),
	validUntil: timestamp("valid_until", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("coupons_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("coupons_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("coupons_tenant_id_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "coupons_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.billId],
			foreignColumns: [bills.id],
			name: "coupons_bill_id_bills_id_fk"
		}),
	unique("coupons_code_unique").on(table.code),
]);

export const meters = pgTable("meters", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	roomId: varchar("room_id", { length: 36 }).notNull(),
	meterNumber: varchar("meter_number", { length: 50 }).notNull(),
	currentReading: numeric("current_reading", { precision: 10, scale:  2 }).default('0.00'),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).default('1.00').notNull(),
	lastReadingDate: timestamp("last_reading_date", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("meters_meter_number_idx").using("btree", table.meterNumber.asc().nullsLast().op("text_ops")),
	index("meters_room_id_idx").using("btree", table.roomId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "meters_room_id_rooms_id_fk"
		}),
	unique("meters_meter_number_unique").on(table.meterNumber),
]);

export const systemConfig = pgTable("system_config", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("system_config_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
	unique("system_config_key_unique").on(table.key),
]);

export const contracts = pgTable("contracts", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	tenantId: varchar("tenant_id", { length: 36 }).notNull(),
	roomId: varchar("room_id", { length: 36 }),
	contractNumber: varchar("contract_number", { length: 50 }),
	type: varchar({ length: 20 }).notNull(),
	fileUrl: text("file_url"),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }).notNull(),
	monthlyRent: numeric("monthly_rent", { precision: 10, scale:  2 }).notNull(),
	depositAmount: numeric("deposit_amount", { precision: 10, scale:  2 }).notNull(),
	terms: jsonb(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("contracts_contract_number_idx").using("btree", table.contractNumber.asc().nullsLast().op("text_ops")),
	index("contracts_room_id_idx").using("btree", table.roomId.asc().nullsLast().op("text_ops")),
	index("contracts_tenant_id_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "contracts_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "contracts_room_id_rooms_id_fk"
		}),
	unique("contracts_contract_number_unique").on(table.contractNumber),
]);

export const bills = pgTable("bills", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	tenantId: varchar("tenant_id", { length: 36 }).notNull(),
	roomId: varchar("room_id", { length: 36 }),
	type: varchar({ length: 20 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paidAmount: numeric("paid_amount", { precision: 10, scale:  2 }).default('0.00'),
	status: varchar({ length: 20 }).default('unpaid').notNull(),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }),
	paidDate: timestamp("paid_date", { withTimezone: true, mode: 'string' }),
	periodStart: timestamp("period_start", { withTimezone: true, mode: 'string' }),
	periodEnd: timestamp("period_end", { withTimezone: true, mode: 'string' }),
	details: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("bills_room_id_idx").using("btree", table.roomId.asc().nullsLast().op("text_ops")),
	index("bills_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("bills_tenant_id_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	index("bills_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "bills_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "bills_room_id_rooms_id_fk"
		}),
]);

export const couponUsages = pgTable("coupon_usages", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	couponId: varchar("coupon_id", { length: 36 }).notNull(),
	tenantId: varchar("tenant_id", { length: 36 }).notNull(),
	orderId: varchar("order_id", { length: 36 }),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("coupon_usages_coupon_id_idx").using("btree", table.couponId.asc().nullsLast().op("text_ops")),
	index("coupon_usages_order_id_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	index("coupon_usages_tenant_id_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.couponId],
			foreignColumns: [coupons.id],
			name: "coupon_usages_coupon_id_coupons_id_fk"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "coupon_usages_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [supermarketOrders.id],
			name: "coupon_usages_order_id_supermarket_orders_id_fk"
		}),
]);

export const supermarketOrders = pgTable("supermarket_orders", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	tenantId: varchar("tenant_id", { length: 36 }).notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0.00'),
	couponAmount: numeric("coupon_amount", { precision: 10, scale:  2 }).default('0.00'),
	paidAmount: numeric("paid_amount", { precision: 10, scale:  2 }).notNull(),
	items: jsonb().notNull(),
	status: varchar({ length: 20 }).default('completed').notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }),
	transactionId: varchar("transaction_id", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("supermarket_orders_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("supermarket_orders_order_number_idx").using("btree", table.orderNumber.asc().nullsLast().op("text_ops")),
	index("supermarket_orders_tenant_id_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "supermarket_orders_tenant_id_tenants_id_fk"
		}),
	unique("supermarket_orders_order_number_unique").on(table.orderNumber),
]);

export const payments = pgTable("payments", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	tenantId: varchar("tenant_id", { length: 36 }).notNull(),
	billId: varchar("bill_id", { length: 36 }),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }),
	transactionId: varchar("transaction_id", { length: 100 }),
	status: varchar({ length: 20 }).default('completed').notNull(),
	remarks: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payments_bill_id_idx").using("btree", table.billId.asc().nullsLast().op("text_ops")),
	index("payments_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("payments_tenant_id_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "payments_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.billId],
			foreignColumns: [bills.id],
			name: "payments_bill_id_bills_id_fk"
		}),
]);

export const rooms = pgTable("rooms", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	roomNumber: varchar("room_number", { length: 20 }).notNull(),
	floor: integer().notNull(),
	type: varchar({ length: 20 }).notNull(),
	area: integer(),
	baseRent: numeric("base_rent", { precision: 10, scale:  2 }),
	status: varchar({ length: 20 }).default('available').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	roomType: varchar("room_type", { length: 50 }).default('single'),
	price: numeric({ precision: 10, scale:  2 }).default('500.00'),
	photos: jsonb().$type<string[]>().default([]),
}, (table) => [
	index("rooms_floor_idx").using("btree", table.floor.asc().nullsLast().op("int4_ops")),
	index("rooms_room_type_idx").using("btree", table.roomType.asc().nullsLast().op("text_ops")),
	index("rooms_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("rooms_room_number_unique").on(table.roomNumber),
]);

// Zod schemas for validation
export const insertTenantSchema = createInsertSchema(tenants)
export const updateTenantSchema = createInsertSchema(tenants).partial()
export const insertCouponSchema = createInsertSchema(coupons)
export const insertMeterSchema = createInsertSchema(meters)
export const insertSystemConfigSchema = createInsertSchema(systemConfig)
export const insertContractSchema = createInsertSchema(contracts)
export const insertBillSchema = createInsertSchema(bills)
export const insertCouponUsageSchema = createInsertSchema(couponUsages)
export const insertSupermarketOrderSchema = createInsertSchema(supermarketOrders)
export const insertPaymentSchema = createInsertSchema(payments)
export const insertRoomSchema = createInsertSchema(rooms)

// TypeScript types
export type Tenant = typeof tenants.$inferSelect
export type InsertTenant = z.infer<typeof insertTenantSchema>
export type UpdateTenant = z.infer<typeof updateTenantSchema>
export type Coupon = typeof coupons.$inferSelect
export type InsertCoupon = z.infer<typeof insertCouponSchema>
export type Meter = typeof meters.$inferSelect
export type InsertMeter = z.infer<typeof insertMeterSchema>
export type SystemConfig = typeof systemConfig.$inferSelect
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>
export type Contract = typeof contracts.$inferSelect
export type InsertContract = z.infer<typeof insertContractSchema>
export type Bill = typeof bills.$inferSelect
export type InsertBill = z.infer<typeof insertBillSchema>
export type CouponUsage = typeof couponUsages.$inferSelect
export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>
export type SupermarketOrder = typeof supermarketOrders.$inferSelect
export type InsertSupermarketOrder = z.infer<typeof insertSupermarketOrderSchema>
export type Payment = typeof payments.$inferSelect
export type InsertPayment = z.infer<typeof insertPaymentSchema>
export type Room = typeof rooms.$inferSelect
export type InsertRoom = z.infer<typeof insertRoomSchema>
