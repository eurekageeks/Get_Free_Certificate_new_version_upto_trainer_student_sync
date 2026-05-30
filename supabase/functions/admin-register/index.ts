import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

      const ADMIN_ACCESS_CODE = Deno.env.get("ADMIN_ACCESS_CODE") || "SKILLFORGE_ADMIN_2024";

      Deno.serve(async (req: Request) => {
       if (req.method === "OPTIONS") {
  return new Response("ok", {
    status: 200,
    headers: corsHeaders,
  });
}
                try {
                    const { admin_code, user_id } = await req.json();

                        if (!admin_code || !user_id) {
                              return new Response(
                                      JSON.stringify({ error: "Admin code and user ID are required" }),
                                              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                                    );
                                                        }

                                                            if (admin_code !== ADMIN_ACCESS_CODE) {
                                                                  return new Response(
                                                                          JSON.stringify({ error: "Invalid admin access code" }),
                                                                                  { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                                                                        );
                                                                                            }

                                                                                                // Use the service role to call the set_admin_role function
                                                                                                    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
                                                                                                        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

                                                                                                            const res = await fetch(`${supabaseUrl}/rest/v1/rpc/set_admin_role`, {
                                                                                                                  method: "POST",
                                                                                                                        headers: {
                                                                                                                                "Content-Type": "application/json",
                                                                                                                                        Authorization: `Bearer ${serviceRoleKey}`,
                                                                                                                                                apikey: serviceRoleKey,
                                                                                                                                                      },
                                                                                                                                                            body: JSON.stringify({ target_user_id: user_id }),
                                                                                                                                                                });

                                                                                                                                                                    if (!res.ok) {
                                                                                                                                                                          const err = await res.json();
                                                                                                                                                                                throw new Error(err.message || "Failed to set admin role");
                                                                                                                                                                                    }

                                                                                                                                                                                        return new Response(
                                                                                                                                                                                              JSON.stringify({ success: true, message: "Admin role assigned" }),
                                                                                                                                                                                                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                                                                                                                                                                                        );
                                                                                                                                                                                                          } catch (err) {
                                                                                                                                                                                                              return new Response(
                                                                                                                                                                                                                    JSON.stringify({ error: err.message || "Internal server error" }),
                                                                                                                                                                                                                          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                });
