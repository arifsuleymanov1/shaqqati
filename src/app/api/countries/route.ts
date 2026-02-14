import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/server";
import { countrySchema } from "@/lib/validations";

// GET - Fetch all active countries (public)
export async function GET() {
  try {
    const supabase = await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("name_en", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch countries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST - Create a new country (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is super admin
    const body = await request.json();
    const result = countrySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const adminSupabase = await createAdminSupabaseClient();

    const { data, error } = await adminSupabase
      .from("countries")
      .insert({
        ...result.data,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A country with this code already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create country" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
