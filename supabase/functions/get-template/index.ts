import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Received request to get-template');

    // Get shortcode from query parameters
    const url = new URL(req.url);
    const shortcode = url.searchParams.get('shortcode');

    if (!shortcode) {
      console.error('No shortcode provided');
      return new Response(
        JSON.stringify({ error: 'Missing shortcode parameter' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Fetching template with shortcode: ${shortcode}`);

    // Query the email_templates table from callista schema
    const { data, error } = await supabase
      .from('callista.email_templates')
      .select('html')
      .eq('api_shortcode', shortcode)
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Template not found' }), 
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch template' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Successfully fetched template HTML`);

    // Return the HTML directly
    return new Response(
      data.html, 
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8' 
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error in get-template function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
