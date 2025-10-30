// components/mobile-exit-bottom-sheet.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

/**
 * MobileExitBottomSheet
 * Мягкий bottom-sheet для мобильных с триггерами: время на сайте, бездействие, жест возврата вверх.
 * Показывается не чаще 1 раза за сессию. Исключает админ, корзину/оформление и потенциальную страницу «спасибо».
 */
export default function MobileExitBottomSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hasTriggeredRef = useRef(false);

  // Проверка, показывали ли уже в этой сессии
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const shown = sessionStorage.getItem('mobileExitSheetShown') === '1';
        if (shown) {
          hasTriggeredRef.current = true;
        }
      } catch {}
    }
  }, []);

  // Проверка условий для активации триггеров
  const canTrigger = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (hasTriggeredRef.current) return false;

    const path = pathname || window.location.pathname;
    if (path.startsWith('/admin')) return false;
    if (path.startsWith('/cart')) return false;
    if (path.includes('checkout')) return false;
    if (path.includes('thank') || path.includes('success')) return false;

    // Проверка на мобильное устройство
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    return isCoarse;
  }, [pathname]);

  const triggerSheet = useCallback(() => {
    if (hasTriggeredRef.current || open) return;
    
    hasTriggeredRef.current = true;
    try {
      sessionStorage.setItem('mobileExitSheetShown', '1');
    } catch {}
    setOpen(true);
  }, [open]);

  // Триггер: время на сайте > 40с
  useEffect(() => {
    if (!canTrigger) return;
    const timer = window.setTimeout(() => triggerSheet(), 40_000);
    return () => window.clearTimeout(timer);
  }, [canTrigger, triggerSheet]);

  // Триггер: бездействие > 25с
  useEffect(() => {
    if (!canTrigger) return;
    let inactivityTimer: number | undefined;
    
    const restart = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => triggerSheet(), 25_000);
    };

    const resetters = ['scroll', 'touchstart', 'touchmove', 'click', 'keydown', 'mousemove'] as const;
    resetters.forEach((evt) => document.addEventListener(evt, restart, { passive: true }));
    restart();

    return () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      resetters.forEach((evt) => document.removeEventListener(evt, restart as EventListener));
    };
  }, [canTrigger, triggerSheet]);

  // Триггер: прокрутил вниз >400px, затем резкий скролл вверх >100px
  const lastYRef = useRef<number>(0);
  const maxScrolledRef = useRef<number>(0);

  useEffect(() => {
    if (!canTrigger) return;
    
    const onScroll = () => {
      const y = window.scrollY;
      if (y > maxScrolledRef.current) {
        maxScrolledRef.current = y;
      }

      const delta = lastYRef.current - y; // положительное — скролл вверх
      
      // Если проскроллили вниз больше 400px и резко вверх больше 100px
      if (maxScrolledRef.current > 400 && delta > 100) {
        triggerSheet();
      }
      
      lastYRef.current = y;
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [canTrigger, triggerSheet]);

  // Рендерим Sheet независимо от canTrigger, чтобы он мог показаться после срабатывания триггера
  if (typeof window === 'undefined') return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="h-[40vh] rounded-t-3xl px-4 pb-6 pt-3 sm:max-w-none"
      >
        {/* Серый верхний хэндл */}
        <div className="mx-auto mb-4 mt-1 h-1.5 w-16 rounded-full bg-gray-200" />

        <div className="mx-auto max-w-md text-center">
          <SheetTitle className="text-xl font-bold">🎇 Не нашли нужный товар?</SheetTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Наш менеджер подберёт лучший вариант под ваш бюджет.
          </p>

          {/* Разделитель и подсказка */}
          <div className="mt-5 mb-2 flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="mx-3 text-xs text-muted-foreground">
              Свяжитесь с нами напрямую (это бесплатно)
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {/* Звонок */}
            <a
              href="tel:+79773602008"
              className="flex h-12 items-center justify-center rounded-lg border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              aria-label="Позвонить"
            >
              <Phone className="mr-2 h-4 w-4" />
              Звонок
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/79773602008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-lg border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              aria-label="Написать в WhatsApp"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+79773602008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-lg border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              aria-label="Написать в Telegram"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Telegram
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


