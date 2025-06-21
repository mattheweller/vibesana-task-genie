
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();

    if (!description) {
      throw new Error('Task description is required');
    }

    console.log('Processing task breakdown for:', description);

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

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-breakdown function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      tasks: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
