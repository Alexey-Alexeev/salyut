import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

interface ViewModeControlsProps {
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ViewModeControls({ viewMode, onViewModeChange }: ViewModeControlsProps) {
    return (
        <div className="flex items-center gap-1">
            <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="size-9 p-0"
            >
                <Grid className="size-4" />
            </Button>
            <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="size-9 p-0"
            >
                <List className="size-4" />
            </Button>
        </div>
    );
}

