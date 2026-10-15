import React, { useEffect, useState } from "react";
import { Layers3, Settings2 } from "lucide-react";

import {
  CreateModifierPayload,
  CreateModifierGroupPayload,
  Modifier,
  ModifierGroup,
  UpdateModifierPayload,
  UpdateModifierGroupPayload,
} from "@/src/types/types";

import useModifierGroups from "@/src/hooks/useModifierGroups";
import useModifiers from "@/src/hooks/useModifiers";

import ModifierGroupList from "./ModifierGroupList";
import ModifierGroupFormModal from "./ModifierGroupFormModal";
import ModifierList from "./ModifierList";
import ModifierFormModal from "./ModifierFormModal";

export default function ModifierManagement() {
  /*
   * ---------------------------------------------------------
   * Modifier Groups
   * ---------------------------------------------------------
   */
  const {
    modifierGroups,
    isLoading: isGroupsLoading,
    error: groupsError,
    addModifierGroup,
    editModifierGroup,
    removeModifierGroup,
  } = useModifierGroups();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<ModifierGroup | null>(
    null,
  );

  /*
   * ---------------------------------------------------------
   * Modifiers
   * ---------------------------------------------------------
   */
  const {
    modifiers,
    isLoading: isModifiersLoading,
    error: modifiersError,
    addModifier,
    editModifier,
    removeModifier,
  } = useModifiers({
    modifierGroupId: selectedGroupId,
    modifierGroupName: selectedGroup?.name,
  });

  /*
   * ---------------------------------------------------------
   * Modifier Group modal
   * ---------------------------------------------------------
   */
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

  const [isSavingGroup, setIsSavingGroup] = useState(false);

  /*
   * ---------------------------------------------------------
   * Modifier modal
   * ---------------------------------------------------------
   */
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);

  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);

  const [isSavingModifier, setIsSavingModifier] = useState(false);

  /*
   * ---------------------------------------------------------
   * Keep selected group synchronized with API state
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (modifierGroups.length === 0) {
      setSelectedGroupId(null);
      setSelectedGroup(null);
      return;
    }

    if (!selectedGroupId) {
      const firstGroup = modifierGroups[0];

      setSelectedGroupId(firstGroup.id);
      setSelectedGroup(firstGroup);

      return;
    }

    const currentGroup = modifierGroups.find(
      (group) => group.id === selectedGroupId,
    );

    if (!currentGroup) {
      const firstGroup = modifierGroups[0];

      setSelectedGroupId(firstGroup.id);
      setSelectedGroup(firstGroup);

      return;
    }

    setSelectedGroup(currentGroup);
  }, [modifierGroups, selectedGroupId]);

  /*
   * ---------------------------------------------------------
   * Modifier Group handlers
   * ---------------------------------------------------------
   */
  const handleSelectGroup = (group: ModifierGroup) => {
    setSelectedGroupId(group.id);
    setSelectedGroup(group);
  };

  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    if (isSavingGroup) {
      return;
    }

    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleSaveGroup = async (
    payload: CreateModifierGroupPayload | UpdateModifierGroupPayload,
  ) => {
    setIsSavingGroup(true);

    try {
      if (editingGroup) {
        const updatedGroup = await editModifierGroup(
          editingGroup.id,
          payload as UpdateModifierGroupPayload,
        );

        setSelectedGroupId(updatedGroup.id);
        setSelectedGroup(updatedGroup);
      } else {
        const createdGroup = await addModifierGroup(
          payload as CreateModifierGroupPayload,
        );

        setSelectedGroupId(createdGroup.id);
        setSelectedGroup(createdGroup);
      }

      setIsGroupModalOpen(false);
      setEditingGroup(null);
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (group: ModifierGroup) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete modifier group "${group.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeModifierGroup(group.id);
    } catch {
      // Error is stored by the hook.
    }
  };

  /*
   * ---------------------------------------------------------
   * Modifier handlers
   * ---------------------------------------------------------
   */
  const handleOpenAddModifier = () => {
    setEditingModifier(null);
    setIsModifierModalOpen(true);
  };

  const handleOpenEditModifier = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setIsModifierModalOpen(true);
  };

  const handleCloseModifierModal = () => {
    if (isSavingModifier) {
      return;
    }

    setIsModifierModalOpen(false);
    setEditingModifier(null);
  };

  const handleSaveModifier = async (
    payload: CreateModifierPayload | UpdateModifierPayload,
  ) => {
    setIsSavingModifier(true);

    try {
      if (editingModifier) {
        await editModifier(
          editingModifier.id,
          payload as UpdateModifierPayload,
        );
      } else {
        await addModifier(payload as CreateModifierPayload);
      }

      setIsModifierModalOpen(false);
      setEditingModifier(null);
    } finally {
      setIsSavingModifier(false);
    }
  };

  const handleDeleteModifier = async (modifier: Modifier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete modifier "${modifier.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeModifier(modifier.id);
    } catch {
      // Error is stored by the hook.
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="p-5 bg-white border border-[#E8E5DD] rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#C83214] font-bold block uppercase">
            MENU MODIFIERS
          </span>

          <h3 className="text-base font-display font-black text-[#1F2226] mt-0.5">
            Modifier Groups & Options
          </h3>

          <p className="text-[10px] text-[#8C7A6B] mt-1">
            Manage reusable modifier groups and their menu options.
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN WORKSPACE
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.8fr)] gap-6 items-start">
        {/* ===================================================
            LEFT — MODIFIER GROUPS
        ==================================================== */}
        <ModifierGroupList
          modifierGroups={modifierGroups}
          selectedGroupId={selectedGroupId}
          isLoading={isGroupsLoading}
          error={groupsError}
          onSelectGroup={handleSelectGroup}
          onAddGroup={handleOpenAddGroup}
          onEditGroup={handleOpenEditGroup}
          onDeleteGroup={handleDeleteGroup}
        />

        {/* ===================================================
            RIGHT — SELECTED GROUP
        ==================================================== */}
        <div className="bg-white border border-[#E8E5DD] rounded-[2rem] min-h-[500px] overflow-hidden">
          {!selectedGroup ? (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E8E5DD] flex items-center justify-center">
                <Layers3 size={20} className="text-[#8C7A6B]" />
              </div>

              <h4 className="text-sm font-display font-black text-[#1F2226] mt-4">
                No modifier group selected
              </h4>

              <p className="text-[10px] text-[#8C7A6B] mt-1.5 max-w-xs leading-relaxed">
                Select a modifier group from the left panel to manage its
                modifiers.
              </p>
            </div>
          ) : (
            <>
              {/* =============================================
                  SELECTED GROUP HEADER
              ============================================== */}
              <div className="p-5 border-b border-[#ECE7E1]">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-display font-black text-[#1F2226] truncate">
                        {selectedGroup.name}
                      </h3>

                      <span
                        className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md ${
                          selectedGroup.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {selectedGroup.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md ${
                          selectedGroup.modifierType === "include"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {selectedGroup.modifierType === "include"
                          ? "Include"
                          : "Exclude"}
                      </span>

                      <span className="text-[9px] font-mono text-[#8C7A6B]">
                        Group ID: {selectedGroup.id}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditGroup(selectedGroup)}
                    className="px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E5DD] hover:border-[#E76F51] hover:text-[#C83214] text-[10px] font-display font-bold text-[#6B7280] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Settings2 size={13} />
                    Edit Group
                  </button>
                </div>
              </div>

              {/* =============================================
                  MODIFIERS
              ============================================== */}
              <div className="p-5">
                <ModifierList
                  modifiers={modifiers}
                  isLoading={isModifiersLoading}
                  error={modifiersError}
                  onAddModifier={handleOpenAddModifier}
                  onEditModifier={handleOpenEditModifier}
                  onDeleteModifier={handleDeleteModifier}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          GROUP MODAL
      ====================================================== */}
      <ModifierGroupFormModal
        isOpen={isGroupModalOpen}
        editingGroup={editingGroup}
        isSaving={isSavingGroup}
        error={groupsError ?? ""}
        onClose={handleCloseGroupModal}
        onSubmit={handleSaveGroup}
      />

      {/* =====================================================
          MODIFIER MODAL
      ====================================================== */}
      <ModifierFormModal
        isOpen={isModifierModalOpen}
        editingModifier={editingModifier}
        modifierGroups={modifierGroups}
        selectedGroup={selectedGroup}
        isSaving={isSavingModifier}
        error={modifiersError ?? ""}
        onClose={handleCloseModifierModal}
        onSubmit={handleSaveModifier}
      />
    </div>
  );
}
