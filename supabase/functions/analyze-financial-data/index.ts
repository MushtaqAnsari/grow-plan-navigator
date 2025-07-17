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
    const { financialData } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a comprehensive financial summary for analysis
    const summary = `
Financial Model Analysis:
- Company: ${financialData.company?.name || 'Not specified'}
- Industry: ${financialData.company?.industry || 'Not specified'}
- Revenue Streams: ${financialData.revenueStreams?.length || 0} streams
- Total Year 1 Revenue: $${financialData.revenueStreams?.reduce((sum: number, stream: any) => sum + (stream.year1 || 0), 0).toLocaleString()}
- Total Year 2 Revenue: $${financialData.revenueStreams?.reduce((sum: number, stream: any) => sum + (stream.year2 || 0), 0).toLocaleString()}
- Total Year 3 Revenue: $${financialData.revenueStreams?.reduce((sum: number, stream: any) => sum + (stream.year3 || 0), 0).toLocaleString()}

Key Financial Metrics:
- Employee Count: ${financialData.costs?.team?.employees?.length || 0}
- Consultant Count: ${financialData.costs?.team?.consultants?.length || 0}
- Fixed Assets: ${financialData.fixedAssets?.assets?.length || 0} assets
- Funding Rounds: ${financialData.capTable?.stakeholders?.filter((s: any) => s.type === 'investor')?.length || 0}
`;

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
            content: 'You are a financial advisor and business analyst. Provide concise, actionable insights about this financial model. Focus on key risks, opportunities, and strategic recommendations. Limit your response to 3-4 bullet points.' 
          },
          { role: 'user', content: `Analyze this financial model and provide strategic insights:\n\n${summary}` }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-financial-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});