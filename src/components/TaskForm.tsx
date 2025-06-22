
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, Calendar, User, Flag, CheckSquare } from "lucide-react";
import { Task } from "@/hooks/useTasks";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSave: (task: Omit<Task, "id"> & { id?: string }) => Promise<void>;
}

export function TaskForm({ open, onOpenChange, task, onSave }: TaskFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    assignee: string;
    due_date: string;
  }>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
    due_date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (task) {
      const newFormData = {
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignee: task.assignee || "",
        due_date: task.due_date || "",
      };
      setFormData(newFormData);
      setHasUnsavedChanges(false);
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: "",
        due_date: "",
      });
      setHasUnsavedChanges(false);
    }
    setErrors({});
  }, [task, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (formData.assignee && formData.assignee.length > 50) {
      newErrors.assignee = "Assignee name must be less than 50 characters";
    }

    if (formData.due_date && formData.due_date.length > 20) {
      newErrors.due_date = "Due date must be less than 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        id: task?.id,
        subtasks: task?.subtasks || 0,
        comments: task?.comments || 0,
      });
      setHasUnsavedChanges(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
      // Error is handled by the parent component's toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (!confirmDiscard) return;
    }
    onOpenChange(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo": return "📋";
      case "in-progress": return "⚡";
      case "review": return "👀";
      case "done": return "✅";
      default: return "📋";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="retro-card max-w-md">
        <DialogHeader>
          <DialogTitle className="neon-text uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            {task ? "EDIT TASK" : "CREATE NEW TASK"}
          </DialogTitle>
          <DialogDescription className="font-mono text-sm">
            {task ? "Update your task details below" : "Fill in the details to create a new task"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="font-bold uppercase text-xs tracking-wide flex items-center gap-1">
              <span>TITLE</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`mt-1 retro-input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter task title..."
              maxLength={100}
              required
            />
            {errors.title && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {formData.title.length}/100 characters
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="font-bold uppercase text-xs tracking-wide">
              DESCRIPTION
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`mt-1 retro-input ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe your task..."
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {formData.description.length}/500 characters
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-bold uppercase text-xs tracking-wide flex items-center gap-1">
                <Flag className="w-3 h-3" />
                STATUS
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleInputChange("status", value as "todo" | "in-progress" | "review" | "done")
                }
              >
                <SelectTrigger className="mt-1 retro-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="retro-card">
                  <SelectItem value="todo" className="flex items-center gap-2">
                    <span>{getStatusIcon("todo")} TO DO</span>
                  </SelectItem>
                  <SelectItem value="in-progress" className="flex items-center gap-2">
                    <span>{getStatusIcon("in-progress")} IN PROGRESS</span>
                  </SelectItem>
                  <SelectItem value="review" className="flex items-center gap-2">
                    <span>{getStatusIcon("review")} REVIEW</span>
                  </SelectItem>
                  <SelectItem value="done" className="flex items-center gap-2">
                    <span>{getStatusIcon("done")} DONE</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bold uppercase text-xs tracking-wide">
                PRIORITY
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  handleInputChange("priority", value as "low" | "medium" | "high")
                }
              >
                <SelectTrigger className="mt-1 retro-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="retro-card">
                  <SelectItem value="low" className={getPriorityColor("low")}>
                    LOW
                  </SelectItem>
                  <SelectItem value="medium" className={getPriorityColor("medium")}>
                    MEDIUM
                  </SelectItem>
                  <SelectItem value="high" className={getPriorityColor("high")}>
                    HIGH
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee" className="font-bold uppercase text-xs tracking-wide flex items-center gap-1">
                <User className="w-3 h-3" />
                ASSIGNEE
              </Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleInputChange("assignee", e.target.value)}
                className={`mt-1 retro-input ${errors.assignee ? 'border-red-500' : ''}`}
                placeholder="Assign to..."
                maxLength={50}
              />
              {errors.assignee && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {errors.assignee}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="due_date" className="font-bold uppercase text-xs tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                DUE DATE
              </Label>
              <Input
                id="due_date"
                value={formData.due_date}
                onChange={(e) => handleInputChange("due_date", e.target.value)}
                className={`mt-1 retro-input ${errors.due_date ? 'border-red-500' : ''}`}
                placeholder="Dec 25"
                maxLength={20}
              />
              {errors.due_date && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {errors.due_date}
                </div>
              )}
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4" />
                You have unsaved changes
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="retro-button"
              disabled={isSubmitting}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              className="retro-button neon-text font-bold"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {task ? "UPDATING..." : "CREATING..."}
                </>
              ) : (
                <>
                  {task ? "UPDATE" : "CREATE"} TASK
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
