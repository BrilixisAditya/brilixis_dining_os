import { useCallback, useEffect, useRef, useState } from "react";

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

  // Prevents old responses from modifying newer list state.
  const latestModifiersRequestId = useRef(0);

  // Cancels the previous list request.
  const activeModifiersRequestRef = useRef<AbortController | null>(null);

  // Always identifies the group currently displayed by this hook.
  const currentModifierGroupIdRef = useRef(modifierGroupId);
  currentModifierGroupIdRef.current = modifierGroupId;

  /*
   * ---------------------------------------------------------
   * Invalidate active list request
   * ---------------------------------------------------------
   */

  const invalidateModifiersRequest = useCallback(() => {
    latestModifiersRequestId.current += 1;

    activeModifiersRequestRef.current?.abort();
    activeModifiersRequestRef.current = null;

    setIsLoading(false);
  }, []);

  /*
   * ---------------------------------------------------------
   * Fetch modifiers
   * ---------------------------------------------------------
   */

  const refreshModifiers = useCallback(async () => {
    const requestedGroupId = modifierGroupId;

    // No group selected: invalidate any previous request and clear data.
    if (!requestedGroupId) {
      latestModifiersRequestId.current += 1;

      activeModifiersRequestRef.current?.abort();
      activeModifiersRequestRef.current = null;

      setModifiers([]);
      setPagination(null);
      setError(null);
      setIsLoading(false);

      return;
    }

    // Cancel the previous GET request.
    activeModifiersRequestRef.current?.abort();

    const controller = new AbortController();
    activeModifiersRequestRef.current = controller;

    const requestId = ++latestModifiersRequestId.current;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ModifierService.getModifiers(
        requestedGroupId,
        {
          search: search.trim() || undefined,
          status,
          per_page: perPage,
        },
        controller.signal,
      );

      // Ignore stale responses, cancelled requests, and old groups.
      if (
        requestId !== latestModifiersRequestId.current ||
        controller.signal.aborted ||
        currentModifierGroupIdRef.current !== requestedGroupId
      ) {
        return;
      }

      setModifiers(sortModifiers(response.modifiers));
      setPagination(response.pagination);
    } catch (error) {
      if (
        requestId !== latestModifiersRequestId.current ||
        controller.signal.aborted ||
        currentModifierGroupIdRef.current !== requestedGroupId
      ) {
        return;
      }

      const message = getApiErrorMessage(error, "Unable to load modifiers.");

      setError(message);

      console.error("Failed to fetch modifiers:", error);
    } finally {
      if (requestId === latestModifiersRequestId.current) {
        activeModifiersRequestRef.current = null;
        setIsLoading(false);
      }
    }
  }, [modifierGroupId, search, status, perPage]);

  /*
   * ---------------------------------------------------------
   * Automatic fetch and cleanup
   * ---------------------------------------------------------
   */

  useEffect(() => {
    void refreshModifiers();

    return () => {
      latestModifiersRequestId.current += 1;

      activeModifiersRequestRef.current?.abort();
      activeModifiersRequestRef.current = null;
    };
  }, [refreshModifiers]);

  /*
   * ---------------------------------------------------------
   * Add modifier
   * ---------------------------------------------------------
   */

  const addModifier = useCallback(
    async (payload: CreateModifierPayload): Promise<Modifier> => {
      const targetGroupId = String(payload.modifier_group_id);

      setError(null);

      try {
        const createdModifier = await ModifierService.createModifier(
          payload,
          modifierGroupName,
        );

        const visibleGroupId = currentModifierGroupIdRef.current;

        // Update local state only when the created modifier belongs
        // to the group currently displayed.
        if (
          visibleGroupId &&
          createdModifier.modifierGroupId === visibleGroupId
        ) {
          invalidateModifiersRequest();

          setModifiers((currentModifiers) =>
            sortModifiers([
              ...currentModifiers.filter(
                (modifier) => modifier.id !== createdModifier.id,
              ),
              createdModifier,
            ]),
          );

          setPagination((currentPagination) =>
            currentPagination
              ? {
                  ...currentPagination,
                  total: currentPagination.total + 1,
                }
              : currentPagination,
          );
        }

        return createdModifier;
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to create modifier.");

        // Don't display an old group's mutation error in another group.
        if (currentModifierGroupIdRef.current === targetGroupId) {
          setError(message);
        }

        console.error("Failed to create modifier:", error);

        throw error;
      }
    },
    [modifierGroupName, invalidateModifiersRequest],
  );

  /*
   * ---------------------------------------------------------
   * Edit modifier
   * ---------------------------------------------------------
   */

  const editModifier = useCallback(
    async (
      modifierId: string,
      payload: UpdateModifierPayload,
    ): Promise<Modifier> => {
      const currentModifier = modifiers.find(
        (modifier) => modifier.id === modifierId,
      );

      // Remember the group before the mutation starts.
      const sourceGroupId =
        currentModifier?.modifierGroupId ?? modifierGroupId ?? "";

      const targetGroupId = String(payload.modifier_group_id ?? sourceGroupId);

      setError(null);

      try {
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

        const visibleGroupId = currentModifierGroupIdRef.current;

        // This mutation affects the displayed list if the modifier
        // was originally in this group or was moved into this group.
        if (
          visibleGroupId &&
          (visibleGroupId === sourceGroupId ||
            visibleGroupId === updatedModifier.modifierGroupId)
        ) {
          invalidateModifiersRequest();

          if (updatedModifier.modifierGroupId === visibleGroupId) {
            // Modifier remains in this group or has moved into it.
            setModifiers((currentModifiers) => {
              const alreadyExists = currentModifiers.some(
                (modifier) => modifier.id === modifierId,
              );

              if (alreadyExists) {
                return sortModifiers(
                  currentModifiers.map((modifier) =>
                    modifier.id === modifierId ? updatedModifier : modifier,
                  ),
                );
              }

              return sortModifiers([...currentModifiers, updatedModifier]);
            });

            // Increment total only when a modifier moved into this group.
            if (sourceGroupId !== visibleGroupId) {
              setPagination((currentPagination) =>
                currentPagination
                  ? {
                      ...currentPagination,
                      total: currentPagination.total + 1,
                    }
                  : currentPagination,
              );
            }
          } else {
            // Modifier has moved out of the currently displayed group.
            setModifiers((currentModifiers) =>
              currentModifiers.filter((modifier) => modifier.id !== modifierId),
            );

            if (sourceGroupId === visibleGroupId) {
              setPagination((currentPagination) =>
                currentPagination
                  ? {
                      ...currentPagination,
                      total: Math.max(0, currentPagination.total - 1),
                    }
                  : currentPagination,
              );
            }
          }
        }

        return updatedModifier;
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to update modifier.");

        if (
          currentModifierGroupIdRef.current === sourceGroupId ||
          currentModifierGroupIdRef.current === targetGroupId
        ) {
          setError(message);
        }

        console.error("Failed to update modifier:", error);

        throw error;
      }
    },
    [modifiers, modifierGroupId, modifierGroupName, invalidateModifiersRequest],
  );

  /*
   * ---------------------------------------------------------
   * Delete modifier
   * ---------------------------------------------------------
   */

  const removeModifier = useCallback(
    async (modifierId: string): Promise<void> => {
      const currentModifier = modifiers.find(
        (modifier) => modifier.id === modifierId,
      );

      const sourceGroupId =
        currentModifier?.modifierGroupId ?? modifierGroupId ?? "";

      setError(null);

      try {
        await ModifierService.deleteModifier(modifierId);

        // Only change the list if the deleted modifier belongs
        // to the group currently displayed.
        if (currentModifierGroupIdRef.current === sourceGroupId) {
          invalidateModifiersRequest();

          setModifiers((currentModifiers) =>
            currentModifiers.filter((modifier) => modifier.id !== modifierId),
          );

          setPagination((currentPagination) =>
            currentPagination
              ? {
                  ...currentPagination,
                  total: Math.max(0, currentPagination.total - 1),
                }
              : currentPagination,
          );
        }
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to delete modifier.");

        if (currentModifierGroupIdRef.current === sourceGroupId) {
          setError(message);
        }

        console.error("Failed to delete modifier:", error);

        throw error;
      }
    },
    [modifiers, modifierGroupId, invalidateModifiersRequest],
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
