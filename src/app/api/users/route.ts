import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/server";

// GET - Fetch all users for admin table
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "20");
    const search = searchParams.get("search") || "";

    const adminSupabase = await createAdminSupabaseClient();

    // Build query
    let query = adminSupabase
      .from("profiles")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`
      );
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Map to table row format with sequential IDs
    const users = (data || []).map((profile, index) => ({
      id: profile.id,
      sequential_id: from + index + 1,
      phone_number: profile.phone_number,
      email: profile.email,
      full_name: profile.full_name,
      is_agent: profile.is_agent,
    }));

    return NextResponse.json({
      success: true,
      data: users,
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
