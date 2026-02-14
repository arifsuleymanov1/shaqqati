"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Alert from "@/components/ui/Alert";
import type { MetadataItem, MetadataType } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const METADATA_TYPES: { value: MetadataType; label: string }[] = [
  { value: "city", label: "City" },
  { value: "service_area", label: "Service Area" },
  { value: "currency", label: "Currency" },
];

export default function AdminMetadataPage() {
  const [activeType, setActiveType] = useState<MetadataType>("city");
  const [items, setItems] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MetadataItem | null>(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    name_ru: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, [activeType]);

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/metadata?type=${activeType}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setFormData({ name_en: "", name_ar: "", name_ru: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (item: MetadataItem) => {
    setEditItem(item);
    setFormData({
      name_en: item.name_en,
      name_ar: item.name_ar,
      name_ru: item.name_ru,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name_en || !formData.name_ar || !formData.name_ru) {
      setAlert({ type: "error", message: "All three language fields are required" });
      return;
    }

    setFormLoading(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem
        ? { id: editItem.id, type: activeType, ...formData }
        : { type: activeType, ...formData };

      const res = await fetch("/api/metadata", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error || "Operation failed" });
        return;
      }

      setShowModal(false);
      setAlert({
        type: "success",
        message: editItem ? "Metadata updated!" : "Metadata created!",
      });
      fetchMetadata();
    } catch (err) {
      setAlert({ type: "error", message: "An error occurred" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/metadata?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.error || "Delete failed" });
        return;
      }

      setAlert({ type: "success", message: "Metadata deleted" });
      fetchMetadata();
    } catch (err) {
      setAlert({ type: "error", message: "An error occurred" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Metadata</h1>
          <p className="text-surface-500 text-sm mt-1">
            Manage dropdown options for user fields (City, Service Area, Currency)
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus size={16} />}>
          Add {METADATA_TYPES.find((t) => t.value === activeType)?.label}
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

      {/* Type Tabs */}
      <div className="flex rounded-lg bg-surface-100 p-1 mb-6 max-w-md">
        {METADATA_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`
              flex-1 py-2 rounded-md text-sm font-medium transition-all
              ${
                activeType === type.value
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-500 hover:text-surface-700"
              }
            `}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                English
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Arabic (عربي)
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Russian (Русский)
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-surface-500 text-sm"
                >
                  No {activeType.replace("_", " ")} entries yet. Click "Add" to
                  create one.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-surface-900">
                    {item.name_en}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-900" dir="rtl">
                    {item.name_ar}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-900">
                    {item.name_ru}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        icon={<Pencil size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        icon={<Trash2 size={14} />}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editItem
            ? `Edit ${activeType.replace("_", " ")}`
            : `Add ${activeType.replace("_", " ")}`
        }
      >
        <div className="space-y-4">
          <Input
            label="English Name"
            value={formData.name_en}
            onChange={(e) =>
              setFormData({ ...formData, name_en: e.target.value })
            }
            placeholder="e.g., Riyadh"
            required
          />
          <Input
            label="Arabic Name (عربي)"
            value={formData.name_ar}
            onChange={(e) =>
              setFormData({ ...formData, name_ar: e.target.value })
            }
            placeholder="e.g., الرياض"
            required
          />
          <Input
            label="Russian Name (Русский)"
            value={formData.name_ru}
            onChange={(e) =>
              setFormData({ ...formData, name_ru: e.target.value })
            }
            placeholder="e.g., Эр-Рияд"
            required
          />
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
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
