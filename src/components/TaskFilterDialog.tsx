
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TaskFilters {
  status: string[];
  priority: string[];
}

interface TaskFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function TaskFilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: TaskFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);

  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      status: checked
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      priority: checked
        ? [...prev.priority, priority]
        : prev.priority.filter(p => p !== priority)
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearAll = () => {
    const emptyFilters = { status: [], priority: [] };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = localFilters.status.length > 0 || localFilters.priority.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md retro-card">
        <DialogHeader>
          <DialogTitle className="neon-text uppercase tracking-wider font-bold">
            FILTER TASKS
          </DialogTitle>
          <DialogDescription className="font-mono">
            Filter your tasks by status and priority
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-3 block">
              STATUS
            </Label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={localFilters.status.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-mono cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-3 block">
              PRIORITY
            </Label>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={localFilters.priority.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handlePriorityChange(option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`priority-${option.value}`}
                    className="text-sm font-mono cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className="retro-button"
          >
            CLEAR ALL
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="retro-button neon-text font-bold"
          >
            APPLY FILTERS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
