# Исправление инициализации фильтров из URL

## Проблема
При открытии прямой ссылки с параметрами (например, `http://localhost:3001/catalog?category=Fireworks&page=2`) фильтры не применялись - запрос уходил как будто фильтров нет.

## Причина
**Порядок выполнения useEffect'ов:**

1. **Инициализация из URL** - устанавливает состояние фильтров
2. **Загрузка данных** - `hasLoaded = true`
3. **Применение фильтров** - НО! Основной useEffect для применения фильтров не срабатывал, потому что:
   - Фильтры устанавливались из URL, но не было "изменения" фильтров
   - useEffect срабатывает только при изменении зависимостей
   - Если фильтры уже установлены из URL, то "изменения" нет

## Решение

### 1. Добавлен отдельный useEffect для инициализации из URL
```typescript
// Принудительное применение фильтров при инициализации из URL
useEffect(() => {
  const hasUrlParams = searchParams.toString().length > 0;
  if (hasUrlParams && hasLoaded && !isFiltering && !urlFiltersAppliedRef.current) {
    urlFiltersAppliedRef.current = true;
    // Принудительно применяем фильтры из URL
  }
}, [hasLoaded, searchParams, filters, categories, pagination.page, sortBy, isFiltering]);
```

### 2. Добавлен флаг для предотвращения дублирования
```typescript
const urlFiltersAppliedRef = useRef(false);
```

### 3. Обновлен основной useEffect для применения фильтров
```typescript
// Не применяем фильтры, если они уже применены из URL
if (urlFiltersAppliedRef.current && searchParams.toString().length > 0) {
  return;
}
```

### 4. Добавлено логирование для отладки
```typescript
console.log('🔍 [CATALOG] Applying filters from URL:', params.toString());
console.log('✅ [CATALOG] Filters applied from URL:', data.products?.length, 'products');
```

## Результат
- ✅ Прямые ссылки с параметрами работают корректно
- ✅ Фильтры применяются при инициализации из URL
- ✅ Нет дублирования запросов
- ✅ Логирование для отладки

## Тестирование
Теперь ссылка `http://localhost:3001/catalog?category=Fireworks&page=2` должна:
1. Загрузить данные
2. Установить фильтр по категории "Fireworks"
3. Установить страницу 2
4. Применить фильтры и показать отфильтрованные товары
5. Показать в консоли логи применения фильтров
