import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { registerEmailSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input (without confirm_password for API)
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

    const supabase = await createAdminSupabaseClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name,
        auth_provider: "email",
      },
    });

    if (authError) {
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
      const { error: profileError } = await supabase
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

      // Generate verification link and send via Resend
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "signup",
          email,
          password,
        });

      if (linkData?.properties?.action_link) {
        // Replace Supabase URL with our app URL for the callback
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verificationUrl = `${appUrl}/auth/verify-email?token_hash=${encodeURIComponent(
          linkData.properties.hashed_token
        )}&type=signup`;

        await sendVerificationEmail(email, verificationUrl);
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
