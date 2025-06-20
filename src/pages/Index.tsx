import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskCard } from "@/components/TaskCard";
import { ProjectCard } from "@/components/ProjectCard";
import { AITaskBreakdown } from "@/components/AITaskBreakdown";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for demonstration
const mockTasks = [
  {
    id: "1",
    title: "Design user authentication flow",
    description: "Create wireframes and user journey for login, signup, and password reset flows. Include social login options.",
    status: "in-progress" as const,
    priority: "high" as const,
    assignee: "Alex",
    dueDate: "Dec 25",
    subtasks: 3,
    comments: 2,
  },
  {
    id: "2",
    title: "Implement task management API",
    description: "Build REST endpoints for CRUD operations on tasks, including filtering, sorting, and pagination.",
    status: "todo" as const,
    priority: "medium" as const,
    assignee: "Sarah",
    dueDate: "Dec 28",
    subtasks: 5,
    comments: 1,
  },
  {
    id: "3",
    title: "Set up database migrations",
    description: "Create initial database schema and migration scripts for production deployment.",
    status: "done" as const,
    priority: "high" as const,
    assignee: "Mike",
    dueDate: "Dec 20",
    subtasks: 2,
    comments: 0,
  },
];

const mockProjects = [
  {
    id: "1",
    name: "Vibesana MVP",
    description: "Core task management platform with AI-powered task breakdown functionality.",
    status: "active" as const,
    progress: 65,
    teamSize: 4,
    dueDate: "Jan 15",
    tasksTotal: 24,
    tasksCompleted: 16,
  },
  {
    id: "2",
    name: "Mobile App",
    description: "React Native mobile application for on-the-go task management.",
    status: "planning" as const,
    progress: 15,
    teamSize: 2,
    dueDate: "Mar 1",
    tasksTotal: 18,
    tasksCompleted: 3,
  },
];

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold neon-text uppercase tracking-wider">DASHBOARD</h1>
              <p className="text-muted-foreground font-mono">Welcome back! Here's what's happening with your projects.</p>
            </div>
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Button className="retro-button neon-text font-bold">
                <Plus className="w-4 h-4 mr-2" />
                NEW TASK
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold neon-text uppercase tracking-wider">RECENT TASKS</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search tasks..." className="pl-9 w-64" />
                    </div>
                    <Button variant="outline" size="sm" className="retro-button">
                      <Filter className="w-4 h-4 mr-2" />
                      FILTER
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 neon-text uppercase tracking-wider">ACTIVE PROJECTS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <AITaskBreakdown />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
