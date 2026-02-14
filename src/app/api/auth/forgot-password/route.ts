import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const supabase = await createAdminSupabaseClient();

    // Check if user exists and signed via email (not google)
    const { data: profile } = await supabase
      .from("profiles")
      .select("auth_provider")
      .eq("email", email)
      .single();

    if (!profile) {
      // Don't reveal whether email exists
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    if (profile.auth_provider === "google") {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate password reset link
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
      });

    if (linkData?.properties?.action_link) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/auth/reset-password?token_hash=${encodeURIComponent(
        linkData.properties.hashed_token
      )}&type=recovery`;

      await sendPasswordResetEmail(email, resetUrl);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
