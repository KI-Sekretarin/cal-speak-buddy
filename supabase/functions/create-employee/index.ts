
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        // 1. Check if the caller is authenticated
        const {
            data: { user: caller },
        } = await supabaseClient.auth.getUser();

        if (!caller) {
            throw new Error("Unauthorized");
        }

        const { email, password, name, role, skills, max_capacity } = await req.json();

        if (!email || !password || !name || !role) {
            throw new Error("Missing required fields");
        }

        // 2. Create the new user using the Service Role Key (Admin privileges)
        // We need a separate client for this with admin rights.
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: name },
        });

        if (createError) throw createError;
        if (!newUserData.user) throw new Error("Failed to create user");

        // 3. Insert into employee_profiles
        const { error: profileError } = await supabaseAdmin
            .from("employee_profiles")
            .insert({
                id: newUserData.user.id,
                employer_id: caller.id, // The caller is the employer
                full_name: name,
                role: role,
                skills: skills || [],
                max_capacity: max_capacity || 10
            });

        if (profileError) {
            // Cleanup: delete the user if profile creation fails? 
            // Ideally yes, but for now just throw.
            console.error("Failed to create profile, deleting user...", profileError);
            await supabaseAdmin.auth.admin.deleteUser(newUserData.user.id);
            throw profileError;
        }

        return new Response(
            JSON.stringify({ user: newUserData.user, message: "Employee created successfully" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
