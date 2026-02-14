"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Database, ArrowLeft, Globe } from "lucide-react";

const navItems = [
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/metadata", label: "Metadata", icon: Database },
  { href: "/admin/countries", label: "Countries", icon: Globe },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-surface-200 flex flex-col">
        <div className="p-4 border-b border-surface-200">
          <h2 className="font-bold text-lg text-surface-900">Super Admin</h2>
          <p className="text-xs text-surface-500">Management Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-surface-200">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
