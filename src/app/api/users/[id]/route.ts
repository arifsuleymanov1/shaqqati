import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/server";

// GET - Fetch single user with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = await createAdminSupabaseClient();

    // Fetch profile
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user services
    const { data: services } = await adminSupabase
      .from("user_services")
      .select("*")
      .eq("user_id", params.id);

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

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        services: services || [],
        city,
        service_area: serviceArea,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
