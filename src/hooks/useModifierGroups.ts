import { useCallback, useEffect, useRef, useState } from "react";

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

  // Prevents older GET responses from overwriting newer data.
  const latestModifierGroupsRequestId = useRef(0);

  // Cancels the previously active GET request.
  const activeModifierGroupsRequestRef = useRef<AbortController | null>(null);

  const refreshModifierGroups = useCallback(async () => {
    // Cancel the previous request.
    activeModifierGroupsRequestRef.current?.abort();

    // Create a new request.
    const controller = new AbortController();
    activeModifierGroupsRequestRef.current = controller;

    // Generate a unique request ID.
    const requestId = ++latestModifierGroupsRequestId.current;

    setIsLoading(true);
    setError(null);

    try {
      const groups = await ModifierGroupService.getModifierGroups(
        controller.signal,
      );

      // Ignore stale or cancelled responses.
      if (
        requestId !== latestModifierGroupsRequestId.current ||
        controller.signal.aborted
      ) {
        return;
      }

      setModifierGroups(sortModifierGroups(groups));
    } catch (error) {
      // Ignore stale requests and intentional cancellations.
      if (
        requestId !== latestModifierGroupsRequestId.current ||
        controller.signal.aborted
      ) {
        return;
      }

      const message = getApiErrorMessage(
        error,
        "Unable to load modifier groups.",
      );

      setError(message);

      console.error("Failed to fetch modifier groups:", error);
    } finally {
      // Only the latest request controls loading state.
      if (requestId === latestModifierGroupsRequestId.current) {
        activeModifierGroupsRequestRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  const invalidateModifierGroupsRequest = useCallback(() => {
    // Make any pending GET response stale.
    latestModifierGroupsRequestId.current += 1;

    // Cancel the active GET request.
    activeModifierGroupsRequestRef.current?.abort();
    activeModifierGroupsRequestRef.current = null;

    // No active list request remains.
    setIsLoading(false);
  }, []); // This prevents an older GET request from undoing a successful create, update, or delete operation.

  // automatic fetch effect
  useEffect(() => {
    void refreshModifierGroups();

    return () => {
      // Invalidate any pending response.
      latestModifierGroupsRequestId.current += 1;

      // Cancel the active request on unmount.
      activeModifierGroupsRequestRef.current?.abort();
      activeModifierGroupsRequestRef.current = null;
    };
  }, [refreshModifierGroups]);

  const addModifierGroup = useCallback(
    async (payload: CreateModifierGroupPayload): Promise<ModifierGroup> => {
      setError(null);

      try {
        const createdGroup =
          await ModifierGroupService.createModifierGroup(payload);

        invalidateModifierGroupsRequest();

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
    [invalidateModifierGroupsRequest],
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

        invalidateModifierGroupsRequest();

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
    [invalidateModifierGroupsRequest],
  );

  const removeModifierGroup = useCallback(
    async (modifierGroupId: string): Promise<void> => {
      setError(null);

      try {
        await ModifierGroupService.deleteModifierGroup(modifierGroupId);

        invalidateModifierGroupsRequest();

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
    [invalidateModifierGroupsRequest],
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
