// components/FloatingConsultation.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ConsultationDialog } from './consultation-dialog';

export function FloatingConsultation() {
  const [open, setOpen] = useState(false)

  return (
      <>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                  className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-transform flex items-center justify-center p-0"
                  aria-label="Получить консультацию"
                  onClick={() => setOpen(true)}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded shadow-lg">
              <p>Проконсультироваться</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Диалог */}
        <ConsultationDialog open={open} onOpenChange={setOpen} />
      </>
  )
}