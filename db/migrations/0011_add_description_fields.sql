-- Добавляем новые поля для структурированного описания
ALTER TABLE "products" ADD COLUMN "description_structured" jsonb;
ALTER TABLE "products" ADD COLUMN "features" jsonb;
ALTER TABLE "products" ADD COLUMN "highlights" text[];

-- Комментарии к полям:
-- description_structured: JSON с структурированным описанием
-- features: JSON с характеристиками эффектов
-- highlights: массив строк с ключевыми особенностями
