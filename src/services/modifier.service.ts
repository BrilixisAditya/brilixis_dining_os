import { apiRequest } from "./api/client";

import {
  CreateModifierPayload,
  Modifier,
  ModifierPagination,
  ModifierStatus,
  UpdateModifierPayload,
} from "@/src/types/types";

interface LaravelModifier {
  id: number | string;
  name: string;
  modifier_group_id?: number | string;
  modifier_group_name?: string | null;
  modifier_price: number | string;
  status:
    | number
    | string
    | {
        value?: number | string;
        name?: string;
      };
}

interface LaravelModifierListResponse {
  success: boolean;
  message: string;
  data: LaravelModifier[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface LaravelModifierCreateResponse {
  success: boolean;
  message: string;
  data: {
    id: number | string;
    name: string;
    modifier_group_name: string;
    modifier_price: number | string;
    status:
      | number
      | string
      | {
          value?: number | string;
          name?: string;
        };
  };
}

interface LaravelModifierUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: number | string;
    name: string;
    modifier_group_name: string;
    modifier_price: number | string;
    status:
      | number
      | string
      | {
          value?: number | string;
          name?: string;
        };
  };
}

interface LaravelModifierDeleteResponse {
  success: boolean;
  message: string;
  data?: {
    id: number | string;
    name?: string;
  };
}

function normalizeStatus(
  status:
    | number
    | string
    | {
        value?: number | string;
        name?: string;
      },
): ModifierStatus {
  let statusValue: number;

  if (typeof status === "number") {
    statusValue = status;
  } else if (typeof status === "string") {
    const upperStatus = status.toUpperCase();

    if (upperStatus === "ACTIVE") {
      statusValue = 1;
    } else if (upperStatus === "INACTIVE") {
      statusValue = 2;
    } else if (upperStatus === "UNAVAILABLE") {
      statusValue = 3;
    } else {
      statusValue = Number(status);
    }
  } else {
    statusValue = Number(status.value);
  }

  switch (statusValue) {
    case 1:
      return "active";

    case 2:
      return "inactive";

    case 3:
      return "unavailable";

    default:
      throw new Error(`Unknown modifier status: ${statusValue}`);
  }
}

function normalizeModifier(
  modifier: LaravelModifier,
  fallbackGroup?: {
    id: string;
    name?: string;
  },
): Modifier {
  return {
    id: String(modifier.id),

    modifierGroupId: String(
      modifier.modifier_group_id ?? fallbackGroup?.id ?? "",
    ),

    modifierGroupName:
      modifier.modifier_group_name ?? fallbackGroup?.name ?? "",

    name: modifier.name,

    modifierPrice: Number(modifier.modifier_price),

    status: normalizeStatus(modifier.status),
  };
}

export class ModifierService {
  static async getModifiers(
    modifierGroupId: string,
    options: {
      search?: string;
      status?: 1 | 2 | 3;
      per_page?: number;
    } = {},
  ): Promise<{
    modifiers: Modifier[];
    pagination: ModifierPagination;
  }> {
    const response = await apiRequest<LaravelModifierListResponse>(
      "/api/v1/modifier/modifiers",
      {
        method: "GET",
        query: {
          modifier_group_id: modifierGroupId,
          search: options.search,
          status: options.status,
          per_page: options.per_page,
        },
      },
    );

    return {
      modifiers: response.data.map((modifier) =>
        normalizeModifier(modifier, {
          id: modifierGroupId,
        }),
      ),

      pagination: {
        currentPage: response.pagination.current_page,
        perPage: response.pagination.per_page,
        total: response.pagination.total,
        lastPage: response.pagination.last_page,
      },
    };
  }

  static async createModifier(
    payload: CreateModifierPayload,
    modifierGroupName?: string,
  ): Promise<Modifier> {
    const response = await apiRequest<LaravelModifierCreateResponse>(
      "/api/v1/modifier/create-modifier",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return normalizeModifier(
      {
        id: response.data.id,
        name: response.data.name,
        modifier_group_id: payload.modifier_group_id,
        modifier_group_name: response.data.modifier_group_name,
        modifier_price: response.data.modifier_price,
        status: response.data.status,
      },
      {
        id: payload.modifier_group_id,
        name: modifierGroupName,
      },
    );
  }

  static async updateModifier(
    modifierId: string,
    payload: UpdateModifierPayload,
    fallbackGroup: {
      id: string;
      name?: string;
    },
  ): Promise<Modifier> {
    const response = await apiRequest<LaravelModifierUpdateResponse>(
      `/api/v1/modifier/update-modifier/${modifierId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return normalizeModifier(
      {
        id: response.data.id,
        name: response.data.name,
        modifier_group_id: payload.modifier_group_id,
        modifier_group_name: response.data.modifier_group_name,
        modifier_price: response.data.modifier_price,
        status: response.data.status,
      },
      {
        id: payload.modifier_group_id ?? fallbackGroup.id,
        name: response.data.modifier_group_name ?? fallbackGroup.name,
      },
    );
  }

  static async deleteModifier(modifierId: string): Promise<void> {
    await apiRequest<LaravelModifierDeleteResponse>(
      `/api/v1/modifier/remove-modifier/${modifierId}`,
      {
        method: "DELETE",
      },
    );
  }
}
