"use client";

import React, { useState } from "react";
import { changePasswordSchema } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error });
        return;
      }

      setAlert({ type: "success", message: "Password changed successfully!" });
      setFormData({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900">
            Change Password
          </h1>
          <p className="text-surface-500 mt-1">
            Update your account password
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
          {alert && (
            <div className="mb-4">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              name="old_password"
              type="password"
              placeholder="Enter your current password"
              value={formData.old_password}
              onChange={handleChange}
              error={errors.old_password}
              required
            />

            <Input
              label="New Password"
              name="new_password"
              type="password"
              placeholder="Min 8 chars, 1 special character"
              value={formData.new_password}
              onChange={handleChange}
              error={errors.new_password}
              hint="At least 8 characters with one special character"
              required
            />

            <Input
              label="Confirm New Password"
              name="confirm_new_password"
              type="password"
              placeholder="Confirm your new password"
              value={formData.confirm_new_password}
              onChange={handleChange}
              error={errors.confirm_new_password}
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Change Password
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/account/settings"
            className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
          >
            <ArrowLeft size={14} />
            Back to Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
