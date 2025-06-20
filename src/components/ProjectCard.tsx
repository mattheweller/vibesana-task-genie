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
  "active": "bg-green-100 text-green-700",
  "planning": "bg-blue-100 text-blue-700",
  "completed": "bg-gray-100 text-gray-700",
  "on-hold": "bg-yellow-100 text-yellow-700",
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="retro-card hover:shadow-2xl transition-all cursor-pointer group border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold mb-1 neon-text uppercase tracking-wide">{project.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 font-mono">{project.description}</p>
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
            <Badge variant="outline" className="bg-accent text-accent-foreground font-bold uppercase border-2 border-primary">
              {project.status.replace("-", " ")}
            </Badge>
            <span className="text-sm font-bold neon-text">{project.progress}%</span>
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