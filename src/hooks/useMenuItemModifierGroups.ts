import { useCallback, useEffect, useState } from "react";

import {
  AttachModifierGroupPayload,
  MenuItemModifierGroupAssignment,
  ModifierGroup,
  UpdateMenuItemModifierGroupPayload,
} from "@/src/types/types";

import { getApiErrorMessage } from "@/src/services/api/client";

import { MenuItemModifierGroupService } from "@/src/services/menu_item_modifier_group.service";

interface UseMenuItemModifierGroupsReturn {
  assignments: MenuItemModifierGroupAssignment[];

  isLoading: boolean;

  error: string | null;

  refreshAssignments: () => Promise<void>;

  attachGroup: (
    payload: AttachModifierGroupPayload,
  ) => Promise<MenuItemModifierGroupAssignment>;

  editAssignment: (
    assignmentId: string,
    payload: UpdateMenuItemModifierGroupPayload,
  ) => Promise<MenuItemModifierGroupAssignment>;

  removeAssignment: (assignmentId: string) => Promise<void>;
}

interface UseMenuItemModifierGroupsOptions {
  menuItemId: string | null;
  modifierGroups: ModifierGroup[];
}

export default function useMenuItemModifierGroups({
  menuItemId,
  modifierGroups,
}: UseMenuItemModifierGroupsOptions): UseMenuItemModifierGroupsReturn {
  const [assignments, setAssignments] = useState<
    MenuItemModifierGroupAssignment[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const refreshAssignments = useCallback(async () => {
    if (!menuItemId) {
      setAssignments([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result =
        await MenuItemModifierGroupService.getAssignments(menuItemId);

      /*
       * The GET response includes modifierGroup.
       * If some response ever lacks that relationship,
       * use the already-loaded modifier group list
       * to fill the display information.
       */
      const normalized = result.map((assignment) => {
        if (assignment.modifierGroupName) {
          return assignment;
        }

        const group = modifierGroups.find(
          (item) => item.id === assignment.modifierGroupId,
        );

        if (!group) {
          return assignment;
        }

        return {
          ...assignment,
          modifierGroupName: group.name,
          modifierGroupType: group.modifierType,
        };
      });

      setAssignments(normalized);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to load modifier groups for this menu item.",
      );

      setError(message);

      console.error("Failed to fetch menu item modifier groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, [menuItemId, modifierGroups]);

  useEffect(() => {
    void refreshAssignments();
  }, [refreshAssignments]);

  const attachGroup = useCallback(
    async (
      payload: AttachModifierGroupPayload,
    ): Promise<MenuItemModifierGroupAssignment> => {
      if (!menuItemId) {
        throw new Error(
          "A menu item must be selected before attaching a modifier group.",
        );
      }

      setError(null);

      try {
        const group = modifierGroups.find(
          (item) => item.id === payload.modifier_group_id,
        );

        const createdAssignment =
          await MenuItemModifierGroupService.attachModifierGroup(
            menuItemId,
            payload,
            group
              ? {
                  name: group.name,
                  type: group.modifierType,
                }
              : undefined,
          );

        setAssignments((current) => [...current, createdAssignment]);

        return createdAssignment;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to attach modifier group.",
        );

        setError(message);

        console.error("Failed to attach modifier group:", error);

        throw error;
      }
    },
    [menuItemId, modifierGroups],
  );

  const editAssignment = useCallback(
    async (
      assignmentId: string,
      payload: UpdateMenuItemModifierGroupPayload,
    ): Promise<MenuItemModifierGroupAssignment> => {
      setError(null);

      try {
        const currentAssignment = assignments.find(
          (item) => item.id === assignmentId,
        );

        const finalGroupId =
          payload.modifier_group_id ?? currentAssignment?.modifierGroupId ?? "";

        const group = modifierGroups.find((item) => item.id === finalGroupId);

        const updatedAssignment =
          await MenuItemModifierGroupService.updateAssignment(
            assignmentId,
            payload,
            group
              ? {
                  name: group.name,
                  type: group.modifierType,
                }
              : undefined,
          );

        /*
         * If the assignment was moved to another
         * modifier group, it still remains an
         * assignment belonging to this menu item.
         */
        setAssignments((current) =>
          current.map((item) =>
            item.id === assignmentId ? updatedAssignment : item,
          ),
        );

        return updatedAssignment;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to update modifier group assignment.",
        );

        setError(message);

        console.error("Failed to update modifier group assignment:", error);

        throw error;
      }
    },
    [assignments, modifierGroups],
  );

  const removeAssignment = useCallback(
    async (assignmentId: string): Promise<void> => {
      setError(null);

      try {
        await MenuItemModifierGroupService.deleteAssignment(assignmentId);

        setAssignments((current) =>
          current.filter((item) => item.id !== assignmentId),
        );
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to remove modifier group.",
        );

        setError(message);

        console.error("Failed to remove modifier group assignment:", error);

        throw error;
      }
    },
    [],
  );

  return {
    assignments,
    isLoading,
    error,
    refreshAssignments,
    attachGroup,
    editAssignment,
    removeAssignment,
  };
}
