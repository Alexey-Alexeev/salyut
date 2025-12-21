'use client';

import { useState, useCallback } from 'react';
import { DeliverySelection } from '@/components/delivery-selection';
import { type DeliveryCalculationResult } from '@/lib/delivery-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export function DeliveryCalculationSection() {
  const [deliveryResult, setDeliveryResult] = useState<DeliveryCalculationResult | null>(null);

  const handleDeliveryChange = useCallback((result: DeliveryCalculationResult) => {
    setDeliveryResult(result);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="rounded-lg bg-orange-100 p-2">
              <Calculator className="size-5 text-orange-600" aria-hidden="true" />
            </div>
            <span>Расчёт стоимости доставки</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Введите адрес доставки, чтобы узнать точную стоимость доставки до вашего адреса
          </p>
        </CardHeader>
        <CardContent>
          <DeliverySelection
            onDeliveryChange={handleDeliveryChange}
            selectedMethod="delivery"
            initialAddress=""
            className="border-0 shadow-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}

