import { pgTable, foreignKey, uuid, text, integer, boolean, timestamp, unique, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const completedOrders = pgTable("completed_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	originalOrderId: uuid("original_order_id").notNull(),
	finalCustomerName: text("final_customer_name").notNull(),
	finalCustomerPhone: text("final_customer_phone").notNull(),
	finalCustomerContact: text("final_customer_contact"),
	finalContactMethod: text("final_contact_method"),
	finalDeliveryMethod: text("final_delivery_method").notNull(),
	finalDeliveryCost: integer("final_delivery_cost").default(0).notNull(),
	finalDiscountAmount: integer("final_discount_amount").default(0),
	finalTotalAmount: integer("final_total_amount").notNull(),
	hasManualDiscount: boolean("has_manual_discount").default(false),
	adminComment: text("admin_comment"),
	completedBy: uuid("completed_by"),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	finalOrderNumber: text("final_order_number"),
}, (table) => [
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [profiles.id],
			name: "completed_orders_completed_by_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.originalOrderId],
			foreignColumns: [orders.id],
			name: "completed_orders_original_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const completedOrderItems = pgTable("completed_order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	completedOrderId: uuid("completed_order_id").notNull(),
	productId: uuid("product_id"),
	finalQuantity: integer("final_quantity").notNull(),
	finalPriceAtTime: integer("final_price_at_time").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.completedOrderId],
			foreignColumns: [completedOrders.id],
			name: "completed_order_items_completed_order_id_completed_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "completed_order_items_product_id_products_id_fk"
		}).onDelete("set null"),
]);

export const consultations = pgTable("consultations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	contactMethod: text("contact_method").notNull(),
	contactInfo: text("contact_info").notNull(),
	message: text(),
	status: text().default('new'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const profiles = pgTable("profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	role: text().default('user'),
	email: text(),
	fullName: text("full_name"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("profiles_user_id_unique").on(table.userId),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id"),
	quantity: integer().notNull(),
	priceAtTime: integer("price_at_time").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}).onDelete("set null"),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const manufacturers = pgTable("manufacturers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	country: text(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	status: text().default('created'),
	customerName: text("customer_name").notNull(),
	customerContact: text("customer_contact"),
	contactMethod: text("contact_method"),
	comment: text(),
	totalAmount: integer("total_amount").notNull(),
	deliveryCost: integer("delivery_cost").default(0).notNull(),
	discountAmount: integer("discount_amount").default(0),
	ageConfirmed: boolean("age_confirmed").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	professionalLaunchRequested: boolean("professional_launch_requested").default(false),
	deliveryMethod: text("delivery_method").notNull(),
	deliveryAddress: text("delivery_address"),
	distanceFromMkad: integer("distance_from_mkad"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const reviews = pgTable("reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerName: text("customer_name").notNull(),
	videoUrl: text("video_url").notNull(),
	productId: uuid("product_id"),
	isApproved: boolean("is_approved").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	thumbnailUrl: text("thumbnail_url"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "reviews_product_id_products_id_fk"
		}).onDelete("set null"),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	price: integer().notNull(),
	categoryId: uuid("category_id"),
	manufacturerId: uuid("manufacturer_id"),
	images: jsonb(),
	description: text(),
	characteristics: jsonb(),
	isPopular: boolean("is_popular").default(false),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	shortDescription: text("short_description"),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	videoUrl: text("video_url"),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.manufacturerId],
			foreignColumns: [manufacturers.id],
			name: "products_manufacturer_id_manufacturers_id_fk"
		}).onDelete("set null"),
	unique("products_slug_unique").on(table.slug),
]);
