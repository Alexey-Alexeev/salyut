'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceRangeFilterProps {
  priceFrom: string;
  priceTo: string;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (from: string, to: string) => void;
  onPriceFromChange?: (value: string) => void;
  onPriceToChange?: (value: string) => void;
  onApplyFilter?: () => void;
  onMobileFilterClose?: () => void;
}

export const PriceRangeFilter = React.memo<PriceRangeFilterProps>(
  ({
    priceFrom,
    priceTo,
    minPrice,
    maxPrice,
    onPriceChange,
    onPriceFromChange,
    onPriceToChange,
    onApplyFilter,
    onMobileFilterClose,
  }) => {
    const [fromValue, setFromValue] = useState(priceFrom);
    const [toValue, setToValue] = useState(priceTo);
    const [validationError, setValidationError] = useState('');

    // Синхронизация с внешним состоянием
    useEffect(() => {
      setFromValue(priceFrom);
    }, [priceFrom]);

    useEffect(() => {
      setToValue(priceTo);
    }, [priceTo]);

    const formatPrice = useCallback((num: number) => {
      return new Intl.NumberFormat('ru-RU').format(num);
    }, []);

    // Применение фильтра с текущими значениями
    const applyCurrentFilter = useCallback(() => {
      const fromNum = parseInt(fromValue) || 0;
      const toNum = parseInt(toValue) || maxPrice;

      // Проверка валидности диапазона
      if (fromValue && toValue && fromNum > toNum) {
        setValidationError('Значение "От" не может быть больше значения "До"');
        return;
      }

      setValidationError('');
      onPriceChange(fromValue, toValue);
      if (onApplyFilter) {
        onApplyFilter();
      }
      // Закрываем мобильный фильтр при применении
      if (onMobileFilterClose) {
        onMobileFilterClose();
      }
    }, [
      fromValue,
      toValue,
      maxPrice,
      onPriceChange,
      onApplyFilter,
      onMobileFilterClose,
    ]);

    // Обработчики ввода с автоматическим применением фильтра
    const handleFromChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFromValue(value);
        setValidationError('');

        // Автоматически применяем фильтр, если есть функция
        if (onPriceFromChange) {
          onPriceFromChange(value);
        }
      },
      [onPriceFromChange]
    );

    const handleToChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setToValue(value);
        setValidationError('');

        // Автоматически применяем фильтр, если есть функция
        if (onPriceToChange) {
          onPriceToChange(value);
        }
      },
      [onPriceToChange]
    );

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          applyCurrentFilter();
        }
      },
      [applyCurrentFilter]
    );

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Цена, ₽</h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label
              htmlFor="price-from"
              className="text-muted-foreground text-xs"
            >
              От
            </Label>
            <Input
              id="price-from"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={fromValue}
              onChange={handleFromChange}
              onKeyPress={handleKeyPress}
              className="h-9 text-sm ym-record-keys"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="price-to" className="text-muted-foreground text-xs">
              До
            </Label>
            <Input
              id="price-to"
              type="text"
              inputMode="numeric"
              placeholder={formatPrice(maxPrice)}
              value={toValue}
              onChange={handleToChange}
              onKeyPress={handleKeyPress}
              className="h-9 text-sm ym-record-keys"
            />
          </div>
        </div>

        <div className="text-muted-foreground text-xs">
          {fromValue || toValue ? (
            <>
              {fromValue || minPrice} ₽ —{' '}
              {toValue
                ? formatPrice(parseInt(toValue) || maxPrice)
                : formatPrice(maxPrice)}{' '}
              ₽
            </>
          ) : (
            <>
              {minPrice} ₽ — {formatPrice(maxPrice)} ₽
            </>
          )}
        </div>

        {validationError && (
          <div className="rounded border bg-red-50 p-2 text-xs text-red-500">
            {validationError}
          </div>
        )}

        <Button
          onClick={applyCurrentFilter}
          className="h-8 w-full text-xs"
          size="sm"
        >
          Применить фильтр
        </Button>
      </div>
    );
  }
);

PriceRangeFilter.displayName = 'PriceRangeFilter';
