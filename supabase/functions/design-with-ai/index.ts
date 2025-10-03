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
    
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const model = Deno.env.get('LLM_MODEL') || 'google/gemini-2.5-flash';
    
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an email template design assistant. Generate a JSON template for an email design based on the user's request.

CANVAS SIZE: ${canvasSize.width}x${canvasSize.height}px (${canvasSize.width <= 375 ? 'mobile' : canvasSize.width <= 768 ? 'tablet' : 'desktop'})

AVAILABLE COMPONENTS:
1. TEXT: Display text content
   - Properties: content (string), fontSize (number), fontWeight (string), color (hex), textAlign (left/center/right), fontFamily (optional)
   
2. IMAGE: Display images
   - Properties: src (URL string), alt (string), objectFit (contain/cover/fill), objectPosition (center/top/bottom/left/right/top left/top right/bottom left/bottom right), borderRadius (number)
   
3. SHAPE: Rectangles or circles for backgrounds/decoration
   - Properties: shapeType (rectangle/circle), backgroundColor (hex), borderColor (hex), borderWidth (number), borderRadius (number)
   
4. BUTTON: Clickable buttons with links
   - Properties: text (string), href (URL), backgroundColor (hex), color (hex), fontSize (number), borderRadius (number), paddingX (number), paddingY (number)

RULES:
- Position elements using x, y coordinates (in pixels from top-left)
- Size elements using width, height (in pixels)
- All elements have a zIndex (higher = on top)
- Colors must be hex format (#RRGGBB)
- Keep designs within canvas bounds
- Use appropriate spacing and alignment
- Consider mobile-first design for narrow canvases

Return ONLY valid JSON in this exact format:
{
  "elements": [
    {
      "id": "unique-id",
      "type": "text|image|shape|button",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 100, "height": 50 },
      "zIndex": 1,
      ... type-specific properties
    }
  ]
}`;

    console.log('Calling LLM with model:', model);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LLM API error:', response.status, error);
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    let generatedContent = data.choices?.[0]?.message?.content ?? '';
    
    console.log('Generated design:', generatedContent);
    
    // Normalize to raw JSON (strip code fences and extract JSON block if needed)
    const sanitizeToJson = (text: string) => {
      try {
        return JSON.parse(text);
      } catch (_) {
        // Try fenced block ```json ... ``` or ``` ... ```
        const fenceMatch = text.match(/```(?:json)?\n([\s\S]*?)```/i);
        if (fenceMatch?.[1]) {
          const inner = fenceMatch[1].trim();
          try { return JSON.parse(inner); } catch (_) { /* continue */ }
        }
        // Fallback: take substring from first { to last }
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          const slice = text.slice(first, last + 1);
          return JSON.parse(slice);
        }
        throw new Error('Model did not return valid JSON.');
      }
    };

    const design = sanitizeToJson(generatedContent);

    // Normalize to app schema
    const normalizeBase = (el: any) => ({
      id: String(el.id || crypto.randomUUID()),
      type: el.type,
      position: el.position ?? { x: 0, y: 0 },
      size: el.size ?? { width: 100, height: 50 },
      zIndex: typeof el.zIndex === 'number' ? el.zIndex : 1,
    });

    const normalizedElements = Array.isArray(design?.elements) ? design.elements.map((el: any) => {
      const base = normalizeBase(el);
      switch (el.type) {
        case 'text':
          return {
            ...base,
            type: 'text',
            content: el.content ?? '',
            style: {
              fontSize: el.style?.fontSize ?? el.fontSize ?? 16,
              fontWeight: el.style?.fontWeight ?? el.fontWeight ?? 'normal',
              color: el.style?.color ?? el.color ?? '#000000',
              textAlign: el.style?.textAlign ?? el.textAlign ?? 'left',
              fontFamily: el.style?.fontFamily ?? el.fontFamily,
            },
          };
        case 'image':
          return {
            ...base,
            type: 'image',
            src: el.src ?? '',
            alt: el.alt ?? '',
            style: {
              objectFit: el.style?.objectFit ?? el.objectFit ?? 'cover',
              objectPosition: el.style?.objectPosition ?? el.objectPosition ?? 'center',
              borderRadius: el.style?.borderRadius ?? el.borderRadius ?? 0,
            },
          };
        case 'shape':
          return {
            ...base,
            type: 'shape',
            shapeType: el.shapeType ?? 'rectangle',
            style: {
              backgroundColor: el.style?.backgroundColor ?? el.backgroundColor ?? '#FFFFFF',
              borderColor: el.style?.borderColor ?? el.borderColor ?? '#000000',
              borderWidth: el.style?.borderWidth ?? el.borderWidth ?? 0,
              borderRadius: el.style?.borderRadius ?? el.borderRadius ?? 0,
            },
          };
        case 'button':
          return {
            ...base,
            type: 'button',
            text: el.text ?? 'Click',
            href: el.href ?? '#',
            style: {
              backgroundColor: el.style?.backgroundColor ?? el.backgroundColor ?? '#000000',
              color: el.style?.color ?? el.color ?? '#FFFFFF',
              fontSize: el.style?.fontSize ?? el.fontSize ?? 16,
              borderRadius: el.style?.borderRadius ?? el.borderRadius ?? 6,
              paddingX: el.style?.paddingX ?? el.paddingX ?? 12,
              paddingY: el.style?.paddingY ?? el.paddingY ?? 8,
            },
          };
        default:
          return base; // unknown types pass-through
      }
    }) : [];

    const appDesign = { elements: normalizedElements };

    return new Response(JSON.stringify(appDesign), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in design-with-ai function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
