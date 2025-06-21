
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/hooks/useTasks";
import { opikClient } from "@/lib/opik";

interface AITaskBreakdownProps {
  onTasksGenerated?: (tasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]) => void;
}

export function AITaskBreakdown({ onTasksGenerated }: AITaskBreakdownProps) {
  const [taskDescription, setTaskDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'>[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!taskDescription.trim()) return;
    
    setIsAnalyzing(true);
    const sessionId = crypto.randomUUID();
    
    try {
      console.log('Calling AI task breakdown for:', taskDescription);
      
      // Track user interaction with Opik
      try {
        await opikClient.trace({
          name: 'user-task-breakdown-request',
          input: { description: taskDescription },
          tags: ['user-interaction', 'frontend'],
          metadata: { sessionId },
        });
      } catch (opikError) {
        console.log('Opik tracking failed:', opikError);
      }
      
      const { data, error } = await supabase.functions.invoke('ai-task-breakdown', {
        body: { description: taskDescription }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI breakdown response:', data);

      if (data.tasks && Array.isArray(data.tasks)) {
        setSuggestions(data.tasks);
        onTasksGenerated?.(data.tasks);
        
        // Track successful task generation
        try {
          await opikClient.trace({
            name: 'task-breakdown-success',
            input: { description: taskDescription },
            output: { taskCount: data.tasks.length },
            tags: ['success', 'frontend'],
            metadata: { sessionId },
          });
        } catch (opikError) {
          console.log('Opik tracking failed:', opikError);
        }
        
        toast({
          title: "Tasks generated successfully!",
          description: `AI generated ${data.tasks.length} tasks for your project.`,
        });
      } else {
        throw new Error('Invalid response format from AI');
      }

    } catch (error) {
      console.error('Error generating task breakdown:', error);
      
      // Track error with Opik
      try {
        await opikClient.trace({
          name: 'task-breakdown-error',
          input: { description: taskDescription },
          output: { error: error.message },
          tags: ['error', 'frontend'],
          metadata: { sessionId },
        });
      } catch (opikError) {
        console.log('Opik tracking failed:', opikError);
      }
      
      toast({
        title: "Error generating tasks",
        description: "Could not generate task breakdown. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTaskFromSuggestion = (suggestion: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    // Track task creation from AI suggestion
    try {
      opikClient.trace({
        name: 'create-task-from-ai',
        input: { task: suggestion },
        tags: ['task-creation', 'ai-suggestion'],
      });
    } catch (opikError) {
      console.log('Opik tracking failed:', opikError);
    }
    
    // Dispatch a custom event that the parent component can listen to
    window.dispatchEvent(new CustomEvent('createTaskFromAI', { 
      detail: suggestion 
    }));
  };

  const createAllTasks = () => {
    // Track bulk task creation
    try {
      opikClient.trace({
        name: 'create-all-tasks-from-ai',
        input: { taskCount: suggestions.length },
        tags: ['bulk-task-creation', 'ai-suggestion'],
      });
    } catch (opikError) {
      console.log('Opik tracking failed:', opikError);
    }
    
    suggestions.forEach(suggestion => {
      window.dispatchEvent(new CustomEvent('createTaskFromAI', { 
        detail: suggestion 
      }));
    });
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
                    className="ml-2 retro-button"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    ADD
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full retro-button font-bold"
              onClick={createAllTasks}
            >
              <Plus className="w-4 h-4 mr-2" />
              CREATE ALL TASKS
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
