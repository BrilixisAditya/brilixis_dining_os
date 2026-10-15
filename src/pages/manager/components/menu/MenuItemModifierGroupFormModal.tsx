import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import type {
  MenuItemModifierGroupAssignment,
  ModifierGroup,
} from "@/src/types/types";

interface MenuItemModifierGroupFormModalProps {
  isOpen: boolean;
  editingAssignment: MenuItemModifierGroupAssignment | null;
  modifierGroups: ModifierGroup[];
  assignedGroupIds: string[];
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (payload: {
    modifier_group_id: string;
    min_selection: number;
    max_selection: number;
  }) => void;
}

const MenuItemModifierGroupFormModal: React.FC<
  MenuItemModifierGroupFormModalProps
> = ({
  isOpen,
  editingAssignment,
  modifierGroups,
  assignedGroupIds,
  isSaving,
  error,
  onClose,
  onSubmit,
}) => {
  const [modifierGroupId, setModifierGroupId] = useState("");
  const [minSelection, setMinSelection] = useState("0");
  const [maxSelection, setMaxSelection] = useState("1");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingAssignment) {
      setModifierGroupId(editingAssignment.modifierGroupId);
      setMinSelection(String(editingAssignment.minSelection));
      setMaxSelection(String(editingAssignment.maxSelection));
    } else {
      setModifierGroupId("");
      setMinSelection("0");
      setMaxSelection("1");
    }

    setFormError("");
  }, [isOpen, editingAssignment]);

  const availableModifierGroups = useMemo(() => {
    return modifierGroups.filter((group) => {
      /*
       * When editing, keep the currently selected group available
       * even though it is already assigned to this menu item.
       */
      if (editingAssignment?.modifierGroupId === group.id) {
        return true;
      }

      /*
       * Only active groups can be newly attached.
       */
      if (!group.isActive) {
        return false;
      }

      /*
       * Prevent already-attached groups from being selected again.
       */
      return !assignedGroupIds.includes(group.id);
    });
  }, [modifierGroups, assignedGroupIds, editingAssignment]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!modifierGroupId) {
      setFormError("Please select an option group.");
      return;
    }

    const min = Number(minSelection);
    const max = Number(maxSelection);

    if (!Number.isInteger(min) || min < 0) {
      setFormError("Minimum selection must be a whole number of 0 or more.");
      return;
    }

    if (!Number.isInteger(max) || max < 1) {
      setFormError("Maximum selection must be a whole number of 1 or more.");
      return;
    }

    if (max < min) {
      setFormError("Maximum selection cannot be less than minimum selection.");
      return;
    }

    onSubmit({
      modifier_group_id: modifierGroupId,
      min_selection: min,
      max_selection: max,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white border border-[#ECE7E1] rounded-2xl p-5 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#ECE7E1]">
          <div>
            <h3 className="text-sm font-display font-bold text-[#2D2D2D]">
              {editingAssignment ? "Edit Option Group" : "Add Option Group"}
            </h3>

            <p className="text-[9px] text-[#8C7A6B] font-mono mt-1">
              Configure guest selection rules
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {(error || formError) && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertTriangle size={14} className="flex-none mt-0.5" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Option Group */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Option Group *
            </label>

            <select
              required
              value={modifierGroupId}
              onChange={(event) => setModifierGroupId(event.target.value)}
              disabled={isSaving}
              className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2.5 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
            >
              <option value="">Select option group</option>

              {availableModifierGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                  {" · "}
                  {group.modifierType === "include" ? "Include" : "Exclude"}
                </option>
              ))}
            </select>
          </div>

          {/* Selection Rules */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                Minimum *
              </label>

              <input
                type="number"
                min={0}
                step={1}
                required
                value={minSelection}
                onChange={(event) => setMinSelection(event.target.value)}
                disabled={isSaving}
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2.5 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                Maximum *
              </label>

              <input
                type="number"
                min={1}
                step={1}
                required
                value={maxSelection}
                onChange={(event) => setMaxSelection(event.target.value)}
                disabled={isSaving}
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2.5 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl">
            <p className="text-[9px] text-[#8C7A6B] font-mono leading-relaxed">
              Example: minimum <b>1</b>, maximum <b>1</b> means the guest must
              choose exactly one option. Minimum <b>0</b>, maximum <b>3</b>{" "}
              means the guest may choose up to three.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#ECE7E1]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E76F51] hover:bg-[#d95d3f] cursor-pointer shadow-brilixis-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <RefreshCw size={13} className="animate-spin" />}

              {isSaving
                ? "Saving..."
                : editingAssignment
                  ? "Save Changes"
                  : "Attach Group"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default MenuItemModifierGroupFormModal;
