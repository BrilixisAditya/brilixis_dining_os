import { useCallback, useEffect, useState } from "react";

import {
  RestaurantTable,
  CreateRestaurantTablePayload,
  UpdateRestaurantTablePayload,
} from "@/src/types/types";

import { TableService } from "@/src/services/table.service";
import { getApiErrorMessage } from "@/src/services/api/client";

interface UseTablesReturn {
  restaurantTables: RestaurantTable[];
  isLoading: boolean;
  error: string | null;

  refreshTables: () => Promise<void>;

  addTable: (payload: CreateRestaurantTablePayload) => Promise<RestaurantTable>;

  editTable: (
    tableId: string,
    payload: UpdateRestaurantTablePayload,
  ) => Promise<RestaurantTable>;

  removeTable: (tableId: string) => Promise<void>;
}

function sortTables(tables: RestaurantTable[]): RestaurantTable[] {
  return [...tables].sort((a, b) => a.number - b.number);
}

export default function useTables(): UseTablesReturn {
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTable[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * GET /api/v1/tables
   */
  const refreshTables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tables = await TableService.getTables();

      setRestaurantTables(sortTables(tables));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to load restaurant tables.",
      );

      setError(message);

      console.error("Failed to fetch restaurant tables:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load tables automatically when the hook is mounted.
   */
  useEffect(() => {
    void refreshTables();
  }, [refreshTables]);

  /**
   * POST /api/v1/tables/create-table
   */
  const addTable = useCallback(
    async (payload: CreateRestaurantTablePayload): Promise<RestaurantTable> => {
      setError(null);

      try {
        const createdTable = await TableService.createTable(payload);

        setRestaurantTables((currentTables) =>
          sortTables([...currentTables, createdTable]),
        );

        return createdTable;
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to create table.");

        setError(message);

        console.error("Failed to create restaurant table:", error);

        throw error;
      }
    },
    [],
  );

  /**
   * PATCH /api/v1/tables/edit-table/{table}
   */
  const editTable = useCallback(
    async (
      tableId: string,
      payload: UpdateRestaurantTablePayload,
    ): Promise<RestaurantTable> => {
      setError(null);

      try {
        const updatedTable = await TableService.updateTable(tableId, payload);

        setRestaurantTables((currentTables) =>
          sortTables(
            currentTables.map((table) => {
              if (table.id !== tableId) {
                return table;
              }

              return {
                ...table,
                ...updatedTable,
              };
            }),
          ),
        );

        return updatedTable;
      } catch (error) {
        const message = getApiErrorMessage(error, "Unable to update table.");

        setError(message);

        console.error("Failed to update restaurant table:", error);

        throw error;
      }
    },
    [],
  );

  /**
   * DELETE /api/v1/tables/delete-table/{table}
   */
  const removeTable = useCallback(async (tableId: string): Promise<void> => {
    setError(null);

    try {
      await TableService.deleteTable(tableId);

      setRestaurantTables((currentTables) =>
        currentTables.filter((table) => table.id !== tableId),
      );
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to delete table.");

      setError(message);

      console.error("Failed to delete restaurant table:", error);

      throw error;
    }
  }, []);

  return {
    restaurantTables,
    isLoading,
    error,
    refreshTables,
    addTable,
    editTable,
    removeTable,
  };
}
