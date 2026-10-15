import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Settings2,
} from "lucide-react";

import type {
  MenuItemModifierGroupAssignment,
  RestaurantMenuItem,
} from "@/src/types/types";

import useModifierGroups from "@/src/hooks/useModifierGroups";
import useMenuItemModifierGroups from "@/src/hooks/useMenuItemModifierGroups";

import MenuItemModifierGroups from "./MenuItemModifierGroups";
import MenuItemModifierGroupFormModal from "./MenuItemModifierGroupFormModal";

interface MenuItemOptionsSectionProps {
  menuItem: RestaurantMenuItem | null;
  itemName: string;
}

const MenuItemOptionsSection: React.FC<MenuItemOptionsSectionProps> = ({
  menuItem,
  itemName,
}) => {
  /*
   * ---------------------------------------------------------
   * Modifier groups
   * ---------------------------------------------------------
   *
   * These are the reusable option groups created in the
   * standalone "Menu Modifiers" module.
   *
   * Example:
   *   Cheese Selection
   *   Toppings
   *   Spice Level
   */
  const {
    modifierGroups,
    isLoading: isModifierGroupsLoading,
    error: modifierGroupsError,
  } = useModifierGroups();

  /*
   * ---------------------------------------------------------
   * Assignments for THIS menu item
   * ---------------------------------------------------------
   *
   * This tells us which reusable modifier groups are actually
   * attached to the current menu item.
   */
  const {
    assignments,
    isLoading: isAssignmentsLoading,
    error: assignmentError,
    attachGroup,
    editAssignment,
    removeAssignment,
  } = useMenuItemModifierGroups({
    menuItemId: menuItem?.id ?? null,
    modifierGroups,
  });

  /*
   * ---------------------------------------------------------
   * Local UI state
   * ---------------------------------------------------------
   */
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);

  const [isOptionGroupFormOpen, setIsOptionGroupFormOpen] = useState(false);

  const [editingAssignment, setEditingAssignment] =
    useState<MenuItemModifierGroupAssignment | null>(null);

  const [isAssignmentSaving, setIsAssignmentSaving] = useState(false);

  const [actionError, setActionError] = useState("");

  /*
   * ---------------------------------------------------------
   * Open configuration drawer
   * ---------------------------------------------------------
   */
  const handleOpenOptionsDrawer = () => {
    setActionError("");

    if (!menuItem?.id) {
      return;
    }

    setIsOptionsDrawerOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * Add option group
   * ---------------------------------------------------------
   */
  const handleOpenAddOptionGroup = () => {
    setActionError("");
    setEditingAssignment(null);
    setIsOptionGroupFormOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * Edit option group assignment
   * ---------------------------------------------------------
   */
  const handleOpenEditOptionGroup = (
    assignment: MenuItemModifierGroupAssignment,
  ) => {
    setActionError("");
    setEditingAssignment(assignment);
    setIsOptionGroupFormOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * Close assignment form
   * ---------------------------------------------------------
   */
  const handleCloseOptionGroupForm = () => {
    if (isAssignmentSaving) {
      return;
    }

    setIsOptionGroupFormOpen(false);
    setEditingAssignment(null);
    setActionError("");
  };

  /*
   * ---------------------------------------------------------
   * Save assignment
   * ---------------------------------------------------------
   */
  const handleSaveOptionGroupAssignment = async (payload: {
    modifier_group_id: string;
    min_selection: number;
    max_selection: number;
  }) => {
    setActionError("");

    try {
      setIsAssignmentSaving(true);

      if (editingAssignment) {
        await editAssignment(editingAssignment.id, payload);
      } else {
        await attachGroup(payload);
      }

      setIsOptionGroupFormOpen(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error("Failed to save menu item option group assignment:", error);

      /*
       * The hook already stores the API error.
       * We only keep the modal open here so the user can
       * correct/retry the operation.
       */
    } finally {
      setIsAssignmentSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Remove assignment
   * ---------------------------------------------------------
   */
  const handleRemoveOptionGroup = async (
    assignment: MenuItemModifierGroupAssignment,
  ) => {
    const confirmed = window.confirm(
      `Remove "${assignment.modifierGroupName}" from "${itemName}"?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await removeAssignment(assignment.id);
    } catch (error) {
      console.error(
        "Failed to remove menu item option group assignment:",
        error,
      );
    }
  };

  const isLoading = isModifierGroupsLoading || isAssignmentsLoading;

  const errorMessage =
    actionError || assignmentError || modifierGroupsError || "";

  return (
    <>
      {/* ---------------------------------------------------
          Options & Add-ons summary
          --------------------------------------------------- */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase">
            Options & Add-ons
          </label>

          {menuItem?.id && assignments.length > 0 && (
            <span className="text-[8px] font-mono font-bold text-[#E76F51] uppercase">
              {assignments.length} configured
            </span>
          )}
        </div>

        <div className="border border-[#ECE7E1] rounded-xl bg-[#FAF9F6] p-3">
          {menuItem?.id ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#ECE7E1] flex items-center justify-center text-[#E76F51] flex-none">
                    <Settings2 size={14} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#2D2D2D]">
                      Guest choices
                    </p>

                    <p className="text-[9px] text-[#8C7A6B] leading-relaxed mt-0.5">
                      Add toppings, sizes, spice levels or other selectable
                      options.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenOptionsDrawer}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-[#E8E5DD] hover:border-[#E76F51]/40 hover:text-[#E76F51] text-[#2D2D2D] text-[9px] font-bold cursor-pointer"
                >
                  Configure
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={12} className="flex-none mt-0.5" />

                  <span className="text-[9px]">{errorMessage}</span>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="mt-3 flex items-center gap-2 text-[9px] font-mono text-[#8C7A6B]">
                  <RefreshCw size={11} className="animate-spin" />
                  Loading options...
                </div>
              )}

              {/* Assigned groups summary */}
              {!isLoading && assignments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E8E5DD] space-y-1.5">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-[9px] font-mono font-bold text-[#2D2D2D] truncate">
                        {assignment.modifierGroupName}
                      </span>

                      <span className="shrink-0 text-[8px] font-mono text-[#8C7A6B]">
                        {assignment.minSelection === 0
                          ? `Up to ${assignment.maxSelection}`
                          : assignment.minSelection === assignment.maxSelection
                            ? `Exactly ${assignment.minSelection}`
                            : `${assignment.minSelection}-${assignment.maxSelection}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && assignments.length === 0 && !errorMessage && (
                <div className="mt-3 pt-3 border-t border-[#E8E5DD]">
                  <p className="text-[9px] text-[#8C7A6B] font-mono">
                    No options configured yet.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#ECE7E1] flex items-center justify-center text-neutral-400 flex-none">
                <Settings2 size={14} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#2D2D2D]">
                  Configure after saving
                </p>

                <p className="text-[9px] text-[#8C7A6B] leading-relaxed mt-0.5">
                  Save this menu item first. You can then configure its options
                  and add-ons.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------
          Option groups drawer
          --------------------------------------------------- */}
      <MenuItemModifierGroups
        isOpen={isOptionsDrawerOpen}
        menuItemName={itemName}
        assignments={assignments}
        isLoading={isAssignmentsLoading}
        error={assignmentError ?? ""}
        onClose={() => setIsOptionsDrawerOpen(false)}
        onAdd={handleOpenAddOptionGroup}
        onEdit={handleOpenEditOptionGroup}
        onRemove={handleRemoveOptionGroup}
      />

      {/* ---------------------------------------------------
          Attach / Edit assignment modal
          --------------------------------------------------- */}
      <MenuItemModifierGroupFormModal
        isOpen={isOptionGroupFormOpen}
        editingAssignment={editingAssignment}
        modifierGroups={modifierGroups}
        assignedGroupIds={assignments.map(
          (assignment) => assignment.modifierGroupId,
        )}
        isSaving={isAssignmentSaving}
        error={assignmentError ?? modifierGroupsError ?? ""}
        onClose={handleCloseOptionGroupForm}
        onSubmit={handleSaveOptionGroupAssignment}
      />
    </>
  );
};

export default MenuItemOptionsSection;
