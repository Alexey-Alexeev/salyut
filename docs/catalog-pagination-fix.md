# Исправление проблемы с пагинацией в каталоге

## Проблема
При переходе со страницы 1 на страницу 2 происходил автоматический редирект обратно на страницу 1.

## Причина
Циклическая зависимость в React хуках:

1. При изменении страницы обновлялся URL → `searchParams` менялся
2. `updateURL` функция зависела от `searchParams` → пересоздавалась
3. useEffect для сортировки зависел от `updateURL` → запускался заново
4. Эффект сортировки сбрасывал страницу на 1 → цикл замыкался

## Решение

### 1. Устранение зависимости от `searchParams` в `updateURL`
```typescript
// БЫЛО:
const updateURL = useCallback((params) => {
  const newParams = new URLSearchParams(searchParams.toString());
  // ...
}, [searchParams, pathname, router]);

// СТАЛО:
const updateURL = useCallback((params) => {
  const currentParams = new URLSearchParams(window.location.search);
  // ...
}, [pathname, router]);
```

Теперь `updateURL` получает текущие параметры напрямую из `window.location.search`, а не из хука `searchParams`, что делает функцию стабильной.

### 2. Добавление проверки изменения сортировки
```typescript
const prevSortByRef = useRef(sortBy);

useEffect(() => {
  // Проверяем, действительно ли изменилась сортировка
  if (hasLoaded && prevSortByRef.current !== sortBy) {
    prevSortByRef.current = sortBy;
    // Обновляем URL только если сортировка реально изменилась
  }
}, [sortBy, hasLoaded, updateURL]);
```

Это предотвращает повторное выполнение эффекта при пересоздании `updateURL`.

### 3. Инициализация из URL только один раз
```typescript
const isInitializedRef = useRef(false);

useEffect(() => {
  if (!isInitializedRef.current) {
    isInitializedRef.current = true;
    // Инициализация фильтров из URL только при первом монтировании
  }
}, [searchParams]);
```

Это гарантирует, что инициализация из URL происходит только один раз при загрузке страницы.

## Результат
- ✅ Пагинация работает корректно
- ✅ URL обновляется при изменении фильтров
- ✅ Нет циклических обновлений
- ✅ История браузера работает правильно
- ✅ Прямые ссылки с параметрами работают

