"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!tokenHash || type !== "signup") {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "signup",
        });

        if (error) {
          setStatus("error");
          setMessage(
            error.message || "Verification failed. The link may have expired."
          );
        } else {
          setStatus("success");
          setMessage(
            "Your email has been verified! You can now sign in and access all features."
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred.");
      }
    }

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-8">
          {status === "loading" && (
            <>
              <Loader2
                className="animate-spin mx-auto text-brand-500 mb-4"
                size={48}
              />
              <h2 className="text-xl font-semibold text-surface-900">
                Verifying your email...
              </h2>
              <p className="text-surface-500 mt-2">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle
                className="mx-auto text-green-500 mb-4"
                size={48}
              />
              <h2 className="text-xl font-semibold text-surface-900">
                Email Verified!
              </h2>
              <p className="text-surface-500 mt-2">{message}</p>
              <Link href="/auth/login">
                <Button className="mt-6">Sign In</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-surface-900">
                Verification Failed
              </h2>
              <p className="text-surface-500 mt-2">{message}</p>
              <Link href="/auth/login">
                <Button variant="outline" className="mt-6">
                  Back to Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-8">
              <Loader2
                className="animate-spin mx-auto text-brand-500 mb-4"
                size={48}
              />
              <h2 className="text-xl font-semibold text-surface-900">
                Loading...
              </h2>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
