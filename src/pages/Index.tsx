import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskCard } from "@/components/TaskCard";
import { ProjectCard } from "@/components/ProjectCard";
import { AITaskBreakdown } from "@/components/AITaskBreakdown";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  subtasks?: number;
  comments?: number;
}

// Initial data for demonstration
const initialTasks: Task[] = [
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Listen for create task events from sidebar
  const handleCreateTask = () => {
    setEditingTask(undefined);
    setTaskFormOpen(true);
  };

  // Listen for create task events from sidebar
  useEffect(() => {
    const handleCreateTaskEvent = () => {
      handleCreateTask();
    };
    window.addEventListener('createTask', handleCreateTaskEvent);
    return () => window.removeEventListener('createTask', handleCreateTaskEvent);
  }, [handleCreateTask]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been successfully deleted.",
    });
  };

  const handleSaveTask = (taskData: Omit<Task, "id"> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing task
      setTasks(tasks.map(t => t.id === taskData.id ? { ...taskData, id: taskData.id } : t));
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        subtasks: 0,
        comments: 0,
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Task created",
        description: "A new task has been successfully created.",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg neon-text">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happens in useEffect
  }

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
              <Button variant="outline" className="retro-button font-bold" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                SIGN OUT
              </Button>
              <Button className="retro-button neon-text font-bold" onClick={handleCreateTask}>
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
                  {tasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
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
      
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </SidebarProvider>
  );
};

export default Index;
