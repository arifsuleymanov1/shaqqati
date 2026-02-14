"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { UserWithServices } from "@/types";
import { ArrowLeft, User, Mail, Phone, MapPin, Building } from "lucide-react";

export default function AdminUserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<UserWithServices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-surface-500">User not found</p>
        <Link
          href="/admin/users"
          className="text-brand-600 hover:text-brand-700 text-sm mt-2 inline-block"
        >
          ← Back to users
        </Link>
      </div>
    );
  }

  const fields = [
    {
      label: "Full Name",
      value: user.full_name,
      icon: User,
      required: true,
    },
    {
      label: "Email",
      value: user.email,
      icon: Mail,
      required: user.auth_provider === "email" || user.auth_provider === "google",
    },
    {
      label: "Phone Number",
      value: user.phone_number,
      icon: Phone,
      required: user.auth_provider === "phone",
    },
    {
      label: "WhatsApp Phone",
      value: user.whatsapp_phone_number,
      icon: Phone,
      required: user.auth_provider === "whatsapp",
    },
    {
      label: "Services",
      value:
        user.services?.length > 0
          ? user.services.map((s) => s.service_name).join(", ")
          : null,
      icon: Building,
      required: false,
    },
    {
      label: "City",
      value: user.city?.name_en,
      icon: MapPin,
      required: false,
    },
    {
      label: "Service Area",
      value: user.service_area?.name_en,
      icon: MapPin,
      required: false,
    },
    {
      label: "National Short Address",
      value: user.national_short_address,
      icon: MapPin,
      required: false,
    },
    {
      label: "Address",
      value: user.address,
      icon: MapPin,
      required: false,
    },
    {
      label: "Gender",
      value: user.gender
        ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
        : null,
      icon: User,
      required: false,
    },
    {
      label: "Description",
      value: user.description,
      icon: User,
      required: false,
    },
  ];

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 mb-6"
      >
        <ArrowLeft size={14} />
        Back to Users
      </Link>

      <div className="flex items-center gap-4 mb-6">
        {user.image_url ? (
          <img
            src={user.image_url}
            alt={user.full_name}
            className="w-16 h-16 rounded-full object-cover border-2 border-surface-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {user.full_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-surface-500">
              Auth: {user.auth_provider}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.is_agent
                  ? "bg-green-100 text-green-700"
                  : "bg-surface-100 text-surface-500"
              }`}
            >
              {user.is_agent ? "Agent" : "User"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="divide-y divide-surface-100">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-start px-6 py-4">
                <div className="flex items-center gap-3 w-56 flex-shrink-0">
                  <Icon size={16} className="text-surface-400" />
                  <span className="text-sm font-medium text-surface-600">
                    {field.label}
                  </span>
                </div>
                <div className="flex-1">
                  {field.value ? (
                    <span className="text-sm text-surface-900">
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-sm text-surface-400 italic">
                      {field.required ? "Not provided" : "—"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
