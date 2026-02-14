"use client";

import React from "react";
import Link from "next/link";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import EmailRegisterForm from "@/components/auth/EmailRegisterForm";

export default function RegisterPage() {
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
                or register with email
              </span>
            </div>
          </div>

          <EmailRegisterForm />
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
