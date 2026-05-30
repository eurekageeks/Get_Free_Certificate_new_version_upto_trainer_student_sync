import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { user_id, type, event, recipient, title, message, channel } = await req.json();

    if (!user_id || !event) {
      return new Response(
        JSON.stringify({ error: "user_id and event are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const channels: string[] = channel ? [channel] : ["email", "whatsapp"];
    const results: { channel: string; status: string; error?: string }[] = [];

    for (const ch of channels) {
      let deliveryStatus = "pending";
      let deliveryError = "";

      try {
        if (ch === "email") {
          // Send email via Supabase built-in or external SMTP
          // For now, log the notification and mark as sent
          // In production, integrate with Resend, SendGrid, or similar
          const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

          if (RESEND_API_KEY) {
            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "SkillForge <noreply@skillforge.io>",
                to: recipient || "student@skillforge.io",
                subject: title || "SkillForge Notification",
                html: `
                  <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0d9488, #059669); padding: 32px; border-radius: 12px 12px 0 0;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">SkillForge</h1>
                    </div>
                    <div style="padding: 32px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                      <h2 style="color: #111827; margin: 0 0 16px;">${title || "Notification"}</h2>
                      <p style="color: #4b5563; line-height: 1.6;">${message || ""}</p>
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                      <p style="color: #9ca3af; font-size: 12px;">SkillForge - Free Training + Certification</p>
                    </div>
                  </div>
                `,
              }),
            });

            if (emailRes.ok) {
              deliveryStatus = "sent";
            } else {
              const err = await emailRes.json();
              deliveryError = err.message || "Email send failed";
              deliveryStatus = "failed";
            }
          } else {
            // Demo mode - mark as sent
            deliveryStatus = "sent";
          }
        } else if (ch === "whatsapp") {
          // Send WhatsApp notification
          // In production, integrate with WhatsApp Business API or Twilio
          const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
          const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
          const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

          if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && recipient) {
            const twilioRes = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
                },
                body: new URLSearchParams({
                  From: TWILIO_WHATSAPP_FROM,
                  To: `whatsapp:${recipient}`,
                  Body: `*SkillForge* - ${title || "Notification"}\n\n${message || ""}`,
                }),
              }
            );

            if (twilioRes.ok) {
              deliveryStatus = "sent";
            } else {
              const err = await twilioRes.json();
              deliveryError = err.message || "WhatsApp send failed";
              deliveryStatus = "failed";
            }
          } else {
            // Demo mode - mark as sent
            deliveryStatus = "sent";
          }
        } else if (ch === "in_app") {
          deliveryStatus = "sent";
        }
      } catch (err) {
        deliveryStatus = "failed";
        deliveryError = err.message || "Unknown error";
      }

      // Log notification
      await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({
          user_id,
          type: type || event,
          channel: ch,
          title: title || "",
          message: message || "",
          event,
          recipient: recipient || "",
          delivery_status: deliveryStatus,
          read: false,
        }),
      });

      results.push({
        channel: ch,
        status: deliveryStatus,
        ...(deliveryError ? { error: deliveryError } : {}),
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
