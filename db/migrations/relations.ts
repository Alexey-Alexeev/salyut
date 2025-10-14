import { relations } from "drizzle-orm/relations";
import { profiles, completedOrders, orders, completedOrderItems, products, orderItems, reviews, categories, manufacturers } from "./schema";

export const completedOrdersRelations = relations(completedOrders, ({one, many}) => ({
	profile: one(profiles, {
		fields: [completedOrders.completedBy],
		references: [profiles.id]
	}),
	order: one(orders, {
		fields: [completedOrders.originalOrderId],
		references: [orders.id]
	}),
	completedOrderItems: many(completedOrderItems),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	completedOrders: many(completedOrders),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	completedOrders: many(completedOrders),
	orderItems: many(orderItems),
}));

export const completedOrderItemsRelations = relations(completedOrderItems, ({one}) => ({
	completedOrder: one(completedOrders, {
		fields: [completedOrderItems.completedOrderId],
		references: [completedOrders.id]
	}),
	product: one(products, {
		fields: [completedOrderItems.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	completedOrderItems: many(completedOrderItems),
	orderItems: many(orderItems),
	reviews: many(reviews),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	manufacturer: one(manufacturers, {
		fields: [products.manufacturerId],
		references: [manufacturers.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const manufacturersRelations = relations(manufacturers, ({many}) => ({
	products: many(products),
}));