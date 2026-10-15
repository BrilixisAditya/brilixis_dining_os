import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  CreateModifierPayload,
  Modifier,
  ModifierGroup,
  UpdateModifierPayload,
} from "@/src/types/types";

interface ModifierFormModalProps {
  isOpen: boolean;
  editingModifier: Modifier | null;
  modifierGroups: ModifierGroup[];
  selectedGroup: ModifierGroup | null;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (
    payload: CreateModifierPayload | UpdateModifierPayload,
  ) => Promise<void>;
}

interface ModifierFormState {
  name: string;
  modifierGroupId: string;
  modifierPrice: string;
  status: 1 | 2 | 3;
}

const EMPTY_FORM: ModifierFormState = {
  name: "",
  modifierGroupId: "",
  modifierPrice: "0",
  status: 1,
};

function statusToNumber(status: Modifier["status"]): 1 | 2 | 3 {
  switch (status) {
    case "active":
      return 1;
    case "inactive":
      return 2;
    case "unavailable":
      return 3;
  }
}

export default function ModifierFormModal({
  isOpen,
  editingModifier,
  modifierGroups,
  selectedGroup,
  isSaving,
  error,
  onClose,
  onSubmit,
}: ModifierFormModalProps) {
  const [form, setForm] = useState<ModifierFormState>(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  const isEditing = editingModifier !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormError("");

    if (editingModifier) {
      setForm({
        name: editingModifier.name,
        modifierGroupId: editingModifier.modifierGroupId,
        modifierPrice: String(editingModifier.modifierPrice),
        status: statusToNumber(editingModifier.status),
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
      modifierGroupId: selectedGroup?.id ?? "",
    });
  }, [isOpen, editingModifier, selectedGroup]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setFormError("");

    const name = form.name.trim();

    if (!name) {
      setFormError("Please enter a modifier name.");
      return;
    }

    if (name.length > 150) {
      setFormError("Modifier name cannot exceed 150 characters.");
      return;
    }

    if (!form.modifierGroupId) {
      setFormError("Please select a modifier group.");
      return;
    }

    if (
      form.modifierPrice.trim() === "" ||
      !/^\d+$/.test(form.modifierPrice.trim())
    ) {
      setFormError("Modifier price must be a whole number.");
      return;
    }

    const modifierPrice = Number(form.modifierPrice);

    if (!Number.isSafeInteger(modifierPrice) || modifierPrice < 0) {
      setFormError("Please enter a valid modifier price.");
      return;
    }

    try {
      if (isEditing) {
        const payload: UpdateModifierPayload = {
          name,
          modifier_group_id: form.modifierGroupId,
          modifier_price: modifierPrice,
          status: form.status,
        };

        await onSubmit(payload);
      } else {
        const payload: CreateModifierPayload = {
          name,
          modifier_group_id: form.modifierGroupId,
          modifier_price: modifierPrice,
          status: form.status,
        };

        await onSubmit(payload);
      }
    } catch {
      // Parent/hook handles API error state.
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#ECE7E1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#ECE7E1]">
          <div>
            <h3 className="text-base font-display font-bold text-[#2D2D2D]">
              {isEditing ? "Edit Modifier" : "Add Modifier"}
            </h3>

            <p className="text-[10px] text-[#8C7A6B] mt-1">
              Configure the option and its additional price.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Modifier name */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Modifier Name *
            </label>

            <input
              type="text"
              value={form.name}
              maxLength={150}
              disabled={isSaving}
              placeholder="e.g. Extra Cheese"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
            />

            <div className="flex justify-end mt-1">
              <span className="text-[9px] font-mono text-[#8C7A6B]">
                {form.name.length}/150
              </span>
            </div>
          </div>

          {/* Modifier group */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Modifier Group *
            </label>

            <select
              value={form.modifierGroupId}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  modifierGroupId: event.target.value,
                }))
              }
              className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
            >
              <option value="">Select modifier group</option>

              {modifierGroups
                .filter((group) => group.isActive)
                .map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Additional Price *
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8C7A6B]">
                ₹
              </span>

              <input
                type="number"
                min={0}
                step={1}
                value={form.modifierPrice}
                disabled={isSaving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    modifierPrice: event.target.value,
                  }))
                }
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl pl-7 pr-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
              />
            </div>

            <p className="text-[9px] text-[#8C7A6B] mt-1">
              Enter 0 for an option with no additional charge.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Status
            </label>

            <select
              value={form.status}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: Number(event.target.value) as 1 | 2 | 3,
                }))
              }
              className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
              <option value={3}>Unavailable</option>
            </select>
          </div>

          {/* Error */}
          {(formError || error) && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3 py-2 text-[10px] leading-relaxed">
              {formError || error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#ECE7E1]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E76F51] hover:bg-[#d95d3f] cursor-pointer shadow-brilixis-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Modifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
