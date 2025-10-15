import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CatalogSortProps {
    value: string;
    onChange: (value: string) => void;
    isMobile?: boolean;
}

export function CatalogSort({ value, onChange, isMobile = false }: CatalogSortProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={`h-9 ${isMobile ? 'w-36' : 'w-44'}`}>
                <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name">
                    {isMobile ? 'По названию' : 'По названию'}
                </SelectItem>
                <SelectItem value="price-asc">
                    {isMobile ? 'Дешёвые' : 'Сначала дешёвые'}
                </SelectItem>
                <SelectItem value="price-desc">
                    {isMobile ? 'Дорогие' : 'Сначала дорогие'}
                </SelectItem>
                <SelectItem value="popular">Популярные</SelectItem>
            </SelectContent>
        </Select>
    );
}

