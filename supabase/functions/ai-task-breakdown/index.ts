
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { generateTaskBreakdown } from "./openai-service.ts";
import { createTrace, updateTraceSuccess, updateTraceError } from "./trace-utils.ts";
import { TaskBreakdownRequest, TaskBreakdownResponse, ErrorResponse } from "./types.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let trace: any = null;

  try {
    const { description }: TaskBreakdownRequest = await req.json();

    if (!description) {
      throw new Error('Task description is required');
    }

    console.log('Processing task breakdown for:', description);

    // Start a trace if Opik is available
    trace = createTrace(description);

    // Generate tasks using OpenAI
    const tasks = await generateTaskBreakdown(description);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update trace with successful completion (now awaited to ensure flush)
    await updateTraceSuccess(trace, tasks, duration);

    const response: TaskBreakdownResponse = { tasks };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-breakdown function:', error);
    
    // Update trace with error if available (now awaited to ensure flush)
    await updateTraceError(trace, error.message);
    
    const errorResponse: ErrorResponse = { 
      error: error.message,
      tasks: [] 
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
