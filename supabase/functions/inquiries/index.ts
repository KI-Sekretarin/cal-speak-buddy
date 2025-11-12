import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const lastSegment = pathParts[pathParts.length - 1];
    
    // Check if last segment is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const id = uuidRegex.test(lastSegment) ? lastSegment : null;

    // GET all inquiries
    if (req.method === 'GET' && !id) {
      const { data, error } = await supabaseClient
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET single inquiry
    if (req.method === 'GET' && id) {
      const { data, error } = await supabaseClient
        .from('inquiries')
        .select('*, ai_responses(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST new inquiry
    if (req.method === 'POST') {
      const body = await req.json();
      
      const { data, error } = await supabaseClient
        .from('inquiries')
        .insert({
          name: body.name,
          email: body.email,
          subject: body.subject,
          message: body.message,
          category: body.category || 'general',
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n webhook
      try {
        await fetch('https://kisekretaerin.app.n8n.cloud/webhook-test/new-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT update inquiry
    if (req.method === 'PUT' && id) {
      const body = await req.json();
      
      const { data, error } = await supabaseClient
        .from('inquiries')
        .update({
          status: body.status,
          ai_category: body.ai_category,
          ai_response: body.ai_response,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});