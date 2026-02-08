import { relations } from "drizzle-orm/relations";
import { rooms, tenants, coupons, bills, meters, contracts, couponUsages, supermarketOrders, payments } from "./schema";

export const tenantsRelations = relations(tenants, ({one, many}) => ({
	room: one(rooms, {
		fields: [tenants.roomId],
		references: [rooms.id]
	}),
	coupons: many(coupons),
	contracts: many(contracts),
	bills: many(bills),
	couponUsages: many(couponUsages),
	supermarketOrders: many(supermarketOrders),
	payments: many(payments),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	tenants: many(tenants),
	meters: many(meters),
	contracts: many(contracts),
	bills: many(bills),
}));

export const couponsRelations = relations(coupons, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [coupons.tenantId],
		references: [tenants.id]
	}),
	bill: one(bills, {
		fields: [coupons.billId],
		references: [bills.id]
	}),
	couponUsages: many(couponUsages),
}));

export const billsRelations = relations(bills, ({one, many}) => ({
	coupons: many(coupons),
	tenant: one(tenants, {
		fields: [bills.tenantId],
		references: [tenants.id]
	}),
	room: one(rooms, {
		fields: [bills.roomId],
		references: [rooms.id]
	}),
	payments: many(payments),
}));

export const metersRelations = relations(meters, ({one}) => ({
	room: one(rooms, {
		fields: [meters.roomId],
		references: [rooms.id]
	}),
}));

export const contractsRelations = relations(contracts, ({one}) => ({
	tenant: one(tenants, {
		fields: [contracts.tenantId],
		references: [tenants.id]
	}),
	room: one(rooms, {
		fields: [contracts.roomId],
		references: [rooms.id]
	}),
}));

export const couponUsagesRelations = relations(couponUsages, ({one}) => ({
	coupon: one(coupons, {
		fields: [couponUsages.couponId],
		references: [coupons.id]
	}),
	tenant: one(tenants, {
		fields: [couponUsages.tenantId],
		references: [tenants.id]
	}),
	supermarketOrder: one(supermarketOrders, {
		fields: [couponUsages.orderId],
		references: [supermarketOrders.id]
	}),
}));

export const supermarketOrdersRelations = relations(supermarketOrders, ({one, many}) => ({
	couponUsages: many(couponUsages),
	tenant: one(tenants, {
		fields: [supermarketOrders.tenantId],
		references: [tenants.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	tenant: one(tenants, {
		fields: [payments.tenantId],
		references: [tenants.id]
	}),
	bill: one(bills, {
		fields: [payments.billId],
		references: [bills.id]
	}),
}));