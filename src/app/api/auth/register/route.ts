import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { registerEmailSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, password, full_name } = body;
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = registerEmailSchema.safeParse({
      email,
      password,
      full_name,
      confirm_password: password,
    });

    if (!passwordCheck.success) {
      const firstError = passwordCheck.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    // Use signUp — Supabase will send verification email via its SMTP settings
    const supabase = await createServerSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          auth_provider: "email",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Auth signUp error:", authError.message, authError);
      if (authError.message.includes("already")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user profile in profiles table
    if (authData.user) {
      const adminSupabase = await createAdminSupabaseClient();
      const { error: profileError } = await adminSupabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email,
          full_name,
          auth_provider: "email",
          is_email_verified: false,
          is_agent: false,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

