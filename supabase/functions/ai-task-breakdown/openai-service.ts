
import { openAIApiKey } from "./config.ts";
import { Task } from "./types.ts";

export const generateTaskBreakdown = async (description: string): Promise<Task[]> => {
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
  let tasks: Task[];
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

  return tasks;
};
