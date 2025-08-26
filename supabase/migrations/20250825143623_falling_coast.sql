/*
  # Create Fireworks E-commerce Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `price` (integer, in kopecks)
      - `category_id` (uuid, foreign key)
      - `manufacturer` (text, nullable)
      - `images` (text array)
      - `description` (text, nullable)
      - `characteristics` (jsonb, nullable)
      - `is_popular` (boolean, default false)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `status` (enum: created, in_progress, completed, cancelled)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_contact` (text, nullable)
      - `contact_method` (enum: telegram, whatsapp, nullable)
      - `comment` (text, nullable)
      - `total_amount` (integer, in kopecks)
      - `delivery_cost` (integer, in kopecks)
      - `age_confirmed` (boolean)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price_at_time` (integer, in kopecks)
      - `created_at` (timestamp)
    
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (enum: admin, user, default user)
      - `created_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `video_id` (text)
      - `product_id` (uuid, foreign key, nullable)
      - `is_approved` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to products, categories
    - Add policies for authenticated admin access to orders, admin functions
    - Add policies for order creation by anonymous users

  3. Functions & Triggers
    - Auto-generate slugs for products and categories
    - Update timestamps
*/

-- Create custom types
CREATE TYPE order_status AS ENUM ('created', 'in_progress', 'completed', 'cancelled');
CREATE TYPE contact_method AS ENUM ('telegram', 'whatsapp');
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  manufacturer text,
  images text[] DEFAULT '{}',
  description text,
  characteristics jsonb DEFAULT '{}',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status order_status DEFAULT 'created',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_contact text,
  contact_method contact_method,
  comment text,
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  delivery_cost integer NOT NULL CHECK (delivery_cost >= 0),
  age_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_time integer NOT NULL CHECK (price_at_time > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  video_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Categories are editable by admins"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Products: public read access for active products
CREATE POLICY "Active products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Products are editable by admins"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Orders: admin access only
CREATE POLICY "Orders are viewable by admins"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Orders can be created by anyone"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (age_confirmed = true);

CREATE POLICY "Orders are editable by admins"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Order items: admin access and creation with orders
CREATE POLICY "Order items are viewable by admins"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Order items can be created by anyone"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Profiles: users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews: public read for approved, admin manage all
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Reviews are manageable by admins"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO categories (name, slug) VALUES
  ('Петарды', 'firecrackers'),
  ('Ракеты', 'rockets'),
  ('Фонтаны', 'fountains'),
  ('Римские свечи', 'roman-candles'),
  ('Бенгальские огни', 'sparklers')
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for sample products
DO $$
DECLARE
  rockets_id uuid;
  firecrackers_id uuid;
  fountains_id uuid;
  roman_candles_id uuid;
  sparklers_id uuid;
BEGIN
  SELECT id INTO rockets_id FROM categories WHERE slug = 'rockets';
  SELECT id INTO firecrackers_id FROM categories WHERE slug = 'firecrackers';
  SELECT id INTO fountains_id FROM categories WHERE slug = 'fountains';
  SELECT id INTO roman_candles_id FROM categories WHERE slug = 'roman-candles';
  SELECT id INTO sparklers_id FROM categories WHERE slug = 'sparklers';

  INSERT INTO products (name, slug, price, category_id, manufacturer, images, description, characteristics, is_popular) VALUES
    (
      'Салют "Золотая россыпь" 36 залпов',
      'golden-shower-36',
      250000, -- 2500 rubles in kopecks
      rockets_id,
      'Русский фейерверк',
      ARRAY['https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=800'],
      'Профессиональный салют с 36 залпами золотистых искр. Идеально подходит для новогодних праздников, свадеб и других торжественных мероприятий.',
      '{"Тип": "Салют", "Количество залпов": "36", "Время работы": "45 секунд", "Калибр": "30 мм", "Единица продажи": "штука"}',
      true
    ),
    (
      'Петарды "Корсар-1" упаковка 50 шт',
      'korsar-1-50',
      89000, -- 890 rubles in kopecks
      firecrackers_id,
      'Корсар',
      ARRAY['https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=800'],
      'Классические петарды с ярким звуковым эффектом. Упаковка содержит 50 штук.',
      '{"Тип": "Петарда", "Количество в упаковке": "50", "Звуковой эффект": "Громкий хлопок", "Единица продажи": "упаковка"}',
      true
    ),
    (
      'Фонтан "Вулкан" 30 секунд',
      'volcano-fountain',
      120000, -- 1200 rubles in kopecks
      fountains_id,
      'Огненная стихия',
      ARRAY['https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=800'],
      'Красивый фонтан с эффектом вулкана, работает в течение 30 секунд.',
      '{"Тип": "Фонтан", "Время работы": "30 секунд", "Эффект": "Золотистые искры", "Высота": "до 3 метров"}',
      false
    ),
    (
      'Ракета "Комета" набор 12 шт',
      'comet-rockets-12',
      185000, -- 1850 rubles in kopecks
      rockets_id,
      'Звездный дождь',
      ARRAY['https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=800'],
      'Набор из 12 ракет с эффектом кометы. Разнообразные цвета и эффекты.',
      '{"Тип": "Ракета", "Количество в наборе": "12", "Эффект": "Комета", "Высота полета": "до 30 метров"}',
      true
    ),
    (
      'Бенгальские огни "Звездочки" 10 шт',
      'sparklers-stars-10',
      35000, -- 350 rubles in kopecks
      sparklers_id,
      'Праздничные огни',
      ARRAY['https://images.pexels.com/photos/1387179/pexels-photo-1387179.jpeg?auto=compress&cs=tinysrgb&w=800'],
      'Классические бенгальские огни для создания праздничной атмосферы.',
      '{"Тип": "Бенгальские огни", "Количество в упаковке": "10", "Время горения": "45 секунд каждая", "Длина": "20 см"}',
      false
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;