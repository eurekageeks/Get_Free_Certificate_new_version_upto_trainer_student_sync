import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, course_id, enrollment_id } = await req.json();

    if (!razorpay_order_id || !user_id || !course_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    let isVerified = false;

    if (RAZORPAY_KEY_SECRET && razorpay_signature) {
      // Verify signature using Web Crypto API
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(RAZORPAY_KEY_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const message = `${razorpay_order_id}|${razorpay_payment_id}`;
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
      const expectedSig = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      isVerified = expectedSig === razorpay_signature;
    } else {
      // Demo mode: auto-verify
      isVerified = true;
    }

    if (!isVerified) {
      // Mark payment as failed
      await fetch(`${supabaseUrl}/rest/v1/payments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status: "failed" }),
      });

      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment status
    const paymentUpdate: Record<string, string> = {
      status: "completed",
    };
    if (razorpay_payment_id) paymentUpdate.razorpay_payment_id = razorpay_payment_id;

    await fetch(`${supabaseUrl}/rest/v1/payments?razorpay_order_id=eq.${razorpay_order_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(paymentUpdate),
    });

    // Create enrollment if not exists
    if (enrollment_id) {
      await fetch(`${supabaseUrl}/rest/v1/enrollments?id=eq.${enrollment_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ status: "active", progress: 0 }),
      });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          user_id,
          course_id,
          status: "active",
          progress: 0,
        }),
      });
    }

    // Send enrollment and payment confirmation notifications (email + WhatsApp)
    try {
      const [profileRes, courseRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=full_name,email,phone`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        }),
        fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${course_id}&select=title`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        }),
      ]);

      const profileData = (await profileRes.json())?.[0];
      const courseData = (await courseRes.json())?.[0];
      const studentName = profileData?.full_name || "Student";
      const studentEmail = profileData?.email || "";
      const studentPhone = profileData?.phone || "";
      const courseTitle = courseData?.title || "Course";

      // Send notifications via the send-notification function
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          user_id,
          type: "enrollment",
          event: "enrollment_confirmation",
          recipient: studentEmail,
          title: `Enrollment Confirmed - ${courseTitle}`,
          message: `Hi ${studentName},\n\nYour enrollment in "${courseTitle}" has been confirmed! You now have full access to the course content. Complete the course at your own pace and earn a verified certificate.\n\nWelcome to SkillForge!`,
          channel: "email",
        }),
      });

      if (studentPhone) {
        await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({
            user_id,
            type: "payment",
            event: "payment_success",
            recipient: studentPhone,
            title: "Payment Successful",
            message: `Hi ${studentName}, your payment for "${courseTitle}" was successful. You are now enrolled! Start learning at SkillForge.`,
            channel: "whatsapp",
          }),
        });
      }
    } catch (notifyErr) {
      // Notification failure should not block the enrollment response
      console.error("Notification error:", notifyErr);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and enrollment activated" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
