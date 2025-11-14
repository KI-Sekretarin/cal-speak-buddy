import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendResponseRequest {
  responseId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { responseId }: SendResponseRequest = await req.json();

    if (!responseId) {
      throw new Error("responseId is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Verify user authentication and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Ungültige Authentifizierung" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the AI response with inquiry details
    const { data: response, error: responseError } = await supabaseClient
      .from("ai_responses")
      .select(`
        id,
        suggested_response,
        inquiry_id,
        inquiries (
          id,
          name,
          email,
          subject,
          message,
          user_id
        )
      `)
      .eq("id", responseId)
      .single();

    if (responseError || !response) {
      console.error("Error fetching response:", responseError);
      throw new Error("Antwort nicht gefunden");
    }

    const inquiry = response.inquiries as any;
    if (!inquiry || !inquiry.email) {
      throw new Error("Keine E-Mail-Adresse gefunden");
    }
    
    // Verify user owns this inquiry
    if (inquiry.user_id !== user.id) {
      console.error("User does not own inquiry");
      return new Response(
        JSON.stringify({ error: "Zugriff verweigert" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to ${inquiry.email} for inquiry ${inquiry.id}`);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "KI-Sekretärin <onboarding@resend.dev>",
      to: [inquiry.email],
      subject: `Re: ${inquiry.subject}`,
      html: `
        <h2>Antwort auf Ihre Anfrage</h2>
        <p>Hallo ${inquiry.name},</p>
        <p>vielen Dank für Ihre Anfrage. Hier ist unsere Antwort:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${response.suggested_response.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #666;">
          <strong>Ihre ursprüngliche Nachricht:</strong><br>
          ${inquiry.message.replace(/\n/g, '<br>')}
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">
          Mit freundlichen Grüßen,<br>
          Ihr KI-Sekretärin Team
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Mark response as sent
    const { error: updateError } = await supabaseClient
      .from("ai_responses")
      .update({
        sent_at: new Date().toISOString(),
        is_approved: true,
      })
      .eq("id", responseId);

    if (updateError) {
      console.error("Error updating response:", updateError);
      throw updateError;
    }

    // Also update inquiry status to 'closed'
    const { error: inquiryUpdateError } = await supabaseClient
      .from("inquiries")
      .update({
        status: "closed",
      })
      .eq("id", inquiry.id);

    if (inquiryUpdateError) {
      console.error("Error updating inquiry:", inquiryUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "E-Mail erfolgreich versendet",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-inquiry-response function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Ein Fehler ist aufgetreten",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
