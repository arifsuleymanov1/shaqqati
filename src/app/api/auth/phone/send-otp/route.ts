import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendSMSOTP, generateOTP } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { phone_number, country_code, full_name } = await request.json();

    if (!phone_number || !country_code || !full_name) {
      return NextResponse.json(
        { error: "Phone number, country code, and full name are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminSupabaseClient();

    // Validate country exists and check phone length
    const { data: country, error: countryError } = await supabase
      .from("countries")
      .select("*")
      .eq("country_code", country_code)
      .eq("is_active", true)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { error: "Invalid or inactive country" },
        { status: 400 }
      );
    }

    if (phone_number.length !== country.phone_validation_length) {
      return NextResponse.json(
        {
          error: `Phone number must be exactly ${country.phone_validation_length} digits`,
        },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const fullPhone = `${country_code}${phone_number}`;

    // Store OTP in database with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: otpError } = await supabase.from("otp_codes").upsert(
      {
        phone_number: fullPhone,
        otp_code: otp,
        expires_at: expiresAt,
        verified: false,
        auth_type: "phone",
      },
      { onConflict: "phone_number,auth_type" }
    );

    if (otpError) {
      console.error("OTP storage error:", otpError);
      return NextResponse.json(
        { error: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP via SMS gateway
    const smsResult = await sendSMSOTP(phone_number, country_code, otp);

    if (!smsResult.success) {
      return NextResponse.json(
        { error: "Failed to send SMS. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Phone OTP send error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
