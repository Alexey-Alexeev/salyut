// components/FloatingConsultation.tsx
'use client';

import { useState } from 'react';
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

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-orange-500 p-0 shadow-lg transition-transform hover:scale-105 hover:bg-orange-600"
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
