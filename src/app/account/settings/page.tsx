"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { accountSettingsSchema } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import type { MetadataItem, UserProfile } from "@/types";
import { KeyRound, Trash2, ArrowLeft, Plus, X } from "lucide-react";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cities, setCities] = useState<MetadataItem[]>([]);
  const [serviceAreas, setServiceAreas] = useState<MetadataItem[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    city_id: "",
    service_area_id: "",
    national_short_address: "",
    address: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            full_name: profileData.full_name || "",
            gender: profileData.gender || "",
            city_id: profileData.city_id || "",
            service_area_id: profileData.service_area_id || "",
            national_short_address: profileData.national_short_address || "",
            address: profileData.address || "",
            description: profileData.description || "",
          });
        }

        // Fetch user services
        const { data: servicesData } = await supabase
          .from("user_services")
          .select("service_name")
          .eq("user_id", user.id);

        if (servicesData) {
          setServices(servicesData.map((s) => s.service_name));
        }

        // Fetch metadata for dropdowns
        const [citiesRes, areasRes] = await Promise.all([
          fetch("/api/metadata?type=city"),
          fetch("/api/metadata?type=service_area"),
        ]);

        const citiesData = await citiesRes.json();
        const areasData = await areasRes.json();

        if (citiesData.success) setCities(citiesData.data);
        if (areasData.success) setServiceAreas(areasData.data);
      } catch (err) {
        console.error("Failed to load account data:", err);
      } finally {
        setPageLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleAddService = () => {
    const trimmed = newService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices([...services, trimmed]);
      setNewService("");
    }
  };

  const handleRemoveService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const result = accountSettingsSchema.safeParse({
      ...formData,
      gender: formData.gender || null,
      city_id: formData.city_id || null,
      service_area_id: formData.service_area_id || null,
      national_short_address: formData.national_short_address || null,
      address: formData.address || null,
      description: formData.description || null,
      services,
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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          gender: formData.gender || null,
          city_id: formData.city_id || null,
          service_area_id: formData.service_area_id || null,
          national_short_address: formData.national_short_address || null,
          address: formData.address || null,
          description: formData.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setAlert({ type: "error", message: "Failed to update profile" });
        return;
      }

      // Update services: delete all then re-insert
      await supabase.from("user_services").delete().eq("user_id", user.id);

      if (services.length > 0) {
        await supabase.from("user_services").insert(
          services.map((service_name) => ({
            user_id: user.id,
            service_name,
          }))
        );
      }

      setAlert({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setAlert({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-surface-900 mb-6">
          Account Settings
        </h1>

        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Profile Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              error={errors.full_name}
              required
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Select gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />

            <Select
              label="City"
              name="city_id"
              value={formData.city_id}
              onChange={handleChange}
              placeholder="Select city"
              options={cities.map((c) => ({
                value: c.id,
                label: c.name_en,
              }))}
            />

            <Select
              label="Service Area"
              name="service_area_id"
              value={formData.service_area_id}
              onChange={handleChange}
              placeholder="Select service area"
              options={serviceAreas.map((a) => ({
                value: a.id,
                label: a.name_en,
              }))}
            />

            <Input
              label="National Short Address"
              name="national_short_address"
              value={formData.national_short_address}
              onChange={handleChange}
              placeholder="e.g., ABCD1234"
            />

            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your full address"
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              />
            </div>

            {/* Services (multi-value) */}
            <div className="w-full">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Services (optional, e.g., Office, Building)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                  placeholder="Type a service and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleAddService}
                  icon={<Plus size={16} />}
                >
                  Add
                </Button>
              </div>
              {services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service)}
                        className="hover:text-brand-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Security
          </h2>
          <div className="space-y-3">
            {profile?.auth_provider === "email" && (
              <Link
                href="/auth/change-password"
                className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <KeyRound size={20} className="text-surface-500" />
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    Change Password
                  </p>
                  <p className="text-xs text-surface-500">
                    Update your account password
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-4">
            Danger Zone
          </h2>
          <Link
            href="/auth/delete-account"
            className="flex items-center gap-3 p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={20} className="text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700">
                Delete Account
              </p>
              <p className="text-xs text-red-400">
                Permanently delete your account and all data
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
