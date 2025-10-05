import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, canvasSize } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `You are an email template design expert. Generate a JSON structure for visual elements based on the user's prompt.

Canvas size: ${canvasSize.width}x${canvasSize.height}px

Return ONLY valid JSON matching this schema:
{
  "elements": [
    {
      "type": "text" | "image" | "shape" | "button",
      "content": "text content (for text/button only)",
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "style": {
        "fontSize": number,
        "fontWeight": "400" | "500" | "600" | "700",
        "color": "#hexcolor",
        "textAlign": "left" | "center" | "right",
        "fontFamily": "Inter, sans-serif",
        "backgroundColor": "#hexcolor (shapes/buttons)",
        "shapeType": "rectangle" | "circle" (shapes only),
        "borderRadius": number (shapes/buttons),
        "src": "https://placeholder-url (images only)"
      }
    }
  ]
}

Guidelines:
- Position elements within canvas bounds
- Use readable font sizes (14-24px for body, 28-48px for headers)
- Ensure good color contrast
- Text elements default width: 200-400px, height: auto
- Images: reasonable sizes (200x200 - 600x400)
- Buttons: 120-200px wide, 40-50px tall
- Use professional color schemes`;

    console.log('Calling OpenAI with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

    let generatedText = data.choices[0].message.content;
    
    // Clean up the response
    generatedText = generatedText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Fix common JSON issues from AI responses
    generatedText = generatedText.replace(/:\s*auto\s*([,}])/g, ': 100$1'); // Replace unquoted 'auto' with numeric value
    
    let design;
    try {
      design = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Normalize the design structure
    const normalizedElements = (design.elements || []).map((element: any) => ({
      id: crypto.randomUUID(),
      type: element.type,
      content: element.content || '',
      position: element.position || { x: 0, y: 0 },
      size: element.size || { width: 100, height: 100 },
      style: {
        fontSize: element.style?.fontSize || 16,
        fontWeight: element.style?.fontWeight || "400",
        color: element.style?.color || "#000000",
        textAlign: element.style?.textAlign || "left",
        fontFamily: element.style?.fontFamily || "Inter, sans-serif",
        backgroundColor: element.style?.backgroundColor,
        shapeType: element.style?.shapeType,
        borderRadius: element.style?.borderRadius,
        src: element.style?.src,
      },
      zIndex: 0,
    }));

    return new Response(
      JSON.stringify({ elements: normalizedElements }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in design-with-ai:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
