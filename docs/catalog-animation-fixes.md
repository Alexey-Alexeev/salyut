# Исправления критических проблем в анимации каталога

## Дата: 9 декабря 2025

## Проблемы и решения

### ✅ 1. Добавлена поддержка `prefers-reduced-motion`

**Проблема:** Анимация игнорировала системные настройки пользователя о предпочтении уменьшенного движения, что создавало проблемы с доступностью.

**Решение:**
- Добавлен `prefersReducedMotionRef` для отслеживания системных настроек
- Добавлен отдельный `useEffect` для проверки медиа-запроса `prefers-reduced-motion: reduce`
- Анимация автоматически останавливается, если пользователь включает режим уменьшенного движения
- Проверка происходит в функции `showAnimation` перед каждым показом анимации

**Код:**
```typescript
// Проверка в начале хука
const prefersReducedMotionRef = useRef(false);

// useEffect для отслеживания изменений
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotionRef.current = mediaQuery.matches;
  
  const handleChange = (e: MediaQueryListEvent) => {
    prefersReducedMotionRef.current = e.matches;
    if (e.matches) {
      setAnimatedProductId(null);
      // ... очистка таймаутов
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);

// Проверка перед показом анимации
if (prefersReducedMotionRef.current) {
  return;
}
```

---

### ✅ 2. Исправлены нестабильные зависимости в `useEffect`

**Проблема:** Функции `showAnimation` и `observeNewCards` находились в массиве зависимостей основного `useEffect`, что могло вызывать лишние пересоздания эффекта и нестабильное поведение.

**Решение:**
- Преобразованы функции из `useCallback` в refs: `showAnimationRef` и `observeNewCardsRef`
- Удалены функции из массива зависимостей `useEffect`
- Теперь зависимости стабильны: `[products, delay, animationDuration]`
- Функции всегда имеют доступ к актуальным значениям через refs

**Было:**
```typescript
const showAnimation = useCallback(() => { /* ... */ }, []);
const observeNewCards = useCallback(() => { /* ... */ }, []);

useEffect(() => {
  // ...
}, [products, delay, animationDuration, showAnimation, observeNewCards]);
```

**Стало:**
```typescript
const showAnimationRef = useRef<(() => void) | null>(null);
showAnimationRef.current = () => { /* ... */ };

const observeNewCardsRef = useRef<(() => void) | null>(null);
observeNewCardsRef.current = () => { /* ... */ };

useEffect(() => {
  // Вызовы через refs
  showAnimationRef.current?.();
  observeNewCardsRef.current?.();
  // ...
}, [products, delay, animationDuration]);
```

---

### ✅ 3. Добавлена проверка существования DOM элемента

**Проблема:** При быстрой смене товаров (фильтрация, сортировка) анимация могла пытаться показаться на элементе, которого уже нет в DOM, вызывая race condition.

**Решение:**
- Добавлена критическая проверка существования элемента в DOM перед показом анимации
- Используется `document.querySelector` для проверки наличия элемента с `data-product-id`
- Если элемент не найден, анимация пропускается для этой итерации

**Код:**
```typescript
// КРИТИЧЕСКАЯ ПРОВЕРКА: Проверяем, что элемент существует в DOM
const element = document.querySelector(`[data-product-id="${selectedProductId}"]`);
if (!element) {
  // Элемент не найден, пропускаем эту итерацию
  return;
}

// Только после проверки показываем анимацию
setAnimatedProductId(selectedProductId);
```

---

## Результаты

### Улучшения доступности
- ✅ Поддержка пользователей с проблемами вестибулярного аппарата
- ✅ Соответствие WCAG 2.1 рекомендациям по анимациям

### Улучшения стабильности
- ✅ Устранены лишние перерендеры компонента
- ✅ Предотвращены race conditions при быстрых изменениях каталога
- ✅ Более предсказуемое поведение хука

### Производительность
- ✅ Уменьшено количество пересозданий эффектов
- ✅ Отсутствие попыток анимации несуществующих элементов

---

## Тестирование

### Ручное тестирование

1. **Проверка prefers-reduced-motion:**
   ```
   1. Открыть настройки системы
   2. Включить "Уменьшить движение" / "Reduce motion"
   3. Перейти на страницу каталога
   4. Ожидаемый результат: анимация не появляется
   ```

2. **Проверка race condition:**
   ```
   1. Открыть каталог
   2. Быстро переключать фильтры (категории, цены, поиск)
   3. Ожидаемый результат: нет ошибок в консоли, анимация работает корректно
   ```

3. **Проверка стабильности:**
   ```
   1. Открыть React DevTools
   2. Наблюдать за компонентом с хуком
   3. Ожидаемый результат: нет лишних перерендеров при работе анимации
   ```

### Браузерная консоль

Для проверки настроек в консоли браузера:
```javascript
// Проверка текущего состояния prefers-reduced-motion
window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Проверка наличия карточки в DOM
document.querySelector('[data-product-id="some-id"]')
```

---

## Файлы изменены

- `hooks/use-catalog-attention-animation.ts` - основной файл с исправлениями

## Совместимость

Все исправления обратно совместимы и не требуют изменений в использующих компонентах:
- `components/catalog/products-grid.tsx` - без изменений
- `components/product-card.tsx` - без изменений

---

## Дополнительные рекомендации (опционально)

### Средний приоритет:
1. Уменьшить debounce с 100ms до 50ms для более отзывчивой прокрутки
2. Добавить фильтрацию в MutationObserver (только элементы с `data-product-id`)
3. Увеличить z-index анимации с 50 до 999 для избежания конфликтов

### Низкий приоритет:
4. Оптимизация IntersectionObserver для большого количества карточек (100+)
5. Добавить проверку видимости карточки в viewport перед показом анимации



