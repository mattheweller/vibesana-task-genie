import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSave: (task: Omit<Task, "id"> & { id?: string }) => void;
}

export function TaskForm({ open, onOpenChange, task, onSave }: TaskFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    assignee: string;
    dueDate: string;
  }>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
    dueDate: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee || "",
        dueDate: task.dueDate || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: "",
        dueDate: "",
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: task?.id,
      subtasks: 0,
      comments: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="retro-card max-w-md">
        <DialogHeader>
          <DialogTitle className="neon-text uppercase tracking-wider">
            {task ? "EDIT TASK" : "CREATE NEW TASK"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="font-bold uppercase text-xs tracking-wide">
              TITLE
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 retro-input"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-bold uppercase text-xs tracking-wide">
              DESCRIPTION
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 retro-input"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-bold uppercase text-xs tracking-wide">
                STATUS
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "todo" | "in-progress" | "review" | "done" })
                }
              >
                <SelectTrigger className="mt-1 retro-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="retro-card">
                  <SelectItem value="todo">TO DO</SelectItem>
                  <SelectItem value="in-progress">IN PROGRESS</SelectItem>
                  <SelectItem value="review">REVIEW</SelectItem>
                  <SelectItem value="done">DONE</SelectItem>
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
                  setFormData({ ...formData, priority: value as "low" | "medium" | "high" })
                }
              >
                <SelectTrigger className="mt-1 retro-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="retro-card">
                  <SelectItem value="low">LOW</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="high">HIGH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee" className="font-bold uppercase text-xs tracking-wide">
                ASSIGNEE
              </Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="mt-1 retro-input"
                placeholder="Name"
              />
            </div>

            <div>
              <Label htmlFor="dueDate" className="font-bold uppercase text-xs tracking-wide">
                DUE DATE
              </Label>
              <Input
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 retro-input"
                placeholder="Dec 25"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="retro-button"
            >
              CANCEL
            </Button>
            <Button type="submit" className="retro-button">
              {task ? "UPDATE" : "CREATE"} TASK
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}