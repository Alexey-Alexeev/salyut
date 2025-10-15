-- Добавление индексов для оптимизации производительности каталога
-- Эти индексы значительно ускорят запросы к таблице products

-- Индекс для фильтрации по активным товарам (основной фильтр)
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Индекс для поиска по названию товара (ILIKE запросы)
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('russian', name));

-- Индекс для сортировки по популярности
CREATE INDEX IF NOT EXISTS idx_products_is_popular ON products(is_popular DESC);

-- Индекс для сортировки по цене
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Индекс для фильтрации по категории
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Композитный индекс для основных запросов каталога
-- (активные товары + категория + популярность)
CREATE INDEX IF NOT EXISTS idx_products_catalog_main 
ON products(is_active, category_id, is_popular DESC, price);

-- Индекс для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Индекс для поиска по slug (для быстрого доступа к товарам)
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Индекс для категорий (для быстрой загрузки фильтров)
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Индекс для производителей
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_id ON products(manufacturer_id);
