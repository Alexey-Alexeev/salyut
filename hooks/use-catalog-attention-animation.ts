'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface UseCatalogAttentionAnimationProps {
  products: Array<{ id: string }>;
  delay?: number; // Интервал повторения в миллисекундах (по умолчанию 20 секунд)
  animationDuration?: number; // Длительность анимации в миллисекундах (по умолчанию 4 секунды)
}

/**
 * Хук для управления анимацией привлечения внимания на карточках товаров
 * Периодически выбирает случайную видимую карточку и активирует анимацию
 * Анимация запускается только когда страница видима пользователю
 * Учитывает системные настройки prefers-reduced-motion для доступности
 */
export function useCatalogAttentionAnimation({
  products,
  delay = 20000, // 20 секунд по умолчанию
  animationDuration = 4000, // 4 секунды по умолчанию
}: UseCatalogAttentionAnimationProps) {
  const [animatedProductId, setAnimatedProductId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const visibleCardsRef = useRef<Set<string>>(new Set());
  const observedCardsRef = useRef<Set<Element>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const setupObserverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firstAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimationActiveRef = useRef(false);
  const lastAnimatedProductIdRef = useRef<string | null>(null);
  const animationDurationRef = useRef(animationDuration);
  const isPageVisibleRef = useRef(true);
  const pageLoadTimeRef = useRef<number | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkCardsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotionRef = useRef(false);

  // Проверка prefers-reduced-motion для accessibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      // Если пользователь включил режим уменьшенного движения, останавливаем анимацию
      if (e.matches) {
        setAnimatedProductId(null);
        if (hideAnimationTimeoutRef.current) {
          clearTimeout(hideAnimationTimeoutRef.current);
          hideAnimationTimeoutRef.current = null;
        }
        isAnimationActiveRef.current = false;
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Проверка видимости страницы
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      
      // Если страница стала невидимой, останавливаем анимацию
      if (document.hidden) {
        setAnimatedProductId(null);
        if (hideAnimationTimeoutRef.current) {
          clearTimeout(hideAnimationTimeoutRef.current);
          hideAnimationTimeoutRef.current = null;
        }
        isAnimationActiveRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    isPageVisibleRef.current = !document.hidden;

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Стабильная функция для подключения новых карточек к observer через ref
  const observeNewCardsRef = useRef<(() => void) | null>(null);
  observeNewCardsRef.current = () => {
    if (!observerRef.current) return;

    const cardElements = document.querySelectorAll('[data-product-id]');
    cardElements.forEach((card) => {
      // Проверяем, не наблюдаем ли мы уже эту карточку
      if (!observedCardsRef.current.has(card)) {
        observerRef.current?.observe(card);
        observedCardsRef.current.add(card);
      }
    });
  };

  // Стабильная функция для показа анимации через ref
  const showAnimationRef = useRef<(() => void) | null>(null);
  showAnimationRef.current = () => {
    // Не показываем анимацию, если пользователь предпочитает уменьшенное движение
    if (prefersReducedMotionRef.current) {
      return;
    }

    // Не показываем анимацию, если страница не видна
    if (!isPageVisibleRef.current) {
      return;
    }

    // Если анимация уже активна, пропускаем этот цикл
    if (isAnimationActiveRef.current) {
      return;
    }

    // Получаем массив видимых карточек
    const visibleProductIds = Array.from(visibleCardsRef.current);

    // Если нет видимых карточек, не показываем анимацию
    if (visibleProductIds.length === 0) {
      return;
    }

    // Фильтруем карточки, исключая ту, на которой только что была анимация
    // (чтобы не показывать на той же карточке подряд)
    const availableProductIds = visibleProductIds.filter(
      (id) => id !== lastAnimatedProductIdRef.current
    );

    // Если после фильтрации осталась только одна карточка (или та же), 
    // но есть другие видимые карточки, используем все видимые
    // Если видна только одна карточка, все равно показываем на ней (лучше чем ничего)
    const productIdsToChooseFrom = availableProductIds.length > 0 
      ? availableProductIds 
      : visibleProductIds;

    // Выбираем случайную карточку
    const randomIndex = Math.floor(Math.random() * productIdsToChooseFrom.length);
    const selectedProductId = productIdsToChooseFrom[randomIndex];

    // КРИТИЧЕСКАЯ ПРОВЕРКА: Проверяем, что элемент существует в DOM перед показом анимации
    // Это предотвращает race condition при быстрой смене товаров
    const element = document.querySelector(`[data-product-id="${selectedProductId}"]`);
    if (!element) {
      // Элемент не найден, пропускаем эту итерацию
      return;
    }

    // Устанавливаем флаг активности анимации
    isAnimationActiveRef.current = true;
    lastAnimatedProductIdRef.current = selectedProductId;
    setAnimatedProductId(selectedProductId);

    // Очищаем предыдущий таймаут скрытия, если он есть
    if (hideAnimationTimeoutRef.current) {
      clearTimeout(hideAnimationTimeoutRef.current);
    }

    // Автоматически скрываем анимацию через указанное время
    hideAnimationTimeoutRef.current = setTimeout(() => {
      setAnimatedProductId(null);
      // Сбрасываем флаг активности сразу после скрытия
      isAnimationActiveRef.current = false;
    }, animationDurationRef.current);
  };

  // Обновляем ref при изменении animationDuration
  useEffect(() => {
    animationDurationRef.current = animationDuration;
  }, [animationDuration]);

  useEffect(() => {
    // Сбрасываем состояние при изменении списка товаров
    setAnimatedProductId(null);
    visibleCardsRef.current.clear();
    observedCardsRef.current.clear();
    isAnimationActiveRef.current = false;
    lastAnimatedProductIdRef.current = null;

    // Сбрасываем время загрузки при изменении товаров (новая "загрузка" для анимации)
    pageLoadTimeRef.current = Date.now();

    // Очищаем предыдущие таймауты и наблюдатели
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (setupObserverTimeoutRef.current) {
      clearTimeout(setupObserverTimeoutRef.current);
      setupObserverTimeoutRef.current = null;
    }

    if (hideAnimationTimeoutRef.current) {
      clearTimeout(hideAnimationTimeoutRef.current);
      hideAnimationTimeoutRef.current = null;
    }

    if (firstAnimationTimeoutRef.current) {
      clearTimeout(firstAnimationTimeoutRef.current);
      firstAnimationTimeoutRef.current = null;
    }

    if (checkCardsTimeoutRef.current) {
      clearTimeout(checkCardsTimeoutRef.current);
      checkCardsTimeoutRef.current = null;
    }

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }

    // Если товаров нет, не делаем ничего
    if (products.length === 0) {
      return;
    }

    // Проверяем доступность IntersectionObserver API
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver не поддерживается в этом браузере');
      return;
    }

    // Создаем Intersection Observer для отслеживания видимых карточек
    // Используем debounce для обновления видимых карточек при быстрой прокрутке
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Debounce обновления видимых карточек
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        updateTimeoutRef.current = setTimeout(() => {
          entries.forEach((entry) => {
            const productId = entry.target.getAttribute('data-product-id');
            if (!productId) return;

            if (entry.isIntersecting) {
              visibleCardsRef.current.add(productId);
            } else {
              visibleCardsRef.current.delete(productId);
            }
          });
          updateTimeoutRef.current = null;
        }, 100); // Небольшая задержка для debounce
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3, // Карточка считается видимой, если 30% её в viewport
      }
    );

    // Создаем MutationObserver для отслеживания динамически добавляемых карточек
    if (typeof MutationObserver !== 'undefined') {
      mutationObserverRef.current = new MutationObserver(() => {
        // Debounce проверки новых карточек
        if (checkCardsTimeoutRef.current) {
          clearTimeout(checkCardsTimeoutRef.current);
        }
        
        checkCardsTimeoutRef.current = setTimeout(() => {
          observeNewCardsRef.current?.();
          checkCardsTimeoutRef.current = null;
        }, 200);
      });

      // Наблюдаем за изменениями в DOM (добавление новых карточек)
      const container = document.querySelector('[data-products-container]') || document.body;
      mutationObserverRef.current.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    // Функция для настройки observer и запуска анимаций
    const setupObserver = () => {
      if (!observerRef.current) return;

      // Наблюдаем за всеми существующими карточками товаров
      observeNewCardsRef.current?.();

      // Вычисляем задержку для первой анимации
      // Анимация должна запуститься ровно через delay (20 секунд) после изменения товаров
      const timeSinceLoad = pageLoadTimeRef.current 
        ? Date.now() - pageLoadTimeRef.current 
        : 0;
      
      // Если прошло меньше delay, ждем оставшееся время
      // Если прошло больше delay, запускаем сразу (но не чаще чем раз в delay)
      const firstAnimationDelay = Math.max(0, delay - timeSinceLoad);

      // Показываем первую анимацию через оставшееся время до delay
      firstAnimationTimeoutRef.current = setTimeout(() => {
        showAnimationRef.current?.();
      }, firstAnimationDelay);

      // Затем повторяем каждые delay миллисекунд
      // Интервал равен delay, так как анимация скрывается автоматически через animationDuration
      intervalRef.current = setInterval(() => {
        showAnimationRef.current?.();
      }, delay);
    };

    // Ждем следующего тика, чтобы карточки успели отрендериться
    // Используем requestAnimationFrame для более надежного определения готовности DOM
    setupObserverTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        setupObserver();
      });
    }, 100); // Небольшая задержка для рендеринга карточек

    // Очистка при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (setupObserverTimeoutRef.current) {
        clearTimeout(setupObserverTimeoutRef.current);
      }
      if (hideAnimationTimeoutRef.current) {
        clearTimeout(hideAnimationTimeoutRef.current);
      }
      if (firstAnimationTimeoutRef.current) {
        clearTimeout(firstAnimationTimeoutRef.current);
      }
      if (checkCardsTimeoutRef.current) {
        clearTimeout(checkCardsTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
    // Убраны showAnimation и observeNewCards из зависимостей для стабильности
    // Используем refs для доступа к актуальным функциям
  }, [products, delay, animationDuration]);

  return animatedProductId;
}

