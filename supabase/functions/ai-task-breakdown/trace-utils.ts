
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

export const updateTraceSuccess = async (trace: any, tasks: Task[], duration: number, usage?: any) => {
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
    
    // Flush the client to send the trace
    const opikClient = getOpikClient();
    if (opikClient) {
      await opikClient.flush();
      console.log('Opik trace flushed successfully');
    }
    
    console.log('Opik trace updated successfully');
  } catch (traceError) {
    console.error('Failed to update trace:', traceError);
  }
};

export const updateTraceError = async (trace: any, error: string) => {
  if (!trace) return;

  try {
    trace.update({
      output: { error },
      tags: ['error', 'function-error'],
    });
    
    // Flush the client to send the trace even on error
    const opikClient = getOpikClient();
    if (opikClient) {
      await opikClient.flush();
      console.log('Opik trace flushed after error');
    }
  } catch (traceError) {
    console.error('Failed to update trace with error:', traceError);
  }
};
