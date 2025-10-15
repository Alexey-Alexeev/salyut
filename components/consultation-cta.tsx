'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConsultationDialog } from '@/components/consultation-dialog';

export function ConsultationCTA({ className = '' }: { className?: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <section
        id="consultation"
        className={`container mx-auto px-4 ${className}`}
      >
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="space-y-6 p-6 text-center md:p-12">
            <h2 className="text-2xl font-bold md:text-4xl">
              Нужна помощь в выборе?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-white/90 md:text-lg">
              Наши эксперты помогут подобрать идеальные фейерверки для вашего
              мероприятия
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="w-auto whitespace-nowrap px-6"
                onClick={() => setIsDialogOpen(true)}
              >
                Получить бесплатную консультацию
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <ConsultationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
