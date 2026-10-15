import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  CreateModifierGroupPayload,
  ModifierGroup,
  ModifierGroupType,
  UpdateModifierGroupPayload,
} from "@/src/types/types";

interface ModifierGroupFormModalProps {
  isOpen: boolean;
  editingGroup: ModifierGroup | null;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (
    payload: CreateModifierGroupPayload | UpdateModifierGroupPayload,
  ) => Promise<void>;
}

interface ModifierGroupFormState {
  name: string;
  modifierType: ModifierGroupType;
}

const EMPTY_FORM: ModifierGroupFormState = {
  name: "",
  modifierType: "include",
};

export default function ModifierGroupFormModal({
  isOpen,
  editingGroup,
  isSaving,
  error,
  onClose,
  onSubmit,
}: ModifierGroupFormModalProps) {
  const [form, setForm] = useState<ModifierGroupFormState>(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  const isEditing = editingGroup !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormError("");

    if (editingGroup) {
      setForm({
        name: editingGroup.name,
        modifierType: editingGroup.modifierType,
      });

      return;
    }

    setForm(EMPTY_FORM);
  }, [isOpen, editingGroup]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setFormError("");

    const name = form.name.trim();

    if (!name) {
      setFormError("Please enter a modifier group name.");
      return;
    }

    if (name.length > 150) {
      setFormError("Modifier group name cannot exceed 150 characters.");
      return;
    }

    const modifierTypeValue = form.modifierType === "include" ? 1 : 2;

    try {
      if (isEditing) {
        const payload: UpdateModifierGroupPayload = {
          name,
          modifier_type: modifierTypeValue,
        };

        await onSubmit(payload);
      } else {
        const payload: CreateModifierGroupPayload = {
          name,
          modifier_type: modifierTypeValue,
        };

        await onSubmit(payload);
      }
    } catch {
      // Parent handles API error display.
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#ECE7E1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#ECE7E1]">
          <div>
            <h3 className="text-base font-display font-bold text-[#2D2D2D]">
              {isEditing ? "Edit Modifier Group" : "Add Modifier Group"}
            </h3>

            <p className="text-[10px] text-[#8C7A6B] mt-1">
              Configure how this group of options behaves.
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
          {/* Name */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Group Name *
            </label>

            <input
              type="text"
              value={form.name}
              maxLength={150}
              disabled={isSaving}
              placeholder="e.g. Extra Toppings"
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

          {/* Modifier Type */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Modifier Type *
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    modifierType: "include",
                  }))
                }
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                  form.modifierType === "include"
                    ? "bg-[#FFF4EF] border-[#E76F51] text-[#C83214]"
                    : "bg-[#FAF9F6] border-[#E8E5DD] text-[#6B7280] hover:border-[#C8C2BB]"
                }`}
              >
                <span className="block">Include</span>
                <span className="block text-[9px] font-normal mt-0.5 opacity-80">
                  Customer can choose these options
                </span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    modifierType: "exclude",
                  }))
                }
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                  form.modifierType === "exclude"
                    ? "bg-[#FFF4EF] border-[#E76F51] text-[#C83214]"
                    : "bg-[#FAF9F6] border-[#E8E5DD] text-[#6B7280] hover:border-[#C8C2BB]"
                }`}
              >
                <span className="block">Exclude</span>
                <span className="block text-[9px] font-normal mt-0.5 opacity-80">
                  Options represent items to exclude
                </span>
              </button>
            </div>
          </div>

          {/* Errors */}
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
                  : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
