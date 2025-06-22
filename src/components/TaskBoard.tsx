
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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

export function TaskBoard({ tasks, onEdit, onDelete, onStatusChange }: TaskBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination or dropped in same position, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Update task status
    const newStatus = destination.droppableId as Task['status'];
    onStatusChange(draggableId, newStatus);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-all ${
                      snapshot.isDraggingOver 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted-foreground/20'
                    }`}
                  >
                    <div className="space-y-3">
                      {columnTasks.map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-transform ${
                                snapshot.isDragging 
                                  ? 'rotate-2 scale-105 shadow-2xl' 
                                  : ''
                              }`}
                            >
                              <TaskCard
                                task={task}
                                onEdit={onEdit}
                                onDelete={onDelete}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                    
                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground font-mono text-sm">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
