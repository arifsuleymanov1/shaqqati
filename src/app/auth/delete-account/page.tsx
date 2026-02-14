"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error });
        setShowModal(false);
        return;
      }

      router.push("/auth/login?deleted=true");
    } catch (err) {
      setAlert({
        type: "error",
        message: "An unexpected error occurred.",
      });
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900">
            Delete Account
          </h1>
          <p className="text-surface-500 mt-1">
            Permanently delete your account and all data
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

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-800 text-sm">
                  Warning: This action cannot be undone
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  Deleting your account will permanently remove all your data,
                  including your profile, properties, and all associated
                  information.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowModal(true)}
          >
            Delete My Account
          </Button>
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

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setConfirmText("");
        }}
        title="Confirm Account Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            To confirm deletion, type <strong>DELETE</strong> in the field below:
          </p>
          <Input
            placeholder='Type "DELETE" to confirm'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={loading}
              disabled={confirmText !== "DELETE"}
              onClick={handleDelete}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
