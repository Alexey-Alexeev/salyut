// components/FloatingConsultation.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConsultationDialog } from './consultation-dialog';

export function FloatingConsultation() {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Анимация каждые 35 секунд
    const startAnimation = () => {
      setIsAnimating(true);
      // Анимация длится 1.5 секунды
      setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
    };

    // Запускаем первую анимацию через 35 секунд после монтирования
    const initialTimeout = setTimeout(() => {
      startAnimation();
      // Затем повторяем каждые 35 секунд
      intervalRef.current = setInterval(startAnimation, 35000);
    }, 35000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-orange-500 p-0 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-orange-600"
              style={
                isAnimating
                  ? {
                      animation: 'attention-pulse 1.5s ease-in-out',
                      boxShadow: '0 20px 40px -5px rgba(249, 115, 22, 0.5), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
                    }
                  : {}
              }
              aria-label="Получить консультацию"
              onClick={() => setOpen(true)}
            >
              <MessageCircle className="size-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg"
          >
            <p>Проконсультироваться</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Диалог */}
      <ConsultationDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
