'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShotsRangeFilterProps {
  shotsFrom: string;
  shotsTo: string;
  minShots: number;
  maxShots: number;
  onShotsChange: (from: string, to: string) => void;
  onShotsFromChange?: (value: string) => void;
  onShotsToChange?: (value: string) => void;
  onMobileFilterClose?: () => void;
}

export const ShotsRangeFilter = React.memo<ShotsRangeFilterProps>(
  ({
    shotsFrom,
    shotsTo,
    minShots,
    maxShots,
    onShotsChange,
    onShotsFromChange,
    onShotsToChange,
    onMobileFilterClose,
  }) => {
    const [fromValue, setFromValue] = useState(shotsFrom);
    const [toValue, setToValue] = useState(shotsTo);
    const [validationError, setValidationError] = useState('');

    // Синхронизация с внешним состоянием
    useEffect(() => {
      setFromValue(shotsFrom);
    }, [shotsFrom]);

    useEffect(() => {
      setToValue(shotsTo);
    }, [shotsTo]);

    // Применение фильтра с текущими значениями
    const applyCurrentFilter = useCallback(() => {
      const from = parseInt(fromValue) || 0;
      const to = parseInt(toValue) || 0;

      // Валидация
      if (fromValue && (from < minShots || from > maxShots)) {
        setValidationError(`Значение должно быть от ${minShots} до ${maxShots}`);
        return;
      }

      if (toValue && (to < minShots || to > maxShots)) {
        setValidationError(`Значение должно быть от ${minShots} до ${maxShots}`);
        return;
      }

      if (fromValue && toValue && from > to) {
        setValidationError('Минимальное значение не может быть больше максимального');
        return;
      }

      setValidationError('');
      onShotsChange(fromValue, toValue);
      
      if (onMobileFilterClose) {
        onMobileFilterClose();
      }
    }, [fromValue, toValue, minShots, maxShots, onShotsChange, onMobileFilterClose]);

    const handleFromChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Только цифры
        setFromValue(value);
        setValidationError('');
        
        if (onShotsFromChange) {
          onShotsFromChange(value);
        }
      },
      [onShotsFromChange]
    );

    const handleToChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Только цифры
        setToValue(value);
        setValidationError('');
        
        if (onShotsToChange) {
          onShotsToChange(value);
        }
      },
      [onShotsToChange]
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
        <h3 className="text-sm font-semibold">Количество залпов</h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label
              htmlFor="shots-from"
              className="text-muted-foreground text-xs"
            >
              От
            </Label>
            <Input
              id="shots-from"
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
            <Label htmlFor="shots-to" className="text-muted-foreground text-xs">
              До
            </Label>
            <Input
              id="shots-to"
              type="text"
              inputMode="numeric"
              placeholder={maxShots.toString()}
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
              {fromValue || minShots} —{' '}
              {toValue || maxShots} залпов
            </>
          ) : (
            <>
              {minShots} — {maxShots} залпов
            </>
          )}
        </div>

        {validationError && (
          <div className="rounded border bg-red-50 p-2 text-xs text-red-500">
            {validationError}
          </div>
        )}
      </div>
    );
  }
);

ShotsRangeFilter.displayName = 'ShotsRangeFilter';

