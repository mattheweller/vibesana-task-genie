
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Plus, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/hooks/useTasks";

interface AITaskBreakdownProps {
  onTasksGenerated?: (tasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]) => void;
}

export function AITaskBreakdown({ onTasksGenerated }: AITaskBreakdownProps) {
  const [taskDescription, setTaskDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!taskDescription.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setSuggestions([]);
    
    try {
      console.log('Calling AI task breakdown for:', taskDescription);
      
      const { data, error: supabaseError } = await supabase.functions.invoke('ai-task-breakdown', {
        body: { description: taskDescription }
      });

      if (supabaseError) {
        console.error('Supabase function error:', supabaseError);
        throw new Error(`AI service error: ${supabaseError.message}`);
      }

      console.log('AI breakdown response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.tasks && Array.isArray(data.tasks)) {
        setSuggestions(data.tasks);
        onTasksGenerated?.(data.tasks);
        
        toast({
          title: "Tasks generated successfully!",
          description: `AI generated ${data.tasks.length} tasks for your project.`,
        });
      } else {
        throw new Error('Invalid response format from AI service');
      }

    } catch (error) {
      console.error('Error generating task breakdown:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error generating tasks",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTaskFromSuggestion = async (suggestion: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    setIsCreatingTasks(true);
    try {
      // Dispatch a custom event that the parent component can listen to
      window.dispatchEvent(new CustomEvent('createTaskFromAI', { 
        detail: suggestion 
      }));
      
      toast({
        title: "Task created",
        description: `"${suggestion.title}" has been added to your tasks.`,
      });
    } catch (error) {
      toast({
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const createAllTasks = async () => {
    if (suggestions.length === 0) return;
    
    setIsCreatingTasks(true);
    try {
      suggestions.forEach(suggestion => {
        window.dispatchEvent(new CustomEvent('createTaskFromAI', { 
          detail: suggestion 
        }));
      });
      
      toast({
        title: "All tasks created",
        description: `${suggestions.length} tasks have been added to your project.`,
      });
    } catch (error) {
      toast({
        title: "Error creating tasks",
        description: "Failed to create some tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTasks(false);
    }
  };

  return (
    <Card className="w-full retro-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 neon-text uppercase tracking-wider">
          <Bot className="w-5 h-5 text-primary" />
          AI TASK BREAKDOWN
        </CardTitle>
        <p className="text-sm text-muted-foreground font-mono">
          Describe your project or feature, and I'll help break it down into manageable tasks.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe what you want to build... (e.g., 'Build a user dashboard for project management')"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="min-h-[100px]"
            disabled={isAnalyzing}
          />
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={!taskDescription.trim() || isAnalyzing}
          className="w-full retro-button font-bold"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              ANALYZING...
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 mr-2" />
              BREAK DOWN TASK
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-bold neon-text uppercase tracking-wider">SUGGESTED BREAKDOWN:</h4>
              <Badge variant="secondary" className="text-xs font-bold bg-accent text-accent-foreground border-2 border-primary">
                {suggestions.length} TASKS
              </Badge>
            </div>
            
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start justify-between p-3 retro-card rounded-none bg-muted/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{suggestion.title}</span>
                      <Badge 
                        variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {suggestion.priority?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{suggestion.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createTaskFromSuggestion(suggestion)}
                    disabled={isCreatingTasks}
                    className="ml-2 retro-button"
                  >
                    {isCreatingTasks ? (
                      <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}
                    ADD
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full retro-button font-bold"
              onClick={createAllTasks}
              disabled={isCreatingTasks}
            >
              {isCreatingTasks ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  CREATING TASKS...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  CREATE ALL TASKS
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
