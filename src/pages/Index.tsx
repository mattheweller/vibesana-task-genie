
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
import { useAuth } from "@/contexts/AuthContext";
import { useTasks, Task } from "@/hooks/useTasks";

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
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const { user, loading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks();
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
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleSaveTask = async (taskData: Omit<Task, "id"> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing task
      await updateTask(taskData.id, taskData);
    } else {
      // Create new task
      await createTask(taskData);
    }
    setTaskFormOpen(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth');
    }
  };

  // Show loading or redirect if not authenticated
  if (loading || tasksLoading) {
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
                  <h2 className="text-xl font-semibold neon-text uppercase tracking-wider">YOUR TASKS</h2>
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
                
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground font-mono mb-4">No tasks yet. Create your first task to get started!</p>
                    <Button className="retro-button neon-text font-bold" onClick={handleCreateTask}>
                      <Plus className="w-4 h-4 mr-2" />
                      CREATE FIRST TASK
                    </Button>
                  </div>
                ) : (
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
                )}
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
