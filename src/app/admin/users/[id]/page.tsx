"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { UserWithServices } from "@/types";
import { ArrowLeft, User, Mail, Phone, MapPin, Building, Edit2, Check, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserWithServices | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          setFormData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchUser();
  }, [params.id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setFormData(data.data);
        setIsEditing(false);
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("An error occurred while updating");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin h-8 w-8 text-brand-600" />
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
    { key: "full_name", label: "Full Name", icon: User, type: "text" },
    { key: "email", label: "Email", icon: Mail, type: "email" },
    { key: "phone_number", label: "Phone Number", icon: Phone, type: "text" },
    { key: "whatsapp_phone_number", label: "WhatsApp Phone", icon: Phone, type: "text" },
    {
      key: "is_agent", label: "Is Agent", icon: Building, type: "select", options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" }
      ]
    },
    {
      key: "is_email_verified", label: "Email Verified", icon: Check, type: "select", options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" }
      ]
    },
    {
      key: "gender", label: "Gender", icon: User, type: "select", options: [
        { label: "Not Specified", value: "" },
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" }
      ]
    },
    { key: "national_short_address", label: "Short Address", icon: MapPin, type: "text" },
    { key: "address", label: "Full Address", icon: MapPin, type: "text" },
    { key: "description", label: "Description", icon: User, type: "textarea" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>

        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setFormData(user);
              }}
              icon={<X size={14} />}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            icon={<Edit2 size={14} />}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        {user.image_url ? (
          <img
            src={user.image_url}
            alt={user.full_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-surface-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {isEditing ? `Editing: ${user.full_name}` : user.full_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-surface-500">
              Auth: {user.auth_provider}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.is_agent
                ? "bg-green-100 text-green-700"
                : "bg-surface-100 text-surface-500"
                }`}
            >
              {user.is_agent ? "Agent" : "User"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden px-6 py-4">
        <div className="grid grid-cols-1 gap-6">
          {fields.map((field) => {
            const Icon = field.icon;
            const value = isEditing ? (formData as any)[field.key] : (user as any)[field.key];

            return (
              <div key={field.key} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0 border-b border-surface-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 w-56 flex-shrink-0 pt-2">
                  <Icon size={16} className="text-surface-400" />
                  <span className="text-sm font-medium text-surface-600">
                    {field.label}
                  </span>
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    field.type === "select" ? (
                      <Select
                        options={field.options || []}
                        value={(formData as any)[field.key] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isBoolean = field.key === 'is_agent' || field.key === 'is_email_verified';
                          setFormData({ ...formData, [field.key]: isBoolean ? val === 'true' : val });
                        }}
                      />
                    ) : field.type === "textarea" ? (
                      <textarea
                        className="w-full px-4 py-2 rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all min-h-[100px]"
                        value={(formData as any)[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={(formData as any)[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )
                  ) : (
                    <div className="pt-2">
                      {field.type === "select" && (field.key === "is_agent" || field.key === "is_email_verified") ? (
                        <span className={`text-sm ${(user as any)[field.key] ? "text-green-600 font-medium" : "text-surface-900"}`}>
                          {(user as any)[field.key] ? "Yes" : "No"}
                        </span>
                      ) : field.key === "gender" ? (
                        <span className="text-sm text-surface-900 capitalize">
                          {(user as any).gender || "—"}
                        </span>
                      ) : (
                        <span className="text-sm text-surface-900">
                          {(user as any)[field.key] || "—"}
                        </span>
                      )}
                    </div>
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
