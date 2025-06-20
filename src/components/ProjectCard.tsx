import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: "active" | "planning" | "completed" | "on-hold";
    progress: number;
    teamSize: number;
    dueDate: string;
    tasksTotal: number;
    tasksCompleted: number;
  };
}

const statusColors = {
  "active": "bg-green-200 text-green-900 border-green-300",
  "planning": "bg-blue-200 text-blue-900 border-blue-300",
  "completed": "bg-gray-200 text-gray-900 border-gray-300",
  "on-hold": "bg-yellow-200 text-yellow-900 border-yellow-300",
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-1">{project.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border">
              <DropdownMenuItem>View project</DropdownMenuItem>
              <DropdownMenuItem>Edit project</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${statusColors[project.status]} font-medium`}>
              {project.status.replace("-", " ")}
            </Badge>
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          
          <Progress value={project.progress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{project.teamSize} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{project.dueDate}</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {project.tasksCompleted} of {project.tasksTotal} tasks completed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}