import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = await createAdminSupabaseClient();

    // Delete user services
    await adminSupabase
      .from("user_services")
      .delete()
      .eq("user_id", user.id);

    // Delete user profile
    await adminSupabase.from("profiles").delete().eq("id", user.id);

    // Delete auth user
    const { error: deleteError } =
      await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
