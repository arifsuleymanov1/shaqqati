import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { phone_number, country_code, otp, full_name } =
      await request.json();

    if (!phone_number || !country_code || !otp || !full_name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const fullPhone = `${country_code}${phone_number}`;
    const supabase = await createAdminSupabaseClient();

    // Verify OTP from database
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone_number", fullPhone)
      .eq("auth_type", "phone")
      .eq("verified", false)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check OTP expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (otpRecord.otp_code !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await supabase
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Check if user exists with this phone number
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_number", fullPhone)
      .single();

    let userId: string;

    if (existingProfile) {
      // Existing user - sign them in
      userId = existingProfile.id;
    } else {
      // New user - create Supabase auth user + profile
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          phone: fullPhone,
          phone_confirm: true,
          user_metadata: {
            full_name,
            auth_provider: "phone",
          },
        });

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }

      userId = authData.user.id;

      // Create profile
      await supabase.from("profiles").insert({
        id: userId,
        phone_number: fullPhone,
        full_name,
        auth_provider: "phone",
        is_email_verified: false,
        is_agent: false,
      });
    }

    // Generate session token for the user
    // NOTE: In production, use a proper session mechanism.
    // This creates a magic link or custom token for the user.
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone_number}@phone.auth.local`, // Placeholder for phone auth
      });

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
      user_id: userId,
    });
  } catch (err) {
    console.error("Phone OTP verify error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
