// schema.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum для статусов заказов
export const orderStatusEnum = [
  'created',
  'in_progress',
  'completed',
  'cancelled',
] as const;

// Enum для способов связи
export const contactMethodEnum = ['telegram', 'whatsapp', 'phone'] as const;

// Enum для статусов консультаций
export const consultationStatusEnum = [
  'new',
  'contacted',
  'completed',
] as const;

// Enum для ролей пользователей
export const userRoleEnum = ['admin', 'user'] as const;

// Enum для способов получения заказа
export const deliveryMethodEnum = ['delivery', 'pickup'] as const;

// Таблица категорий
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  created_at: timestamp('created_at').defaultNow(),
});

// Таблица производителей
export const manufacturers = pgTable('manufacturers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  country: text('country'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
});

// Таблица продуктов
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price: integer('price').notNull(), // цена в рублях
  category_id: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  manufacturer_id: uuid('manufacturer_id').references(() => manufacturers.id, {
    onDelete: 'set null',
  }),
  images: jsonb('images').$type<string[]>(),
  video_url: text('video_url'), // ссылка на видео Rutube
  description: text('description'),
  short_description: text('short_description'),
  characteristics: jsonb('characteristics').$type<Record<string, any>>(),
  is_popular: boolean('is_popular').default(false),
  is_active: boolean('is_active').default(true),
  seo_title: text('seo_title'),
  seo_description: text('seo_description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Таблица консультаций
export const consultations = pgTable('consultations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  contact_method: text('contact_method', { enum: contactMethodEnum }).notNull(),
  contact_info: text('contact_info').notNull(),
  message: text('message'),
  status: text('status', { enum: consultationStatusEnum }).default('new'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Таблица заказов
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  status: text('status', { enum: orderStatusEnum }).default('created'),
  customer_name: text('customer_name').notNull(),
  customer_phone: text('customer_phone').notNull(),
  customer_contact: text('customer_contact'), // Telegram/WhatsApp username
  contact_method: text('contact_method', { enum: contactMethodEnum }),
  comment: text('comment'),
  total_amount: integer('total_amount').notNull(), // сумма в рублях
  delivery_cost: integer('delivery_cost').notNull().default(0),
  discount_amount: integer('discount_amount').default(0),
  age_confirmed: boolean('age_confirmed').notNull().default(false),

  // Поля для способа получения заказа
  delivery_method: text('delivery_method', {
    enum: deliveryMethodEnum,
  }).notNull(),
  delivery_address: text('delivery_address'), // адрес доставки (если выбрана доставка)
  distance_from_mkad: integer('distance_from_mkad'), // расстояние от МКАД в км (для доставки)

  // Поле для услуги профессионального запуска салютов
  professional_launch_requested: boolean(
    'professional_launch_requested'
  ).default(false),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Таблица элементов заказа
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  order_id: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  product_id: uuid('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  quantity: integer('quantity').notNull(),
  price_at_time: integer('price_at_time').notNull(), // цена в рублях на момент заказа
  created_at: timestamp('created_at').defaultNow(),
});

// Таблица завершенных заказов (отдельная от основных заказов)
export const completedOrders = pgTable('completed_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  original_order_id: uuid('original_order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),

  // Административные поля
  final_order_number: text('final_order_number'), // Номер заказа для администраторов

  // Финальные данные клиента (может отличаться от исходных)
  final_customer_name: text('final_customer_name').notNull(),
  final_customer_phone: text('final_customer_phone').notNull(),
  final_customer_contact: text('final_customer_contact'),
  final_contact_method: text('final_contact_method', { enum: contactMethodEnum }),

  // Финальные расчеты
  final_delivery_method: text('final_delivery_method', { enum: deliveryMethodEnum }).notNull(),
  final_delivery_cost: integer('final_delivery_cost').notNull().default(0),
  final_discount_amount: integer('final_discount_amount').default(0),
  final_total_amount: integer('final_total_amount').notNull(),
  has_manual_discount: boolean('has_manual_discount').default(false),

  // Комментарии и метаданные
  admin_comment: text('admin_comment'),
  completed_by: uuid('completed_by').references(() => profiles.id),

  // Временные метки
  completed_at: timestamp('completed_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
});

// Таблица товаров в завершенных заказах
export const completedOrderItems = pgTable('completed_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  completed_order_id: uuid('completed_order_id')
    .references(() => completedOrders.id, { onDelete: 'cascade' })
    .notNull(),
  product_id: uuid('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),

  // Финальные данные товара
  final_quantity: integer('final_quantity').notNull(),
  final_price_at_time: integer('final_price_at_time').notNull(),

  created_at: timestamp('created_at').defaultNow(),
});

// Таблица профилей пользователей (для админов)
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull().unique(), // Supabase Auth user ID - keeping as text to avoid casting issues
  role: text('role', { enum: userRoleEnum }).default('user'),
  email: text('email'),
  full_name: text('full_name'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Таблица отзывов (видео)
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  customer_name: text('customer_name').notNull(),

  // Основная ссылка для встраивания или воспроизведения
  video_url: text('video_url').notNull(),

  // Прямая ссылка на превью-картинку (для красивого отображения до воспроизведения)
  thumbnail_url: text('thumbnail_url'),

  product_id: uuid('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  is_approved: boolean('is_approved').default(false),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Отношения
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const manufacturersRelations = relations(manufacturers, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  manufacturer: one(manufacturers, {
    fields: [products.manufacturer_id],
    references: [manufacturers.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  completedOrder: one(completedOrders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

export const completedOrdersRelations = relations(completedOrders, ({ one, many }) => ({
  originalOrder: one(orders, {
    fields: [completedOrders.original_order_id],
    references: [orders.id],
  }),
  items: many(completedOrderItems),
  completedBy: one(profiles, {
    fields: [completedOrders.completed_by],
    references: [profiles.id],
  }),
}));

export const completedOrderItemsRelations = relations(completedOrderItems, ({ one }) => ({
  completedOrder: one(completedOrders, {
    fields: [completedOrderItems.completed_order_id],
    references: [completedOrders.id],
  }),
  product: one(products, {
    fields: [completedOrderItems.product_id],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
}));
