"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MessageCircle } from "lucide-react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import EmailLoginForm from "@/components/auth/EmailLoginForm";
import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import WhatsAppLoginForm from "@/components/auth/WhatsAppLoginForm";

type AuthTab = "email" | "phone" | "whatsapp";

const tabs: { id: AuthTab; label: string; icon: React.ReactNode }[] = [
  { id: "email", label: "Email", icon: <Mail size={16} /> },
  { id: "phone", label: "Phone", icon: <Phone size={16} /> },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={16} /> },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("email");

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900">Welcome Back</h1>
          <p className="text-surface-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
          {/* Google Login */}
          <GoogleLoginButton />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-surface-400">
                or continue with
              </span>
            </div>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex rounded-lg bg-surface-100 p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-white text-surface-900 shadow-sm"
                      : "text-surface-500 hover:text-surface-700"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Auth Forms */}
          {activeTab === "email" && <EmailLoginForm />}
          {activeTab === "phone" && <PhoneLoginForm />}
          {activeTab === "whatsapp" && <WhatsAppLoginForm />}
        </div>

        {/* Footer Links */}
        <p className="text-center text-sm text-surface-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
