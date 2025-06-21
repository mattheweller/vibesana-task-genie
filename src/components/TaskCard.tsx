
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, MessageSquare, Bot } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const statusColors = {
  "todo": "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "review": "bg-yellow-100 text-yellow-700",
  "done": "bg-green-100 text-green-700"
};

const priorityColors = {
  "low": "bg-accent/20 text-accent border-accent",
  "medium": "bg-secondary/20 text-secondary border-secondary", 
  "high": "bg-destructive/20 text-destructive border-destructive"
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="retro-card hover:shadow-2xl transition-all cursor-pointer group border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary text-primary-foreground font-bold uppercase border-2 border-accent">
              {task.status.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className={`font-bold uppercase border-2 ${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border">
              <DropdownMenuItem>
                <Bot size={14} className="mr-2" />
                Break down with AI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                Edit task
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => onDelete?.(task.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold mb-2 neon-text uppercase tracking-wide">{task.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-mono">{task.description}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {task.subtasks && task.subtasks > 0 && <span>{task.subtasks} subtasks</span>}
            {task.comments && task.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span>{task.comments}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.assignee && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-medium">
                  {task.assignee.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {task.due_date && <span className="text-xs">{task.due_date}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
