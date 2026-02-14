"use client";

import React, { useState } from "react";
import { registerEmailSchema } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function EmailRegisterForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
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

    // Validate
    const result = registerEmailSchema.safeParse(formData);
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error || "Registration failed" });
        return;
      }

      setAlert({
        type: "success",
        message:
          "Account created! Please check your email to verify your account before logging in.",
      });
      setFormData({ full_name: "", email: "", password: "", confirm_password: "" });
    } catch (err) {
      setAlert({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Input
        label="Full Name"
        name="full_name"
        placeholder="Enter your full name"
        value={formData.full_name}
        onChange={handleChange}
        error={errors.full_name}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Min 8 chars, 1 special character"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        hint="At least 8 characters with one special character"
        required
      />

      <Input
        label="Confirm Password"
        name="confirm_password"
        type="password"
        placeholder="Confirm your password"
        value={formData.confirm_password}
        onChange={handleChange}
        error={errors.confirm_password}
        required
      />

      <Button type="submit" fullWidth loading={loading}>
        Create Account
      </Button>
    </form>
  );
}
