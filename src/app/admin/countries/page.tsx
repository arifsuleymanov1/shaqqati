"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Alert from "@/components/ui/Alert";
import type { Country } from "@/types";
import { Plus, Pencil, Globe } from "lucide-react";

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    name_ru: "",
    country_code: "+",
    phone_validation_length: 9,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/countries");
      const data = await res.json();
      if (data.success) setCountries(data.data);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setFormData({
      name_en: "",
      name_ar: "",
      name_ru: "",
      country_code: "+",
      phone_validation_length: 9,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.name_en ||
      !formData.name_ar ||
      !formData.name_ru ||
      !formData.country_code
    ) {
      setAlert({ type: "error", message: "All fields are required" });
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone_validation_length: Number(formData.phone_validation_length),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error || "Failed to create" });
        return;
      }

      setShowModal(false);
      setAlert({ type: "success", message: "Country added!" });
      fetchCountries();
    } catch (err) {
      setAlert({ type: "error", message: "An error occurred" });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Countries</h1>
          <p className="text-surface-500 text-sm mt-1">
            Manage countries for phone login. Configure country codes and phone
            number validation.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus size={16} />}>
          Add Country
        </Button>
      </div>

      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Country
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Code
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Phone Digits
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Example
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto" />
                </td>
              </tr>
            ) : countries.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-surface-500 text-sm"
                >
                  No countries configured yet. Add Saudi Arabia (+966) to get
                  started.
                </td>
              </tr>
            ) : (
              countries.map((country) => (
                <tr
                  key={country.id}
                  className="hover:bg-surface-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-surface-400" />
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {country.name_en}
                        </p>
                        <p className="text-xs text-surface-500">
                          {country.name_ar} / {country.name_ru}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono font-medium text-surface-900">
                    {country.country_code}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-600">
                    {country.phone_validation_length} digits
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-500 font-mono">
                    {country.country_code}
                    {"0".repeat(country.phone_validation_length)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        country.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-surface-100 text-surface-500"
                      }`}
                    >
                      {country.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Country"
      >
        <div className="space-y-4">
          <Input
            label="English Name"
            value={formData.name_en}
            onChange={(e) =>
              setFormData({ ...formData, name_en: e.target.value })
            }
            placeholder="e.g., Saudi Arabia"
            required
          />
          <Input
            label="Arabic Name"
            value={formData.name_ar}
            onChange={(e) =>
              setFormData({ ...formData, name_ar: e.target.value })
            }
            placeholder="e.g., المملكة العربية السعودية"
            required
          />
          <Input
            label="Russian Name"
            value={formData.name_ru}
            onChange={(e) =>
              setFormData({ ...formData, name_ru: e.target.value })
            }
            placeholder="e.g., Саудовская Аравия"
            required
          />
          <Input
            label="Country Code"
            value={formData.country_code}
            onChange={(e) =>
              setFormData({ ...formData, country_code: e.target.value })
            }
            placeholder="+966"
            hint="Include the + sign, e.g., +966, +965"
            required
          />
          <Input
            label="Phone Number Length (digits only)"
            type="number"
            value={formData.phone_validation_length.toString()}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone_validation_length: parseInt(e.target.value) || 9,
              })
            }
            placeholder="9"
            hint="Number of digits users must enter (without country code)"
            required
          />
          <div className="bg-surface-50 rounded-lg p-3 text-sm text-surface-600">
            <strong>Preview:</strong> Users will see{" "}
            <span className="font-mono">
              {formData.country_code || "+XXX"}
            </span>{" "}
            prefix and must enter exactly{" "}
            {formData.phone_validation_length} digits.
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={formLoading}
              onClick={handleSubmit}
            >
              Create Country
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
