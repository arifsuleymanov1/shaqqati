"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { whatsappLoginSchema, otpSchema } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import type { Country } from "@/types";

export default function WhatsAppLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    whatsapp_phone_number: "",
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
    if (name === "whatsapp_phone_number" || name === "otp") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        [name]: name === "otp" ? digitsOnly.slice(0, 6) : digitsOnly,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find((c) => c.id === e.target.value);
    if (country) {
      setSelectedCountry(country);
      setFormData({ ...formData, whatsapp_phone_number: "" });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!selectedCountry) {
      setAlert({ type: "error", message: "Please select a country" });
      return;
    }

    const schema = whatsappLoginSchema(selectedCountry.phone_validation_length);
    const result = schema.safeParse({
      whatsapp_phone_number: formData.whatsapp_phone_number,
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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: formData.whatsapp_phone_number,
          country_code: selectedCountry.country_code,
          full_name: formData.full_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error || "Failed to send OTP" });
        return;
      }

      setStep("otp");
      setOtpTimer(60);
      setAlert({
        type: "success",
        message: `OTP sent via WhatsApp to ${selectedCountry.country_code}${formData.whatsapp_phone_number}`,
      });
    } catch (err) {
      setAlert({ type: "error", message: "Failed to send OTP. Please try again." });
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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: formData.whatsapp_phone_number,
          country_code: selectedCountry?.country_code,
          otp: formData.otp,
          full_name: formData.full_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error || "Invalid OTP" });
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setAlert({ type: "error", message: "Verification failed." });
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
        <div className="text-center mb-4">
          <p className="text-sm text-surface-600">Enter the 6-digit code sent via WhatsApp to</p>
          <p className="font-semibold text-surface-900">
            {selectedCountry?.country_code}{formData.whatsapp_phone_number}
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
        <Button type="submit" fullWidth loading={loading}>Verify OTP</Button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => { if (otpTimer === 0) { setStep("phone"); setFormData({ ...formData, otp: "" }); } }}
            disabled={otpTimer > 0}
            className="text-sm text-brand-600 hover:text-brand-700 disabled:text-surface-400 disabled:cursor-not-allowed"
          >
            {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setStep("phone"); setFormData({ ...formData, otp: "" }); setAlert(null); }}
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
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
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
          options={countries.map((c) => ({ value: c.id, label: `${c.name_en} (${c.country_code})` }))}
          value={selectedCountry?.id || ""}
          onChange={handleCountryChange}
          required
        />
      )}
      <Input
        label="WhatsApp Number"
        name="whatsapp_phone_number"
        type="tel"
        placeholder={selectedCountry ? "0".repeat(selectedCountry.phone_validation_length) : "Phone number"}
        value={formData.whatsapp_phone_number}
        onChange={handleChange}
        error={errors.whatsapp_phone_number}
        leftAddon={<span className="font-medium">{selectedCountry?.country_code || "+966"}</span>}
        hint={selectedCountry ? `Enter ${selectedCountry.phone_validation_length} digit number` : undefined}
        required
      />
      <Button type="submit" fullWidth loading={loading} icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      }>
        Send OTP via WhatsApp
      </Button>
    </form>
  );
}
