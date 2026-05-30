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
    const {
      full_name, email, password, mobile, address,
      date_of_birth, mode_of_training, skills, profile_image_url,
    } = await req.json();

    if (!full_name) {
      return new Response(
        JSON.stringify({ error: "Trainer name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required for trainer login" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create an auth user for the trainer with the provided password
    const createUserRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: "trainer" },
      }),
    });

    if (!createUserRes.ok) {
      const err = await createUserRes.json();
      return new Response(
        JSON.stringify({ error: err.msg || err.message || "Failed to create auth user for trainer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userData = await createUserRes.json();
    const userId = userData.id;

    // Set profile role to trainer
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        role: "trainer",
        full_name,
        email,
        phone: mobile || "",
        address: address || "",
        date_of_birth: date_of_birth || null,
        avatar_url: profile_image_url || "",
      }),
    });

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
        id: userId,
        full_name,
        email,
        mobile: mobile || "",
        address: address || "",
        date_of_birth: date_of_birth || null,
        mode_of_training: mode_of_training || "both",
        skills: skills || [],
        profile_image_url: profile_image_url || "",
      }),
    });

    if (!trainerRes.ok) {
      const err = await trainerRes.json();
      throw new Error(err.message || "Failed to create trainer profile");
    }

    const trainer = await trainerRes.json();

    return new Response(
      JSON.stringify({ success: true, trainer: trainer[0] || trainer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
