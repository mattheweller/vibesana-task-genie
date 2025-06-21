
export interface TaskBreakdownRequest {
  description: string;
}

export interface Task {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo";
}

export interface TaskBreakdownResponse {
  tasks: Task[];
}

export interface ErrorResponse {
  error: string;
  tasks: Task[];
}
