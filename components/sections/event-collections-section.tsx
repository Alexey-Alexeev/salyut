import { EventCollectionCard } from '@/components/event-collection-card';
import { EVENT_TYPES, type EventType } from '@/lib/schema-constants';

interface EventCollectionsSectionProps {
    eventCounts: {
        wedding: number;
        birthday: number;
        new_year: number;
    };
}

export function EventCollectionsSection({ eventCounts }: EventCollectionsSectionProps) {
    return (
        <section className="container mx-auto bg-gray-50 px-4 py-12">
            <div className="mb-12 space-y-4 text-center">
                <h2 className="text-3xl font-bold md:text-4xl">Подборки салютов</h2>
                <p className="text-muted-foreground mx-auto max-w-2xl">
                    Выберите подборку салютов для вашего праздника
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {Object.values(EVENT_TYPES)
                    .sort((a, b) => {
                        // Ставим new_year первым (особенно актуально перед Новым Годом)
                        if (a === EVENT_TYPES.NEW_YEAR) return -1;
                        if (b === EVENT_TYPES.NEW_YEAR) return 1;
                        return 0;
                    })
                    .map((eventType) => (
                        <EventCollectionCard
                            key={eventType}
                            eventType={eventType}
                            productCount={eventCounts[eventType]}
                        />
                    ))}
            </div>
        </section>
    );
}

