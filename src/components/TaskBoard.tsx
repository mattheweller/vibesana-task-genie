
import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { Badge } from '@/components/ui/badge';

interface TaskBoardProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const statusColumns = [
  { id: 'todo', label: 'TO DO', icon: '📋' },
  { id: 'in-progress', label: 'IN PROGRESS', icon: '⚡' },
  { id: 'review', label: 'REVIEW', icon: '👀' },
  { id: 'done', label: 'DONE', icon: '✅' },
] as const;

interface SortableTaskProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

function SortableTask({ task, onEdit, onDelete }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export function TaskBoard({ tasks, onEdit, onDelete, onStatusChange }: TaskBoardProps) {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping on a status column
    const targetStatus = statusColumns.find(col => col.id === overId);
    if (targetStatus) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus.id) {
        onStatusChange(taskId, targetStatus.id);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className="mb-4">
                <Badge 
                  variant="outline" 
                  className="bg-primary text-primary-foreground font-bold uppercase border-2 border-accent text-sm"
                >
                  {column.icon} {column.label} ({columnTasks.length})
                </Badge>
              </div>
              
              <SortableContext
                items={columnTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
                id={column.id}
              >
                <div
                  className="min-h-[200px] p-2 rounded-lg border-2 border-dashed border-muted-foreground/20 transition-all"
                  data-status={column.id}
                >
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                  
                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground font-mono text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl">
            <TaskCard
              task={activeTask}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
