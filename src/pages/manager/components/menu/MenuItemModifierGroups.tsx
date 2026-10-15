import React from "react";
import {
  AlertTriangle,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import type { MenuItemModifierGroupAssignment } from "@/src/types/types";
import { createPortal } from "react-dom";

interface MenuItemModifierGroupsProps {
  isOpen: boolean;
  menuItemName: string;
  assignments: MenuItemModifierGroupAssignment[];
  isLoading: boolean;
  error: string;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (assignment: MenuItemModifierGroupAssignment) => void;
  onRemove: (assignment: MenuItemModifierGroupAssignment) => void;
}

const getSelectionText = (
  minSelection: number,
  maxSelection: number,
): string => {
  if (minSelection === maxSelection) {
    return `Choose ${minSelection}`;
  }

  if (minSelection === 0) {
    return `Choose up to ${maxSelection}`;
  }

  return `Choose ${minSelection}-${maxSelection}`;
};

const getRequirementText = (minSelection: number): string => {
  return minSelection > 0 ? "Required" : "Optional";
};

const MenuItemModifierGroups: React.FC<MenuItemModifierGroupsProps> = ({
  isOpen,
  menuItemName,
  assignments,
  isLoading,
  error,
  onClose,
  onAdd,
  onEdit,
  onRemove,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white border-l border-[#ECE7E1] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ECE7E1] flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[9px] text-[#8C7A6B] font-mono uppercase tracking-wider">
              Menu Item Options
            </p>

            <h3 className="text-sm font-display font-bold text-[#2D2D2D] truncate mt-1">
              {menuItemName}
            </h3>

            <p className="text-[10px] text-[#8C7A6B] mt-1">
              Configure the choices guests can select with this item.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 shrink-0 p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle size={14} className="flex-none mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={18} className="animate-spin text-[#E76F51]" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="border border-dashed border-[#DCD6CF] rounded-2xl p-6 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#FFF4EF] flex items-center justify-center text-[#E76F51]">
                <Plus size={18} />
              </div>

              <h4 className="text-xs font-bold text-[#2D2D2D] mt-3">
                No options configured
              </h4>

              <p className="text-[10px] text-[#8C7A6B] mt-1 leading-relaxed">
                Add option groups such as toppings, size, spice level or add-ons
                for this menu item.
              </p>

              <button
                type="button"
                onClick={onAdd}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E76F51] hover:bg-[#d95d3f] text-white text-[10px] font-bold cursor-pointer"
              >
                <Plus size={13} />
                Add Option Group
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-[#ECE7E1] rounded-2xl p-4 bg-[#FFFDF8]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#2D2D2D] truncate">
                          {assignment.modifierGroupName}
                        </h4>

                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase ${
                            assignment.modifierGroupType === "include"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-sky-50 text-sky-700 border border-sky-100"
                          }`}
                        >
                          {assignment.modifierGroupType === "include"
                            ? "Include"
                            : "Exclude"}
                        </span>
                      </div>

                      <p className="text-[9px] text-[#8C7A6B] font-mono mt-1">
                        {getRequirementText(assignment.minSelection)}
                        {" · "}
                        {getSelectionText(
                          assignment.minSelection,
                          assignment.maxSelection,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEdit(assignment)}
                        className="p-1.5 rounded-lg bg-white border border-[#E8E5DD] text-neutral-600 hover:text-[#E76F51] hover:border-[#E76F51]/40 cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemove(assignment)}
                        className="p-1.5 rounded-lg bg-white border border-[#E8E5DD] text-neutral-600 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#ECE7E1] flex items-center justify-between">
                    <span className="text-[9px] text-[#8C7A6B] font-mono">
                      Guest selection rule
                    </span>

                    <span className="text-[9px] font-mono font-bold text-[#2D2D2D]">
                      {getSelectionText(
                        assignment.minSelection,
                        assignment.maxSelection,
                      )}
                    </span>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={onAdd}
                className="w-full border border-dashed border-[#DCD6CF] hover:border-[#E76F51]/50 rounded-2xl py-3 text-[10px] font-bold text-[#E76F51] hover:bg-[#FFF8F4] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                Add Another Option Group
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#ECE7E1] bg-[#FFFCF8]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default MenuItemModifierGroups;
