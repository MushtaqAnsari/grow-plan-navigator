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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating financial model for prompt:', prompt);

    const systemPrompt = `You are a financial modeling expert. Based on the user's description, generate a comprehensive financial model with realistic data. Return ONLY a valid JSON object with the following structure:

{
  "companyData": {
    "companyName": "string",
    "industry": "string"
  },
  "revenueStreams": [
    {
      "name": "string",
      "year1": number,
      "year2": number,
      "year3": number,
      "year4": number,
      "year5": number
    }
  ],
  "costStructures": [
    {
      "name": "string", 
      "year1": number,
      "year2": number,
      "year3": number,
      "year4": number,
      "year5": number
    }
  ],
  "operationalExpenses": [
    {
      "name": "string",
      "year1": number,
      "year2": number,
      "year3": number,
      "year4": number,
      "year5": number
    }
  ],
  "employeePlanning": [
    {
      "role": "string",
      "year1": number,
      "year2": number,
      "year3": number,
      "year4": number,
      "year5": number,
      "salary_per_employee": number
    }
  ],
  "capTableStakeholders": [
    {
      "name": "string",
      "type": "founder|investor|employee",
      "shares": number,
      "investment_amount": number,
      "share_class": "common|preferred"
    }
  ],
  "fundUtilization": [
    {
      "category": "string",
      "description": "string",
      "amount": number,
      "percentage": number,
      "timeline": "year1|year2|year3|year4|year5"
    }
  ],
  "taxation": {
    "corporate_tax_rate": number,
    "income_tax_rate": number,
    "vat_rate": number,
    "income_tax_enabled": boolean,
    "zakat_enabled": boolean
  }
}

Make sure all numbers are realistic and consistent. Use growth rates that make sense for the industry and company stage.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let financialData;
    try {
      financialData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', generatedContent);
      throw new Error('Failed to parse generated financial data');
    }

    return new Response(JSON.stringify({ financialData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-financial-model function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});