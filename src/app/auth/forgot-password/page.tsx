"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setError("");

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setSent(true);
      setAlert({
        type: "success",
        message:
          data.message ||
          "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: "An error occurred. Please try again.",
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
            Reset Password
          </h1>
          <p className="text-surface-500 mt-1">
            Enter your email to receive a reset link
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

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                error={error}
                required
              />
              <Button type="submit" fullWidth loading={loading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-surface-600 text-sm">
                Check your email inbox for the password reset link. It may take
                a few minutes to arrive.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSent(false);
                  setAlert(null);
                }}
              >
                Send Again
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
