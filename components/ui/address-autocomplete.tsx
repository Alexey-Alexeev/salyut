'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Типы для Yandex Suggest API
interface YandexSuggestion {
  displayName: string;
  value: string;
  hl?: Array<[number, number]>;
}

interface YandexSuggestResponse {
  suggest_reqid: string;
  results: YandexSuggestion[];
}

// Объявляем глобальный объект для Yandex Suggest
declare global {
  interface Window {
    ymaps: any;
  }
}

export interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Введите адрес...',
  className,
  id,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<YandexSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Yandex Suggest API больше не доступен, используем Geocoder API
  useEffect(() => {
    // Yandex Geocoder API for suggestions
  }, []);

  // Функция получения подсказок (приоритет: DaData → Yandex → fallback)
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // Отменяем предыдущий незавершённый запрос (debounce/гонки)
      const prev = (getSuggestions as any)._ctrl as AbortController | undefined;
      if (prev) prev.abort();
      const ctrl = new AbortController();
      (getSuggestions as any)._ctrl = ctrl;

      const dadataToken = process.env.NEXT_PUBLIC_DADATA_TOKEN;
      if (dadataToken) {
        // DaData Suggest API (приоритетный провайдер)
        const dadataResp = await fetch(
          'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Token ${dadataToken}`,
            },
            body: JSON.stringify({
              query,
              count: 7,
              // ограничиваемся Москвой и МО для релевантности
              locations: [
                { region: 'Москва' },
                { region: 'Московская' },
              ],
            }),
            signal: ctrl.signal,
          }
        );

        if (dadataResp.ok) {
          const dadata = await dadataResp.json();
          const list: YandexSuggestion[] = (dadata.suggestions || []).map(
            (s: any) => ({
              displayName: s.unrestricted_value || s.value,
              value: s.unrestricted_value || s.value,
            })
          );

          if (list.length > 0) {
            setSuggestions(list);
            setIsOpen(true);
            setSelectedIndex(-1);
            return;
          }
          // DaData вернула 0 результатов — НЕ обращаемся к Яндексу, показываем fallback
          showFallbackSuggestions(query);
          return;
        } else {
          console.warn('DaData error:', dadataResp.status, dadataResp.statusText);
        }
      }

      // Yandex Geocoder как резерв ТОЛЬКО при ошибке DaData или отсутствии токена
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY;
      if (apiKey) {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(
            query
          )}&results=7&bbox=35.0,54.5~40.5,57.0&rspn=1`,
          { signal: ctrl.signal }
        );

        if (response.ok) {
          const data = await response.json();
          const results = data.response?.GeoObjectCollection?.featureMember || [];

          const mapped: YandexSuggestion[] = results.map((item: any) => {
            const geoObject = item.GeoObject;
            const address = geoObject.metaDataProperty.GeocoderMetaData.text;
            return { displayName: address, value: address };
          });

          setSuggestions(mapped);
          setIsOpen(mapped.length > 0);
          setSelectedIndex(-1);
        } else {
          console.error('Yandex Geocoder API error:', response.status, response.statusText);
          showFallbackSuggestions(query);
        }
      } else {
        showFallbackSuggestions(query);
      }
    } catch (error) {
      console.error('Address autocomplete error:', error);
      showFallbackSuggestions(query);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Простые подсказки когда Yandex API недоступен
  const showFallbackSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const fallbackSuggestions: YandexSuggestion[] = [];

    // Всегда предлагаем использовать введённый адрес как есть
    if (query.trim()) {
      fallbackSuggestions.push({
        displayName: `Использовать введённый адрес: "${query}"`,
        value: query,
      });
    }

    // Основные города Московской области
    const cities = [
      'Москва',
      'Московская область, г. Балашиха',
      'Московская область, г. Люберцы',
      'Московская область, г. Королёв',
      'Московская область, г. Мытищи',
      'Московская область, г. Подольск',
      'Московская область, г. Химки',
      'Московская область, г. Одинцово',
      'Московская область, г. Клин',
      'Московская область, г. Жуковский',
    ];

    cities.forEach(city => {
      if (city.toLowerCase().includes(lowerQuery)) {
        fallbackSuggestions.push({
          displayName: city,
          value: city,
        });
      }
    });

    // Если ничего больше не нашли, добавляем подсказку о формате
    if (fallbackSuggestions.length === 1 && query.length >= 3) {
      fallbackSuggestions.push({
        displayName: `Пример: Московская область, г. ${query}, ул. Ленина, д. 1, кв. 1`,
        value: `Московская область, г. ${query}, ул. Ленина, д. 1, кв. 1`,
      });
    }

    setSuggestions(fallbackSuggestions);
    setIsOpen(fallbackSuggestions.length > 0);
    setSelectedIndex(-1);
  };

  // Debounced поиск
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      getSuggestions(newValue);
    }, 300);
  };

  // Обработка клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Выбор подсказки
  const selectSuggestion = (suggestion: YandexSuggestion) => {
    onChange(suggestion.value);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Подсветка совпадений в тексте
  const highlightMatches = (
    text: string,
    highlights?: Array<[number, number]>
  ) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    highlights.forEach(([start, end]) => {
      if (lastIndex < start) {
        parts.push(
          <span key={`${lastIndex}-${start}`}>
            {text.slice(lastIndex, start)}
          </span>
        );
      }
      parts.push(
        <mark key={`${start}-${end}`} className="bg-yellow-200 text-black">
          {text.slice(start, end)}
        </mark>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push(<span key={`${lastIndex}-end`}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          ref={inputRef}
          id={id}
          value={value}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn('min-h-[80px] pr-8', className)}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 size-6 p-0"
            onClick={() => {
              onChange('');
              setIsOpen(false);
              setSuggestions([]);
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Список подсказок */}
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <div className="size-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
              Поиск адресов...
            </div>
          )}

          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                'flex w-full items-start gap-2 border-none bg-transparent px-4 py-3 text-left text-sm hover:bg-gray-50',
                selectedIndex === index && 'bg-blue-50 text-blue-900'
              )}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400" />
              <span className="flex-1">
                {highlightMatches(suggestion.displayName, suggestion.hl)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}