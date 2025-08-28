// schema.ts
import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enum для статусов заказов
export const orderStatusEnum = ['created', 'in_progress', 'completed', 'cancelled'] as const;

// Enum для способов связи
export const contactMethodEnum = ['telegram', 'whatsapp', 'phone'] as const;

// Enum для статусов консультаций
export const consultationStatusEnum = ['new', 'contacted', 'completed'] as const;

// Enum для ролей пользователей
export const userRoleEnum = ['admin', 'user'] as const;

// Таблица категорий
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  created_at: timestamp('created_at').defaultNow(),
})

// Таблица производителей
export const manufacturers = pgTable('manufacturers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  country: text('country'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
})

// Таблица продуктов
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price: integer('price').notNull(), // цена в рублях
  category_id: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  manufacturer_id: uuid('manufacturer_id').references(() => manufacturers.id, { onDelete: 'set null' }),
  images: jsonb('images').$type<string[]>(),
  description: text('description'),
  short_description: text('short_description'),
  characteristics: jsonb('characteristics').$type<Record<string, any>>(),
  is_popular: boolean('is_popular').default(false),
  is_active: boolean('is_active').default(true),
  is_archived: boolean('is_archived').default(false),
  seo_title: text('seo_title'),
  seo_description: text('seo_description'),
  stock_quantity: integer('stock_quantity').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

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
})

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

  // Поле для услуги профессионального запуска салютов
  professional_launch_requested: boolean('professional_launch_requested').default(false),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Таблица элементов заказа
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  price_at_time: integer('price_at_time').notNull(), // цена в рублях на момент заказа
  created_at: timestamp('created_at').defaultNow(),
})

// Таблица профилей пользователей (для админов)
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().unique(), // Supabase Auth user ID (ИСПРАВЛЕНО: было text)
  role: text('role', { enum: userRoleEnum }).default('user'),
  email: text('email'),
  full_name: text('full_name'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Таблица отзывов (видео)
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  customer_name: text('customer_name').notNull(),

  // Основная ссылка для встраивания или воспроизведения
  video_url: text('video_url').notNull(),

  // Прямая ссылка на превью-картинку (для красивого отображения до воспроизведения)
  thumbnail_url: text('thumbnail_url'),

  product_id: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  is_approved: boolean('is_approved').default(false),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Отношения
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const manufacturersRelations = relations(manufacturers, ({ many }) => ({
  products: many(products),
}))

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
}))

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
}))