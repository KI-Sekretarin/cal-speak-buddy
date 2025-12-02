import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation function
const validateInput = (body: any): string[] => {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Name ist erforderlich');
  } else if (body.name.length > 100) {
    errors.push('Name darf maximal 100 Zeichen lang sein');
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.push('E-Mail ist erforderlich');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Ungültige E-Mail-Adresse');
  } else if (body.email.length > 255) {
    errors.push('E-Mail darf maximal 255 Zeichen lang sein');
  }

  if (body.phone && (typeof body.phone !== 'string' || body.phone.length > 20)) {
    errors.push('Telefonnummer darf maximal 20 Zeichen lang sein');
  }

  if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length === 0) {
    errors.push('Betreff ist erforderlich');
  } else if (body.subject.length > 200) {
    errors.push('Betreff darf maximal 200 Zeichen lang sein');
  }

  if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
    errors.push('Nachricht ist erforderlich');
  } else if (body.message.length > 5000) {
    errors.push('Nachricht darf maximal 5000 Zeichen lang sein');
  }

  if (!body.user_id || typeof body.user_id !== 'string') {
    errors.push('User ID ist erforderlich');
  }

  return errors;
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

      // Validate input
      const validationErrors = validateInput(body);
      if (validationErrors.length > 0) {
        console.error("Validation errors:", validationErrors);
        return new Response(
          JSON.stringify({ error: validationErrors.join(', ') }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Sanitize input by trimming and limiting length
      const sanitizedData = {
        name: body.name.trim().substring(0, 100),
        email: body.email.trim().toLowerCase().substring(0, 255),
        phone: body.phone ? body.phone.trim().substring(0, 20) : null,
        subject: body.subject.trim().substring(0, 200),
        message: body.message.trim().substring(0, 5000),
        category: body.category || 'general',
        user_id: body.user_id,
      };

      const { data, error } = await supabaseClient
        .from('inquiries')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) throw error;

      // Trigger n8n webhook for AI categorization and response generation
      try {
        await fetch('https://kisekretaerin.app.n8n.cloud/webhook-test/new-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (webhookError) {
        console.error('n8n webhook error:', webhookError);
        // Continue even if webhook fails
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