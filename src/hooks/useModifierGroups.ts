import { useCallback, useEffect, useState } from "react";

import {
  CreateModifierGroupPayload,
  ModifierGroup,
  UpdateModifierGroupPayload,
} from "@/src/types/types";

import { getApiErrorMessage } from "@/src/services/api/client";
import { ModifierGroupService } from "@/src/services/modifier_group.service";

interface UseModifierGroupsReturn {
  modifierGroups: ModifierGroup[];

  isLoading: boolean;

  error: string | null;

  refreshModifierGroups: () => Promise<void>;

  addModifierGroup: (
    payload: CreateModifierGroupPayload,
  ) => Promise<ModifierGroup>;

  editModifierGroup: (
    modifierGroupId: string,
    payload: UpdateModifierGroupPayload,
  ) => Promise<ModifierGroup>;

  removeModifierGroup: (modifierGroupId: string) => Promise<void>;
}

function sortModifierGroups(groups: ModifierGroup[]): ModifierGroup[] {
  return [...groups].sort((a, b) => {
    return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  });
}

export default function useModifierGroups(): UseModifierGroupsReturn {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshModifierGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const groups = await ModifierGroupService.getModifierGroups();

      setModifierGroups(sortModifierGroups(groups));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to load modifier groups.",
      );

      setError(message);

      console.error("Failed to fetch modifier groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshModifierGroups();
  }, [refreshModifierGroups]);

  const addModifierGroup = useCallback(
    async (payload: CreateModifierGroupPayload): Promise<ModifierGroup> => {
      setError(null);

      try {
        const createdGroup =
          await ModifierGroupService.createModifierGroup(payload);

        setModifierGroups((currentGroups) =>
          sortModifierGroups([...currentGroups, createdGroup]),
        );

        return createdGroup;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to create modifier group.",
        );

        setError(message);

        console.error("Failed to create modifier group:", error);

        throw error;
      }
    },
    [],
  );

  const editModifierGroup = useCallback(
    async (
      modifierGroupId: string,
      payload: UpdateModifierGroupPayload,
    ): Promise<ModifierGroup> => {
      setError(null);

      try {
        const updatedGroup = await ModifierGroupService.updateModifierGroup(
          modifierGroupId,
          payload,
        );

        setModifierGroups((currentGroups) =>
          sortModifierGroups(
            currentGroups.map((group) =>
              group.id === modifierGroupId
                ? {
                    ...group,
                    ...updatedGroup,
                  }
                : group,
            ),
          ),
        );

        return updatedGroup;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to update modifier group.",
        );

        setError(message);

        console.error("Failed to update modifier group:", error);

        throw error;
      }
    },
    [],
  );

  const removeModifierGroup = useCallback(
    async (modifierGroupId: string): Promise<void> => {
      setError(null);

      try {
        await ModifierGroupService.deleteModifierGroup(modifierGroupId);

        setModifierGroups((currentGroups) =>
          currentGroups.filter((group) => group.id !== modifierGroupId),
        );
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to delete modifier group.",
        );

        setError(message);

        console.error("Failed to delete modifier group:", error);

        throw error;
      }
    },
    [],
  );

  return {
    modifierGroups,
    isLoading,
    error,
    refreshModifierGroups,
    addModifierGroup,
    editModifierGroup,
    removeModifierGroup,
  };
}
