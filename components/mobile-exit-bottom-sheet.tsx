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

  // Актуальная проверка условий показа (пересчитывается при смене пути)
  const isEligible = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const path = pathname || window.location.pathname;
    if (path.startsWith('/admin')) return false;
    if (path.startsWith('/cart')) return false;
    if (path.includes('checkout')) return false;
    if (path.includes('thank') || path.includes('success')) return false;

    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarse) return false;

    const shown = sessionStorage.getItem('mobileExitSheetShown') === '1';
    if (shown) return false;

    return true;
  }, [pathname]);

  const triggerOnce = useCallback(() => {
    if (!isEligible || open) return;
    sessionStorage.setItem('mobileExitSheetShown', '1');
    setOpen(true);
  }, [isEligible, open]);

  // Триггер: время на сайте > 40с
  useEffect(() => {
    if (!isEligible || open) return;
    const timer = window.setTimeout(() => triggerOnce(), 40_000);
    return () => window.clearTimeout(timer);
  }, [isEligible, triggerOnce, open]);

  // Триггер: бездействие > 25с
  useEffect(() => {
    if (!isEligible || open) return;
    let inactivityTimer: number | undefined;
    const restart = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => triggerOnce(), 25_000);
    };

    const resetters = ['scroll', 'touchstart', 'touchmove', 'click', 'keydown', 'mousemove'] as const;
    resetters.forEach((evt) => document.addEventListener(evt, restart, { passive: true }));
    restart();

    return () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      resetters.forEach((evt) => document.removeEventListener(evt, restart as EventListener));
    };
  }, [isEligible, triggerOnce, open]);

  // Триггер: прокрутил вниз >400px, затем резкий скролл вверх >100px
  const lastYRef = useRef<number>(0);
  const maxScrolledRef = useRef<number>(0);
  const recentlyScrolledDownRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isEligible || open) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > maxScrolledRef.current) maxScrolledRef.current = y;

      // Отметили, что пользователь был ниже порога
      if (maxScrolledRef.current > 400) recentlyScrolledDownRef.current = true;

      const delta = lastYRef.current - y; // положительное — скролл вверх
      if (recentlyScrolledDownRef.current && delta > 100) {
        triggerOnce();
        window.removeEventListener('scroll', onScroll);
      }
      lastYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEligible, triggerOnce, open]);

  if (!isEligible) return null;

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


