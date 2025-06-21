
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const opikApiKey = Deno.env.get('OPIK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced Opik tracking function with corrected API endpoint
const trackWithOpik = async (traceData: any) => {
  if (!opikApiKey) {
    console.log('Opik API key not found - skipping tracking');
    return;
  }
  
  console.log('Attempting to track with Opik:', {
    traceId: traceData.id,
    projectName: 'Vibesana',
    hasApiKey: !!opikApiKey,
    apiKeyPrefix: opikApiKey.substring(0, 8) + '...'
  });
  
  try {
    const payload = {
      project_name: 'Vibesana',
      ...traceData,
    };
    
    console.log('Opik payload:', JSON.stringify(payload, null, 2));
    
    // Updated API endpoint - using the correct Opik API URL
    const response = await fetch('https://www.comet.com/api/v1/opik/traces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${opikApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Opik response status:', response.status);
    console.log('Opik response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Opik tracking failed with status:', response.status);
      console.error('Opik error response:', errorText);
    } else {
      const responseText = await response.text();
      console.log('Opik tracking successful:', responseText);
    }
  } catch (error) {
    console.error('Opik tracking failed with exception:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let traceId = crypto.randomUUID();

  try {
    const { description } = await req.json();

    if (!description) {
      throw new Error('Task description is required');
    }

    console.log('Processing task breakdown for:', description);

    // Track the start of the AI request
    await trackWithOpik({
      id: traceId,
      name: 'ai-task-breakdown',
      start_time: new Date().toISOString(),
      input: { description },
      tags: ['ai-task-breakdown', 'openai'],
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a project management expert. Break down user project descriptions into specific, actionable tasks. 

Return your response as a JSON array of task objects with this exact structure:
[
  {
    "title": "Task title (concise, actionable)",
    "description": "Detailed description of what needs to be done",
    "priority": "low" | "medium" | "high",
    "status": "todo"
  }
]

Guidelines:
- Create 5-10 tasks maximum
- Make tasks specific and actionable
- Use appropriate priority levels (high for critical path, medium for important, low for nice-to-have)
- All tasks should start with status "todo"
- Focus on technical implementation steps
- Order tasks logically (dependencies first)

Return only the JSON array, no additional text.`
          },
          {
            role: 'user',
            content: `Break down this project: ${description}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      
      // Track the error
      await trackWithOpik({
        id: traceId,
        end_time: new Date().toISOString(),
        output: { error: `OpenAI API error: ${response.status}` },
        tags: ['error', 'openai-api'],
      });
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse the JSON response from OpenAI
    let tasks;
    try {
      tasks = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback if JSON parsing fails
      tasks = [
        {
          title: "Review and plan project requirements",
          description: "Analyze the project description and create a detailed plan",
          priority: "high",
          status: "todo"
        },
        {
          title: "Set up development environment",
          description: "Configure tools, frameworks, and dependencies needed",
          priority: "high", 
          status: "todo"
        }
      ];
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Track the successful completion
    await trackWithOpik({
      id: traceId,
      end_time: new Date().toISOString(),
      output: { tasks, task_count: tasks.length },
      metadata: {
        duration_ms: duration,
        model: 'gpt-4o-mini',
        prompt_tokens: data.usage?.prompt_tokens,
        completion_tokens: data.usage?.completion_tokens,
      },
      tags: ['success', 'task-generation'],
    });

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-breakdown function:', error);
    
    // Track the error
    await trackWithOpik({
      id: traceId,
      end_time: new Date().toISOString(),
      output: { error: error.message },
      tags: ['error', 'function-error'],
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      tasks: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
