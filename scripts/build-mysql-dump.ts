/**
 * Шаг 2: собирает regru/mysql/salyut-mysql.sql — полный дамп для reg.ru MySQL.
 * Схема (CREATE TABLE, Postgres→MySQL) + данные (INSERT) из regru/export/*.json.
 * Импортируется через phpMyAdmin одним файлом.
 * Запуск: npx tsx scripts/build-mysql-dump.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const EXPORT_DIR = join(process.cwd(), 'regru', 'export');
const OUT_DIR = join(process.cwd(), 'regru', 'mysql');
mkdirSync(OUT_DIR, { recursive: true });

// --- DDL: структура таблиц под MySQL/MariaDB (utf8mb4) ---
const DDL = `-- Дамп базы SalutGrad для reg.ru (MySQL/MariaDB)
-- Сгенерировано автоматически из выгрузки Supabase.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS completed_order_items;
DROP TABLE IF EXISTS completed_orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS manufacturers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS profiles;

CREATE TABLE categories (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE manufacturers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  price INT NOT NULL,
  old_price INT,
  category_id CHAR(36),
  manufacturer_id CHAR(36),
  images JSON,
  video_url TEXT,
  description TEXT,
  short_description TEXT,
  characteristics JSON,
  is_popular TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  event_types JSON,
  seo_title TEXT,
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category_id),
  INDEX idx_products_active (is_active),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE consultations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_method VARCHAR(20) NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'created',
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_contact VARCHAR(255),
  contact_method VARCHAR(20),
  comment TEXT,
  total_amount INT NOT NULL,
  delivery_cost INT NOT NULL DEFAULT 0,
  discount_amount INT DEFAULT 0,
  age_confirmed TINYINT(1) NOT NULL DEFAULT 0,
  delivery_method VARCHAR(20) NOT NULL,
  delivery_address TEXT,
  distance_from_mkad INT,
  professional_launch_requested TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  quantity INT NOT NULL,
  price_at_time INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE profiles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) DEFAULT 'user',
  email VARCHAR(255),
  full_name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE completed_orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  original_order_id CHAR(36) NOT NULL,
  final_order_number VARCHAR(255),
  final_customer_name VARCHAR(255) NOT NULL,
  final_customer_phone VARCHAR(50) NOT NULL,
  final_customer_contact VARCHAR(255),
  final_contact_method VARCHAR(20),
  final_delivery_method VARCHAR(20) NOT NULL,
  final_delivery_cost INT NOT NULL DEFAULT 0,
  final_discount_amount INT DEFAULT 0,
  final_total_amount INT NOT NULL,
  has_manual_discount TINYINT(1) DEFAULT 0,
  admin_comment TEXT,
  completed_by CHAR(36),
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_completed_orders_order FOREIGN KEY (original_order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_completed_orders_profile FOREIGN KEY (completed_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE completed_order_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  completed_order_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  final_quantity INT NOT NULL,
  final_price_at_time INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coi_completed_order FOREIGN KEY (completed_order_id) REFERENCES completed_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_coi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  product_id CHAR(36),
  is_approved TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Канонический порядок колонок под каждый INSERT (совпадает с DDL)
const COLUMNS: Record<string, string[]> = {
  categories: ['id', 'name', 'slug', 'description', 'image', 'created_at'],
  manufacturers: ['id', 'name', 'country', 'description', 'created_at'],
  products: ['id', 'name', 'slug', 'price', 'old_price', 'category_id', 'manufacturer_id', 'images', 'video_url', 'description', 'short_description', 'characteristics', 'is_popular', 'is_active', 'event_types', 'seo_title', 'seo_description', 'created_at', 'updated_at'],
  consultations: ['id', 'name', 'contact_method', 'contact_info', 'message', 'status', 'created_at', 'updated_at'],
  orders: ['id', 'status', 'customer_name', 'customer_phone', 'customer_contact', 'contact_method', 'comment', 'total_amount', 'delivery_cost', 'discount_amount', 'age_confirmed', 'delivery_method', 'delivery_address', 'distance_from_mkad', 'professional_launch_requested', 'created_at', 'updated_at'],
  order_items: ['id', 'order_id', 'product_id', 'quantity', 'price_at_time', 'created_at'],
  profiles: ['id', 'user_id', 'role', 'email', 'full_name', 'created_at', 'updated_at'],
  completed_orders: ['id', 'original_order_id', 'final_order_number', 'final_customer_name', 'final_customer_phone', 'final_customer_contact', 'final_contact_method', 'final_delivery_method', 'final_delivery_cost', 'final_discount_amount', 'final_total_amount', 'has_manual_discount', 'admin_comment', 'completed_by', 'completed_at', 'created_at'],
  completed_order_items: ['id', 'completed_order_id', 'product_id', 'final_quantity', 'final_price_at_time', 'created_at'],
  reviews: ['id', 'customer_name', 'video_url', 'thumbnail_url', 'product_id', 'is_approved', 'sort_order', 'created_at', 'updated_at'],
};

// Порядок вставки (родители раньше детей)
const INSERT_ORDER = ['categories', 'manufacturers', 'products', 'profiles', 'consultations', 'orders', 'order_items', 'completed_orders', 'completed_order_items', 'reviews'];

const isTimestampCol = (c: string) => c.endsWith('_at');

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function toMysqlDatetime(v: string): string | null {
  const m = v.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
  return m ? `${m[1]} ${m[2]}` : null;
}

function formatValue(col: string, val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val) || typeof val === 'object') {
    return `'${esc(JSON.stringify(val))}'`;
  }
  if (typeof val === 'string') {
    if (isTimestampCol(col)) {
      const dt = toMysqlDatetime(val);
      if (dt) return `'${dt}'`;
    }
    return `'${esc(val)}'`;
  }
  return `'${esc(String(val))}'`;
}

let out = DDL + '\n';
const warnings: string[] = [];

for (const table of INSERT_ORDER) {
  const cols = COLUMNS[table];
  let rows: any[] = [];
  try {
    rows = JSON.parse(readFileSync(join(EXPORT_DIR, `${table}.json`), 'utf-8'));
  } catch {
    warnings.push(`нет файла ${table}.json — пропущен`);
    continue;
  }
  if (rows.length === 0) {
    out += `-- ${table}: нет данных\n\n`;
    continue;
  }

  out += `-- ${table}: ${rows.length} строк\n`;
  const values = rows.map((row) => {
    // Предупредим о неизвестных колонках в данных
    for (const k of Object.keys(row)) {
      if (!cols.includes(k)) warnings.push(`${table}: колонка "${k}" есть в данных, но нет в схеме (значение потеряно)`);
    }
    const tuple = cols.map((c) => formatValue(c, row[c])).join(', ');
    return `(${tuple})`;
  });

  out += `INSERT INTO ${table} (${cols.join(', ')}) VALUES\n${values.join(',\n')};\n\n`;
}

out += 'SET FOREIGN_KEY_CHECKS = 1;\n';

// Переписываем ссылки на фото: Supabase Storage -> reg.ru /uploads
const OLD_IMG = 'https://gqnwyyinswqoustiqtpk.supabase.co/storage/v1/object/public/';
const NEW_IMG = 'https://salutgrad.ru/uploads/';
out = out.split(OLD_IMG).join(NEW_IMG);

const file = join(OUT_DIR, 'salyut-mysql.sql');
writeFileSync(file, out, 'utf-8');

console.log(`✅ Дамп готов: ${file}`);
console.log(`   Размер: ${(out.length / 1024).toFixed(1)} КБ`);
if (warnings.length) {
  console.log('\n⚠️  Предупреждения:');
  [...new Set(warnings)].forEach((w) => console.log('   - ' + w));
} else {
  console.log('   Предупреждений нет.');
}
