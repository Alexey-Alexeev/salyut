import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';

interface CatalogSearchProps {
    value: string;
    hasActiveSearch: boolean;
    isSearching?: boolean;
    onChange: (value: string) => void;
    onClear: () => void;
}

export function CatalogSearch({
    value,
    hasActiveSearch,
    isSearching = false,
    onChange,
    onClear,
}: CatalogSearchProps) {
    return (
        <div className="mb-6">
            <div className="relative w-full lg:w-64">
                {isSearching ? (
                    <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />
                ) : (
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                    type="text"
                    placeholder="Поиск по названию товара..."
                    value={value}
                    onChange={(e) => {
                        const searchValue = e.target.value;
                        console.log('[Webvisor] Поиск товара:', searchValue);
                        onChange(searchValue);
                    }}
                    className="pl-10 pr-10 ym-record-keys"
                />
                {hasActiveSearch && !isSearching && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

