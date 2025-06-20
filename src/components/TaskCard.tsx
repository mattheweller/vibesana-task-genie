import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, MessageSquare, Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    assignee?: string;
    dueDate?: string;
    subtasks?: number;
    comments?: number;
  };
}

const statusColors = {
  "todo": "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "review": "bg-yellow-100 text-yellow-700",
  "done": "bg-green-100 text-green-700",
};

const priorityColors = {
  "low": "bg-gray-100 text-gray-600",
  "medium": "bg-orange-100 text-orange-600",
  "high": "bg-red-100 text-red-600",
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[task.status]}>
              {task.status.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className={priorityColors[task.priority]}>
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
              <DropdownMenuItem>Edit task</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium mb-2">{task.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {task.subtasks && (
              <span>{task.subtasks} subtasks</span>
            )}
            {task.comments && (
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
            {task.dueDate && (
              <span className="text-xs">{task.dueDate}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}