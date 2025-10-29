'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConsultationDialog } from '@/components/consultation-dialog';

/**
 * ExitIntentConsultation
 * Показывает диалог консультации при попытке ухода со страницы (курсор уходит за верх экрана).
 * Показ — не чаще 1 раза за сессию, только для десктопов, исключая админ-разделы.
 */
export function ExitIntentConsultation() {
  const [open, setOpen] = useState(false);

  const isEligible = useMemo(() => {
    if (typeof window === 'undefined') return false;

    // Не показываем в админке
    if (window.location.pathname.startsWith('/admin')) return false;

    // Только для десктопов (устройства с точным указателем)
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return false;

    // Не больше одного раза за сессию
    const shown = sessionStorage.getItem('exitConsultationShown') === '1';
    if (shown) return false;

    return true;
  }, []);

  const triggerOnce = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('exitConsultationShown', '1');
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!isEligible) return;

    const onMouseOut = (e: MouseEvent) => {
      // Если курсор ушёл за верхнюю границу окна — считаем как exit intent
      const related = (e as any).relatedTarget as Node | null;
      if (!related && e.clientY <= 0) {
        triggerOnce();
        document.removeEventListener('mouseout', onMouseOut);
      }
    };

    document.addEventListener('mouseout', onMouseOut);
    return () => document.removeEventListener('mouseout', onMouseOut);
  }, [isEligible, triggerOnce]);

  return (
    <ConsultationDialog
      open={open}
      onOpenChange={setOpen}
      title="Подберем товар для Вас - консультация бесплатна"
      centerTitle
      introContent={
        <div className="space-y-2 text-center">
          <p className="font-semibold">Не нашли что искали?</p>
          <p className="text-[13px] sm:text-sm">Оставьте свои контакты — мы подберём лучший вариант под ваш бюджет.</p>
        </div>
      }
    />
  );
}


