
import { getOpikClient } from "./opik-client.ts";
import { Task } from "./types.ts";

export const createTrace = (description: string) => {
  const opikClient = getOpikClient();
  
  if (!opikClient) {
    return null;
  }

  try {
    const trace = opikClient.trace({
      name: 'ai-task-breakdown',
      input: { description },
      tags: ['ai-task-breakdown', 'openai'],
    });
    console.log('Opik trace started successfully');
    return trace;
  } catch (error) {
    console.error('Failed to start Opik trace:', error);
    return null;
  }
};

export const updateTraceSuccess = (trace: any, tasks: Task[], duration: number, usage?: any) => {
  if (!trace) return;

  try {
    trace.update({
      output: { tasks, task_count: tasks.length },
      metadata: {
        duration_ms: duration,
        model: 'gpt-4o-mini',
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
      },
      tags: ['success', 'task-generation'],
    });
    console.log('Opik trace updated successfully');
  } catch (traceError) {
    console.error('Failed to update trace:', traceError);
  }
};

export const updateTraceError = (trace: any, error: string) => {
  if (!trace) return;

  try {
    trace.update({
      output: { error },
      tags: ['error', 'function-error'],
    });
  } catch (traceError) {
    console.error('Failed to update trace with error:', traceError);
  }
};
