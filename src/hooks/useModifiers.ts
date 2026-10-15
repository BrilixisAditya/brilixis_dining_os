import { useCallback, useEffect, useState } from "react";

import {
  CreateModifierPayload,
  Modifier,
  ModifierPagination,
  UpdateModifierPayload,
} from "@/src/types/types";

import { getApiErrorMessage } from "@/src/services/api/client";
import { ModifierService } from "@/src/services/modifier.service";

interface UseModifiersReturn {
  modifiers: Modifier[];
  pagination: ModifierPagination | null;

  isLoading: boolean;
  error: string | null;

  refreshModifiers: () => Promise<void>;

  addModifier: (payload: CreateModifierPayload) => Promise<Modifier>;

  editModifier: (
    modifierId: string,
    payload: UpdateModifierPayload,
  ) => Promise<Modifier>;

  removeModifier: (modifierId: string) => Promise<void>;
}

interface UseModifiersOptions {
  modifierGroupId: string | null;
  search?: string;
  status?: 1 | 2 | 3;
  perPage?: number;
  modifierGroupName?: string;
}

function sortModifiers(modifiers: Modifier[]): Modifier[] {
  return [...modifiers].sort((a, b) => {
    return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  });
}

export default function useModifiers({
  modifierGroupId,
  search = "",
  status,
  perPage = 20,
  modifierGroupName,
}: UseModifiersOptions): UseModifiersReturn {
  const [modifiers, setModifiers] = useState<Modifier[]>([]);

  const [pagination, setPagination] = useState<ModifierPagination | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const refreshModifiers = useCallback(async () => {
    if (!modifierGroupId) {
      setModifiers([]);
      setPagination(null);
      setError(null);
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await ModifierService.getModifiers(modifierGroupId, {
        search: search.trim() || undefined,
        status,
        per_page: perPage,
      });

      setModifiers(sortModifiers(response.modifiers));

      setPagination(response.pagination);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to load modifiers.");

      setError(message);

      console.error("Failed to fetch modifiers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [modifierGroupId, search, status, perPage]);

  useEffect(() => {
    void refreshModifiers();
  }, [refreshModifiers]);

  const addModifier = useCallback(
    async (payload: CreateModifierPayload): Promise<Modifier> => {
      setError(null);

      try {
        const createdModifier = await ModifierService.createModifier(
          payload,
          modifierGroupName,
        );

        setModifiers((currentModifiers) =>
          sortModifiers([...currentModifiers, createdModifier]),
        );

        return createdModifier;
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to create modifier.");

        setError(message);

        console.error("Failed to create modifier:", error);

        throw error;
      }
    },
    [modifierGroupName],
  );

  const editModifier = useCallback(
    async (
      modifierId: string,
      payload: UpdateModifierPayload,
    ): Promise<Modifier> => {
      setError(null);

      try {
        const currentModifier = modifiers.find(
          (modifier) => modifier.id === modifierId,
        );

        const updatedModifier = await ModifierService.updateModifier(
          modifierId,
          payload,
          {
            id:
              payload.modifier_group_id ??
              currentModifier?.modifierGroupId ??
              modifierGroupId ??
              "",

            name: currentModifier?.modifierGroupName ?? modifierGroupName,
          },
        );

        setModifiers((currentModifiers) => {
          if (updatedModifier.modifierGroupId !== modifierGroupId) {
            return currentModifiers.filter(
              (modifier) => modifier.id !== modifierId,
            );
          }

          return sortModifiers(
            currentModifiers.map((modifier) =>
              modifier.id === modifierId ? updatedModifier : modifier,
            ),
          );
        });

        return updatedModifier;
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to update modifier.");

        setError(message);

        console.error("Failed to update modifier:", error);

        throw error;
      }
    },
    [modifiers, modifierGroupId, modifierGroupName],
  );

  const removeModifier = useCallback(
    async (modifierId: string): Promise<void> => {
      setError(null);

      try {
        await ModifierService.deleteModifier(modifierId);

        setModifiers((currentModifiers) =>
          currentModifiers.filter((modifier) => modifier.id !== modifierId),
        );
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to delete modifier.");

        setError(message);

        console.error("Failed to delete modifier:", error);

        throw error;
      }
    },
    [],
  );

  return {
    modifiers,
    pagination,
    isLoading,
    error,
    refreshModifiers,
    addModifier,
    editModifier,
    removeModifier,
  };
}
