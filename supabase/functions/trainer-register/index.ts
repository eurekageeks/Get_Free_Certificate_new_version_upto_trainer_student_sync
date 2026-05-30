import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRAINER_ACCESS_CODE = Deno.env.get("TRAINER_ACCESS_CODE") || "SKILLFORGE_TRAINER_2024";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { trainer_code, user_id, full_name, email, mobile } = await req.json();

    if (!trainer_code || !user_id) {
      return new Response(
        JSON.stringify({ error: "Trainer code and user ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trainer_code !== TRAINER_ACCESS_CODE) {
      return new Response(
        JSON.stringify({ error: "Invalid trainer access code" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Update profile role to trainer
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ role: "trainer" }),
    });

    if (!profileRes.ok) {
      const err = await profileRes.json();
      throw new Error(err.message || "Failed to update profile role");
    }

    // Create trainer profile
    const trainerRes = await fetch(`${supabaseUrl}/rest/v1/trainers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: user_id,
        full_name: full_name || "",
        email: email || "",
        mobile: mobile || "",
        skills: [],
        mode_of_training: "both",
        bio: "",
      }),
    });

    if (!trainerRes.ok) {
      const err = await trainerRes.json();
      if (!err.message?.includes("duplicate") && !err.message?.includes("unique")) {
        throw new Error(err.message || "Failed to create trainer profile");
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Trainer role assigned" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
