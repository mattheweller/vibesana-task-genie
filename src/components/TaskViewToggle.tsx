
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface TaskViewToggleProps {
  view: 'list' | 'board';
  onViewChange: (view: 'list' | 'board') => void;
}

export function TaskViewToggle({ view, onViewChange }: TaskViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="retro-button text-xs"
      >
        <List className="w-4 h-4 mr-1" />
        LIST
      </Button>
      <Button
        variant={view === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('board')}
        className="retro-button text-xs"
      >
        <LayoutGrid className="w-4 h-4 mr-1" />
        BOARD
      </Button>
    </div>
  );
}
