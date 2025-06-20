import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

export function AITaskBreakdown() {
  const [taskDescription, setTaskDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleAnalyze = async () => {
    if (!taskDescription.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setSuggestions([
        "Set up project repository and initial structure",
        "Design database schema and relationships",
        "Implement user authentication system",
        "Create main dashboard components",
        "Add task creation and management features",
        "Implement real-time updates",
        "Write comprehensive tests",
        "Deploy to production environment"
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const createTaskFromSuggestion = (suggestion: string) => {
    // This would integrate with your task management system
    console.log("Creating task:", suggestion);
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
                <div key={index} className="flex items-center justify-between p-3 retro-card rounded-none bg-muted/30">
                  <span className="text-sm flex-1 font-mono">{suggestion}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createTaskFromSuggestion(suggestion)}
                    className="ml-2 retro-button"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    ADD TASK
                  </Button>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full retro-button font-bold">
              <Plus className="w-4 h-4 mr-2" />
              CREATE ALL TASKS
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}