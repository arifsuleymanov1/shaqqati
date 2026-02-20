import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/server";

// Helper to fetch full user data
async function getFullUserData(adminSupabase: any, id: string) {
  // Fetch profile
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError || !profile) return null;

  // Fetch user services
  const { data: services } = await adminSupabase
    .from("user_services")
    .select("*")
    .eq("user_id", id);

  // Fetch related metadata (city, service_area)
  let city = null;
  let serviceArea = null;

  if (profile.city_id) {
    const { data } = await adminSupabase
      .from("metadata")
      .select("*")
      .eq("id", profile.city_id)
      .single();
    city = data;
  }

  if (profile.service_area_id) {
    const { data } = await adminSupabase
      .from("metadata")
      .select("*")
      .eq("id", profile.service_area_id)
      .single();
    serviceArea = data;
  }

  return {
    ...profile,
    services: services || [],
    city,
    service_area: serviceArea,
  };
}

// GET - Fetch single user with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminSupabase = await createAdminSupabaseClient();
    const fullUser = await getFullUserData(adminSupabase, id);

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: fullUser,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminSupabase = await createAdminSupabaseClient();

    // Clean gender: if empty string or "null" string, set to null
    let gender = body.gender;
    if (gender === "" || gender === "null") gender = null;

    const { error } = await adminSupabase
      .from("profiles")
      .update({
        full_name: body.full_name,
        email: body.email,
        phone_number: body.phone_number,
        whatsapp_phone_number: body.whatsapp_phone_number,
        is_agent: body.is_agent,
        gender: gender,
        description: body.description,
        city_id: body.city_id || null,
        service_area_id: body.service_area_id || null,
        national_short_address: body.national_short_address,
        address: body.address,
        is_email_verified: body.is_email_verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }

    // Fetch the updated full user to return
    const updatedFullUser = await getFullUserData(adminSupabase, id);

    return NextResponse.json({
      success: true,
      data: updatedFullUser,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
