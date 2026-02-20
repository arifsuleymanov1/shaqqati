import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-700">
            RealEstate Platform
          </h1>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/account/settings"
                  className="text-sm text-surface-600 hover:text-surface-900 transition-colors"
                >
                  Account Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className="text-sm text-surface-600 hover:text-surface-900 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Welcome to RealEstate Platform
          </h2>
          <p className="text-surface-600 max-w-xl mx-auto">
            {user
              ? `You are signed in as ${user.email || user.phone || "user"}. Explore properties and manage your account.`
              : "Sign in or create an account to list properties and explore real estate."}
          </p>
        </div>
      </main>
    </div>
  );
}
