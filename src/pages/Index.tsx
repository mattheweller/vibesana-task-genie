
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskCard } from "@/components/TaskCard";
import { ProjectCard } from "@/components/ProjectCard";
import { AITaskBreakdown } from "@/components/AITaskBreakdown";
import { TaskForm } from "@/components/TaskForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TasksLoadingSkeleton } from "@/components/TasksLoadingSkeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, LogOut, AlertCircle, RefreshCw } from "lucide-react";
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, refetch } = useTasks();
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

  // Listen for create task events from sidebar and AI component
  useEffect(() => {
    const handleCreateTaskEvent = () => {
      handleCreateTask();
    };

    const handleCreateTaskFromAI = (event: CustomEvent) => {
      const taskData = event.detail;
      console.log('Creating task from AI suggestion:', taskData);
      createTask(taskData);
    };

    window.addEventListener('createTask', handleCreateTaskEvent);
    window.addEventListener('createTaskFromAI', handleCreateTaskFromAI as EventListener);
    
    return () => {
      window.removeEventListener('createTask', handleCreateTaskEvent);
      window.removeEventListener('createTaskFromAI', handleCreateTaskFromAI as EventListener);
    };
  }, [createTask]);

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
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (!error) {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleRetryTasks = () => {
    refetch();
  };

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" />
          <div className="text-lg neon-text font-mono">LOADING...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <ErrorBoundary>
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
                <Button 
                  variant="outline" 
                  className="retro-button font-bold" 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {isSigningOut ? "SIGNING OUT..." : "SIGN OUT"}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRetryTasks}
                        disabled={tasksLoading}
                        className="retro-button"
                      >
                        {tasksLoading ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        REFRESH
                      </Button>
                    </div>
                  </div>
                  
                  {tasksLoading ? (
                    <TasksLoadingSkeleton />
                  ) : tasks.length === 0 ? (
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
                <ErrorBoundary>
                  <AITaskBreakdown onTasksGenerated={(tasks) => {
                    console.log('AI generated tasks:', tasks);
                  }} />
                </ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default Index;
