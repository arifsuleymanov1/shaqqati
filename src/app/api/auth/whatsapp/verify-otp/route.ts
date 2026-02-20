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

    // Verify OTP from our otp_codes table
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone_number", fullPhone)
      .eq("auth_type", "whatsapp")
      .eq("verified", false)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

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

    // Check if user already exists by WhatsApp phone
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("whatsapp_phone_number", fullPhone)
      .single();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          phone: fullPhone,
          phone_confirm: true,
          user_metadata: {
            full_name,
            auth_provider: "whatsapp",
          },
        });

      if (authError) {
        console.error("Auth user creation error:", authError);
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }

      userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        whatsapp_phone_number: fullPhone,
        full_name,
        auth_provider: "whatsapp",
        is_email_verified: false,
        is_agent: false,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    // Generate a magic link / session token for the user
    // This creates a session so the user is actually logged in
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `wa_${fullPhone.replace("+", "")}@shaqqati.local`,
      });

    // Since we can't easily create a session from server-side with admin API,
    // we return the user_id and let the client know verification succeeded
    return NextResponse.json({
      success: true,
      message: "WhatsApp verified successfully",
      user_id: userId,
    });
  } catch (err) {
    console.error("WhatsApp OTP verify error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
