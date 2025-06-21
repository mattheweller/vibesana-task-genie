
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
export const opikApiKey = Deno.env.get('OPIK_API_KEY');
