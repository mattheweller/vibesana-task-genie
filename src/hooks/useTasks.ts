import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  due_date?: string;
  subtasks?: number;
  comments?: number;
  created_at?: string;
  updated_at?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert Supabase data to our Task type with proper type assertions
      const typedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status as "todo" | "in-progress" | "review" | "done",
        priority: task.priority as "low" | "medium" | "high",
        assignee: task.assignee || undefined,
        due_date: task.due_date || undefined,
        subtasks: task.subtasks || 0,
        comments: task.comments || 0,
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error fetching tasks",
        description: "Could not load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      console.log('Creating task with data:', taskData);
      
      // Prepare data for insertion - only include fields that should be sent to database
      const insertData = {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        assignee: taskData.assignee || null,
        due_date: taskData.due_date || null,
        subtasks: taskData.subtasks || 0,
        comments: taskData.comments || 0,
        user_id: user.id,
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task created successfully:', data);

      // Convert the returned data to our Task type
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status as "todo" | "in-progress" | "review" | "done",
        priority: data.priority as "low" | "medium" | "high",
        assignee: data.assignee || undefined,
        due_date: data.due_date || undefined,
        subtasks: data.subtasks || 0,
        comments: data.comments || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setTasks(prev => [newTask, ...prev]);
      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: "Could not create your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Convert the returned data to our Task type
      const updatedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status as "todo" | "in-progress" | "review" | "done",
        priority: data.priority as "low" | "medium" | "high",
        assignee: data.assignee || undefined,
        due_date: data.due_date || undefined,
        subtasks: data.subtasks || 0,
        comments: data.comments || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Could not update your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "Could not delete your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
