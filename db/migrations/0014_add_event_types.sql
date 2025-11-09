-- Добавляем поле для подборок салютов по событиям
ALTER TABLE "products" ADD COLUMN "event_types" jsonb DEFAULT '[]'::jsonb;

-- Комментарий к полю:
-- event_types: массив типов событий, для которых подходит этот салют
-- Возможные значения: 'wedding' (Свадьба), 'birthday' (День Рождения), 'new_year' (Новый Год)
-- Пример: ['wedding', 'birthday'] - салют подходит для свадьбы и дня рождения
-- NULL или пустой массив означает, что салют не привязан к конкретным событиям

-- Создаем индекс для быстрого поиска салютов по типу события
CREATE INDEX IF NOT EXISTS "idx_products_event_types" ON "products" USING gin ("event_types");


