'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EVENT_TYPES, EVENT_TYPE_NAMES, type EventType } from '@/lib/schema-constants';

interface EventTypeFilterProps {
  selectedEventType: EventType | null;
  onEventTypeChange: (eventType: EventType | null) => void;
}

export const EventTypeFilter = React.memo<EventTypeFilterProps>(
  ({ selectedEventType, onEventTypeChange }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Для какого события?</h3>
        <Select
          value={selectedEventType || 'all'}
          onValueChange={(value) => {
            if (value === 'all' || !value) {
              onEventTypeChange(null);
            } else {
              onEventTypeChange(value as EventType);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Все события" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все события</SelectItem>
            {Object.values(EVENT_TYPES).map((eventType) => (
              <SelectItem key={eventType} value={eventType}>
                {EVENT_TYPE_NAMES[eventType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

EventTypeFilter.displayName = 'EventTypeFilter';

