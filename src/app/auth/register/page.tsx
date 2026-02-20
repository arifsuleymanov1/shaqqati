"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import EmailRegisterForm from "@/components/auth/EmailRegisterForm";
import WhatsAppRegisterForm from "@/components/auth/WhatsAppRegisterForm";

type RegisterTab = "email" | "whatsapp";

const tabs: { id: RegisterTab; label: string; icon: React.ReactNode }[] = [
  { id: "email", label: "Email", icon: <Mail size={16} /> },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={16} /> },
];

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<RegisterTab>("email");

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900">
            Create an Account
          </h1>
          <p className="text-surface-500 mt-1">
            Join our real estate platform
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
          <GoogleLoginButton />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-surface-400">
                or register with
              </span>
            </div>
          </div>

          {/* Registration Method Tabs */}
          <div className="flex rounded-lg bg-surface-100 p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id
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

          {/* Registration Forms */}
          {activeTab === "email" && <EmailRegisterForm />}
          {activeTab === "whatsapp" && <WhatsAppRegisterForm />}
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
