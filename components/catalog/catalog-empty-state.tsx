import { Button } from '@/components/ui/button';

interface CatalogEmptyStateProps {
    onClearFilters: () => void;
}

export function CatalogEmptyState({ onClearFilters }: CatalogEmptyStateProps) {
    return (
        <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
                По выбранным фильтрам ничего не найдено
            </p>
            <Button variant="outline" onClick={onClearFilters}>
                Сбросить фильтры
            </Button>
        </div>
    );
}

