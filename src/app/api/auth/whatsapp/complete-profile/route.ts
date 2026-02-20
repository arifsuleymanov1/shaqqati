import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { full_name, whatsapp_phone_number } = await request.json();

        if (!full_name || !whatsapp_phone_number) {
            return NextResponse.json(
                { error: "Full name and phone number are required" },
                { status: 400 }
            );
        }

        // Get the authenticated user from the session
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Use admin client to upsert profile (bypasses RLS)
        const adminSupabase = await createAdminSupabaseClient();

        const { error: profileError } = await adminSupabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    whatsapp_phone_number: whatsapp_phone_number,
                    full_name,
                    auth_provider: "whatsapp",
                    is_email_verified: false,
                    is_agent: false,
                },
                { onConflict: "id" }
            );

        if (profileError) {
            console.error("Profile upsert error:", profileError);
            return NextResponse.json(
                { error: "Failed to create profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile created successfully",
        });
    } catch (err) {
        console.error("Complete profile error:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
