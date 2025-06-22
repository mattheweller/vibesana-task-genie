import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskCard } from "@/components/TaskCard";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskViewToggle } from "@/components/TaskViewToggle";
import { ProjectCard } from "@/components/ProjectCard";
import { AITaskBreakdown } from "@/components/AITaskBreakdown";
import { TaskForm } from "@/components/TaskForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TasksLoadingSkeleton } from "@/components/TasksLoadingSkeleton";
import { TaskFilterDialog } from "@/components/TaskFilterDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, LogOut, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks, Task } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { TutorialModal } from "@/components/TutorialModal";

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

interface TaskFilters {
  status: string[];
  priority: string[];
}

const Index = () => {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [taskView, setTaskView] = useState<'list' | 'board'>('list');
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: []
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, refetch } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.assignee && task.assignee.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    return filtered;
  }, [tasks, searchQuery, filters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilters({ status: [], priority: [] });
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || filters.status.length > 0 || filters.priority.length > 0;

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if user should see tutorial
  useEffect(() => {
    if (user && !loading) {
      const hasSeenTutorial = localStorage.getItem(`tutorial-seen-${user.id}`);
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [user, loading]);

  const handleTutorialClose = () => {
    if (user) {
      localStorage.setItem(`tutorial-seen-${user.id}`, 'true');
    }
    setShowTutorial(false);
    toast({
      title: "Welcome to Vibesana! 🚀",
      description: "Ready to revolutionize your productivity? Create your first task to get started!",
    });
  };

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
    console.log('Editing task:', task);
    setEditingTask(task);
    setTaskFormOpen(true);
    toast({
      title: "Editing task",
      description: `Opening "${task.title}" for editing`,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${taskToDelete?.title || 'this task'}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        await deleteTask(taskId);
        toast({
          title: "Task deleted",
          description: "The task has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error deleting task",
          description: "Could not delete the task. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, "id"> & { id?: string }) => {
    try {
      if (taskData.id) {
        // Edit existing task
        console.log('Updating task:', taskData);
        await updateTask(taskData.id, taskData);
        toast({
          title: "Task updated",
          description: `"${taskData.title}" has been successfully updated.`,
        });
      } else {
        // Create new task
        console.log('Creating new task:', taskData);
        await createTask(taskData);
        toast({
          title: "Task created",
          description: `"${taskData.title}" has been successfully created.`,
        });
      }
      setTaskFormOpen(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error saving task",
        description: "Could not save the task. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle the error state
    }
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

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast({
        title: "Task status updated",
        description: `Task moved to ${newStatus.replace('-', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating task",
        description: "Could not update the task status. Please try again.",
        variant: "destructive",
      });
    }
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
                      <TaskViewToggle view={taskView} onViewChange={setTaskView} />
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          placeholder="Search tasks..." 
                          className="pl-9 w-64" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="retro-button"
                        onClick={() => setFilterDialogOpen(true)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        FILTER
                        {hasActiveFilters && (
                          <span className="ml-1 bg-primary text-primary-foreground rounded-full w-2 h-2"></span>
                        )}
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

                  {hasActiveFilters && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-mono text-muted-foreground">
                        Showing {filteredTasks.length} of {tasks.length} tasks
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs h-6 px-2"
                      >
                        CLEAR FILTERS
                      </Button>
                    </div>
                  )}
                  
                  {tasksLoading ? (
                    <TasksLoadingSkeleton />
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      {tasks.length === 0 ? (
                        <>
                          <p className="text-muted-foreground font-mono mb-4">No tasks yet. Create your first task to get started!</p>
                          <Button className="retro-button neon-text font-bold" onClick={handleCreateTask}>
                            <Plus className="w-4 h-4 mr-2" />
                            CREATE FIRST TASK
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground font-mono mb-4">No tasks match your current filters.</p>
                          <Button 
                            variant="outline" 
                            className="retro-button" 
                            onClick={clearFilters}
                          >
                            CLEAR FILTERS
                          </Button>
                        </>
                      )}
                    </div>
                  ) : taskView === 'board' ? (
                    <TaskBoard
                      tasks={filteredTasks}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTasks.map((task) => (
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
          onOpenChange={(open) => {
            if (!open) {
              setEditingTask(undefined);
            }
            setTaskFormOpen(open);
          }}
          task={editingTask}
          onSave={handleSaveTask}
        />

        <TaskFilterDialog
          open={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <TutorialModal
          open={showTutorial}
          onClose={handleTutorialClose}
        />
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Index;
