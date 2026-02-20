"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { phoneLoginSchema, otpSchema } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import type { Country } from "@/types";

export default function PhoneLoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    phone_number: "",
    full_name: "",
    otp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (data.success && data.data) {
          setCountries(data.data);
          if (data.data.length > 0) setSelectedCountry(data.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: digitsOnly });
    } else if (name === "otp") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find((c) => c.id === e.target.value);
    if (country) {
      setSelectedCountry(country);
      setFormData({ ...formData, phone_number: "" });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!selectedCountry) {
      setAlert({ type: "error", message: "Please select a country" });
      return;
    }

    const schema = phoneLoginSchema(selectedCountry.phone_validation_length);
    const result = schema.safeParse({
      phone_number: formData.phone_number,
      country_code: selectedCountry.country_code,
      full_name: formData.full_name,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const fullPhone = `${selectedCountry.country_code}${formData.phone_number}`;

    setLoading(true);
    try {
      // Use Supabase's built-in phone OTP (SMS)
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: {
          data: {
            full_name: formData.full_name,
            auth_provider: "phone",
          },
        },
      });

      if (error) {
        setAlert({ type: "error", message: error.message });
        return;
      }

      setStep("otp");
      setOtpTimer(60);
      setAlert({
        type: "success",
        message: `OTP sent to ${fullPhone}`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: "Failed to send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const result = otpSchema.safeParse({ otp: formData.otp });
    if (!result.success) {
      setErrors({ otp: result.error.errors[0].message });
      return;
    }

    const fullPhone = `${selectedCountry?.country_code}${formData.phone_number}`;

    setLoading(true);
    try {
      // Verify OTP with Supabase — this creates a session automatically
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: formData.otp,
        type: "sms",
      });

      if (error) {
        setAlert({ type: "error", message: error.message });
        return;
      }

      if (session) {
        // Ensure profile exists
        try {
          await fetch("/api/auth/phone/complete-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: formData.full_name,
              phone_number: fullPhone,
            }),
          });
        } catch (profileErr) {
          console.error("Profile creation error:", profileErr);
        }

        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: "Verification failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        <div className="text-center mb-4">
          <p className="text-sm text-surface-600">
            Enter the 6-digit code sent to
          </p>
          <p className="font-semibold text-surface-900">
            {selectedCountry?.country_code}
            {formData.phone_number}
          </p>
        </div>
        <Input
          label="Verification Code"
          name="otp"
          placeholder="000000"
          value={formData.otp}
          onChange={handleChange}
          error={errors.otp}
          maxLength={6}
          className="text-center text-2xl tracking-[0.5em] font-mono"
          required
        />
        <Button type="submit" fullWidth loading={loading}>
          Verify OTP
        </Button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              if (otpTimer === 0) {
                setStep("phone");
                setFormData({ ...formData, otp: "" });
              }
            }}
            disabled={otpTimer > 0}
            className="text-sm text-brand-600 hover:text-brand-700 disabled:text-surface-400 disabled:cursor-not-allowed"
          >
            {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setFormData({ ...formData, otp: "" });
            setAlert(null);
          }}
          className="w-full text-sm text-surface-500 hover:text-surface-700"
        >
          ← Change phone number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
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
      {countries.length > 0 && (
        <Select
          label="Country"
          options={countries.map((c) => ({
            value: c.id,
            label: `${c.name_en} (${c.country_code})`,
          }))}
          value={selectedCountry?.id || ""}
          onChange={handleCountryChange}
          required
        />
      )}
      <Input
        label="Phone Number"
        name="phone_number"
        type="tel"
        placeholder={
          selectedCountry
            ? `${"0".repeat(selectedCountry.phone_validation_length)}`
            : "Phone number"
        }
        value={formData.phone_number}
        onChange={handleChange}
        error={errors.phone_number}
        leftAddon={
          <span className="font-medium">
            {selectedCountry?.country_code || "+966"}
          </span>
        }
        hint={
          selectedCountry
            ? `Enter ${selectedCountry.phone_validation_length} digit number`
            : undefined
        }
        required
      />
      <Button type="submit" fullWidth loading={loading}>
        Send OTP
      </Button>
    </form>
  );
}
