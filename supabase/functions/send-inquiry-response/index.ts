import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import nodemailer from "npm:nodemailer@6.9.7";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// SMTP Configuration
const smtpConfig = {
  host: Deno.env.get("SMTP_HOST"),
  port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
  secure: Deno.env.get("SMTP_SECURE") === "true", // true for 465, false for other ports
  auth: {
    user: Deno.env.get("SMTP_USER"),
    pass: Deno.env.get("SMTP_PASS"),
  },
};

const useSmtp = smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass;

// HTML escape function to prevent XSS attacks
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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

    // Fetch user profile for company details
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    console.log(`Sending email to ${inquiry.email} for inquiry ${inquiry.id}`);

    const companyName = profile?.company_name || "Ihr Unternehmen";
    const logoUrl = profile?.logo_url;
    const website = profile?.website;
    const phone = profile?.phone;
    const address = [
      profile?.street,
      profile?.street_number,
      profile?.postal_code,
      profile?.city
    ].filter(Boolean).join(" ");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-height: 80px; max-width: 200px; }
          .content { background-color: #ffffff; padding: 20px; }
          .response-box { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0; border-radius: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
          .original-message { margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${escapeHtml(companyName)}" class="logo">` : `<h2>${escapeHtml(companyName)}</h2>`}
          </div>

          <div class="content">
            <div class="response-box">
              ${escapeHtml(response.suggested_response).replace(/\n/g, '<br>')}
            </div>
          </div>

          <div class="footer">
            <p>
              <strong>${escapeHtml(companyName)}</strong><br>
              ${address ? escapeHtml(address) + '<br>' : ''}
              ${phone ? 'Tel: ' + escapeHtml(phone) + '<br>' : ''}
              ${website ? `<a href="${escapeHtml(website)}">${escapeHtml(website)}</a>` : ''}
            </p>
          </div>

          <div class="original-message">
            <strong>Ihre ursprüngliche Nachricht vom ${new Date().toLocaleDateString('de-DE')}:</strong><br>
            <em>${escapeHtml(inquiry.message).replace(/\n/g, '<br>')}</em>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSubject = `Re: ${escapeHtml(inquiry.subject)}`;
    const fromAddress = Deno.env.get("SMTP_FROM") || `${companyName} <noreply@example.com>`;

    let emailResult;

    if (useSmtp) {
      console.log("Using SMTP for email delivery...");
      const transporter = nodemailer.createTransport(smtpConfig);

      // Verify connection configuration
      await new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
          if (error) {
            console.error("SMTP Verify Error:", error);
            reject(error);
          } else {
            console.log("Server is ready to take our messages");
            resolve(success);
          }
        });
      });

      emailResult = await transporter.sendMail({
        from: fromAddress,
        to: inquiry.email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log("SMTP Email sent:", emailResult.messageId);

    } else if (resend) {
      console.log("Using Resend for email delivery...");
      emailResult = await resend.emails.send({
        from: "KI-Sekretärin <onboarding@resend.dev>",
        to: [inquiry.email],
        subject: emailSubject,
        html: emailHtml,
      });
      console.log("Resend Email sent:", emailResult);
    } else {
      throw new Error("No email provider configured (SMTP or Resend)");
    }

    console.log("Email sent successfully");

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
