import { apiRequest } from "./api/client";

import {
  RestaurantTable,
  CreateRestaurantTablePayload,
  UpdateRestaurantTablePayload,
  RestaurantTableSection,
} from "../types/types";

/**
 * Backend table status values.
 *
 * Laravel:
 * 1 = AVAILABLE
 * 2 = RESERVED
 * 3 = OCCUPIED
 * 4 = INACTIVE
 */
type LaravelTableStatus = 1 | 2 | 3 | 4;

interface LaravelRestaurantTable {
  id: number;
  restaurant_id: number;
  table_code: string;
  table_name: string;
  section: RestaurantTableSection;
  capacity: number;
  qr_token: string;
  status: LaravelTableStatus;
}

interface LaravelTableListResponse {
  success: boolean;
  message: string;
  data: LaravelRestaurantTable[];
}

interface LaravelTableResponse {
  success: boolean;
  message: string;
  data: LaravelRestaurantTable;
}

interface LaravelDeleteTableResponse {
  success: boolean;
  message: string;
}

/**
 * Convert backend numeric status
 * into the frontend status string.
 */
function normalizeStatus(
  status: LaravelTableStatus,
): RestaurantTable["status"] {
  switch (status) {
    case 1:
      return "available";

    case 2:
      return "reserved";

    case 3:
      return "occupied";

    case 4:
      return "disabled";
  }
}

/**
 * Extract the frontend-only table number
 * from backend table_code.
 *
 * Example:
 * DEMO-T005 -> 5
 */
function extractTableNumber(tableCode: string): number {
  const match = tableCode.match(/-T(\d+)$/);

  if (!match) {
    throw new Error(`Invalid table code received: ${tableCode}`);
  }

  return Number(match[1]);
}

/**
 * Convert Laravel table object
 * into the frontend RestaurantTable model.
 */
function normalizeTable(table: LaravelRestaurantTable): RestaurantTable {
  return {
    id: String(table.id),

    number: extractTableNumber(table.table_code),

    name: table.table_name,

    capacity: Number(table.capacity),

    section: table.section,

    status: normalizeStatus(table.status),
  };
}

function statusToLaravelStatus(
  status: RestaurantTable["status"],
): LaravelTableStatus {
  switch (status) {
    case "available":
      return 1;

    case "reserved":
      return 2;

    case "occupied":
      return 3;

    case "disabled":
      return 4;
  }
}

export class TableService {
  /**
   * Fetch all restaurant tables.
   */
  static async getTables(): Promise<RestaurantTable[]> {
    const response = await apiRequest<LaravelTableListResponse>(
      "/api/v1/tables",
      {
        method: "GET",
      },
    );

    return response.data.map(normalizeTable);
  }

  /**
   * Create a new restaurant table.
   *
   * Important:
   * number is NOT sent because the backend
   * generates table_code/table sequence.
   */
  static async createTable(
    payload: CreateRestaurantTablePayload,
  ): Promise<RestaurantTable> {
    const response = await apiRequest<LaravelTableResponse>(
      "/api/v1/tables/create-table",
      {
        method: "POST",

        body: JSON.stringify({
          table_name: payload.table_name.trim(),
          section: payload.section,
          capacity: payload.capacity,
        }),
      },
    );

    return normalizeTable(response.data);
  }

  /**
   * Update an existing restaurant table.
   */
  static async updateTable(
    tableId: string,
    payload: UpdateRestaurantTablePayload,
  ): Promise<RestaurantTable> {
    const body: Record<string, unknown> = {};

    if (payload.table_name !== undefined) {
      body.table_name = payload.table_name.trim();
    }

    if (payload.section !== undefined) {
      body.section = payload.section;
    }

    if (payload.capacity !== undefined) {
      body.capacity = payload.capacity;
    }

    if (payload.status !== undefined) {
      body.status = statusToLaravelStatus(payload.status);
    }

    const response = await apiRequest<LaravelTableResponse>(
      `/api/v1/tables/edit-table/${tableId}`,
      {
        method: "PATCH",

        body: JSON.stringify(body),
      },
    );

    return normalizeTable(response.data);
  }

  /**
   * Soft-delete a restaurant table.
   */
  static async deleteTable(
    tableId: string,
  ): Promise<LaravelDeleteTableResponse> {
    return apiRequest<LaravelDeleteTableResponse>(
      `/api/v1/tables/delete-table/${tableId}`,
      {
        method: "DELETE",
      },
    );
  }
}
