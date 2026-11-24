import { useCallback, useEffect, useRef, useState } from "react";

import {
  CreateMenuItemPayload,
  MenuItemListFilters,
  MenuItemPagination,
  RestaurantMenuItem,
  UpdateMenuItemPayload,
} from "@/src/types/types";

import { MenuItemService } from "@/src/services/menu_item.service";

import { getApiErrorMessage } from "@/src/services/api/client";

interface UseMenuItemsReturn {
  menuItems: RestaurantMenuItem[];

  pagination: MenuItemPagination;

  isLoading: boolean;
  error: string | null;

  refreshMenuItems: (filters?: MenuItemListFilters) => Promise<void>;

  addMenuItem: (payload: CreateMenuItemPayload) => Promise<RestaurantMenuItem>;

  editMenuItem: (
    menuItemId: string,
    payload: UpdateMenuItemPayload,
  ) => Promise<RestaurantMenuItem>;

  removeMenuItem: (menuItemId: string) => Promise<void>;
}

const EMPTY_PAGINATION: MenuItemPagination = {
  currentPage: 1,
  perPage: 20,
  total: 0,
  lastPage: 1,
};

export default function useMenuItems(): UseMenuItemsReturn {
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);

  const [pagination, setPagination] =
    useState<MenuItemPagination>(EMPTY_PAGINATION);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const latestMenuRequestId = useRef(0); // Prevents an older response from updating React state
  const activeMenuRequestRef = useRef<AbortController | null>(null); // Actually cancels the previous browser request.

  const refreshMenuItems = useCallback(
    async (filters: MenuItemListFilters = {}) => {
      // Cancel the previous request.
      activeMenuRequestRef.current?.abort();

      // Create a new request.
      const controller = new AbortController();
      activeMenuRequestRef.current = controller;

      // Generate a unique request ID.
      const requestId = ++latestMenuRequestId.current;

      setIsLoading(true);
      setError(null);

      try {
        const result = await MenuItemService.getMenuItems(
          filters,
          controller.signal,
        );

        // Ignore stale or cancelled responses.
        if (
          requestId !== latestMenuRequestId.current ||
          controller.signal.aborted
        ) {
          return;
        }

        setMenuItems(result.items);
        setPagination(result.pagination);
      } catch (error) {
        // Ignore stale requests and intentional cancellations.
        if (
          requestId !== latestMenuRequestId.current ||
          controller.signal.aborted
        ) {
          return;
        }

        const message = getApiErrorMessage(error, "Unable to load menu items.");

        setError(message);

        console.error("Failed to fetch restaurant menu items:", error);
      } finally {
        // Only the latest request can reset loading.
        if (requestId === latestMenuRequestId.current) {
          activeMenuRequestRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const invalidateMenuListRequest = useCallback(() => {
    // Make any currently running GET response stale.
    latestMenuRequestId.current += 1;

    // Cancel the active GET request.
    activeMenuRequestRef.current?.abort();
    activeMenuRequestRef.current = null;

    // No active list request remains.
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      // Invalidate any pending request.
      latestMenuRequestId.current += 1;

      // Cancel the active request.
      activeMenuRequestRef.current?.abort();
      activeMenuRequestRef.current = null;
    };
  }, []);

  const addMenuItem = useCallback(
    async (payload: CreateMenuItemPayload): Promise<RestaurantMenuItem> => {
      setError(null);

      try {
        const createdMenuItem = await MenuItemService.createMenuItem(payload);

        invalidateMenuListRequest();

        setMenuItems((currentItems) => [...currentItems, createdMenuItem]);

        setPagination((currentPagination) => ({
          ...currentPagination,
          total: currentPagination.total + 1,
        }));

        return createdMenuItem;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to create menu item.",
        );

        setError(message);

        console.error("Failed to create menu item:", error);

        throw error;
      }
    },
    [invalidateMenuListRequest],
  );

  const editMenuItem = useCallback(
    async (
      menuItemId: string,
      payload: UpdateMenuItemPayload,
    ): Promise<RestaurantMenuItem> => {
      setError(null);

      try {
        const updatedMenuItem = await MenuItemService.updateMenuItem(
          menuItemId,
          payload,
        );

        invalidateMenuListRequest();

        setMenuItems((currentItems) =>
          currentItems.map((item) =>
            item.id === menuItemId ? updatedMenuItem : item,
          ),
        );

        return updatedMenuItem;
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to update menu item.",
        );

        setError(message);

        console.error("Failed to update menu item:", error);

        throw error;
      }
    },
    [invalidateMenuListRequest],
  );

  const removeMenuItem = useCallback(
    async (menuItemId: string): Promise<void> => {
      setError(null);

      try {
        await MenuItemService.deleteMenuItem(menuItemId);

        invalidateMenuListRequest();

        setMenuItems((currentItems) =>
          currentItems.filter((item) => item.id !== menuItemId),
        );

        setPagination((currentPagination) => ({
          ...currentPagination,
          total: Math.max(0, currentPagination.total - 1),
        }));
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to delete menu item.",
        );

        setError(message);

        console.error("Failed to delete menu item:", error);

        throw error;
      }
    },
    [invalidateMenuListRequest],
  );

  return {
    menuItems,
    pagination,

    isLoading,
    error,

    refreshMenuItems,

    addMenuItem,
    editMenuItem,
    removeMenuItem,
  };
}
