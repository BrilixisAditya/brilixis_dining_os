import { apiRequest } from "./api/client";

import {
  CreateModifierGroupPayload,
  ModifierGroup,
  ModifierGroupType,
  UpdateModifierGroupPayload,
} from "@/src/types/types";

interface LaravelModifierGroup {
  id: number | string;
  restaurant_id: number | string;
  name: string;
  modifier_type:
    | number
    | string
    | {
        value?: number | string;
        name?: string;
      };
  is_active: boolean | number;
}

interface LaravelModifierGroupListResponse {
  success: boolean;
  message: string;
  data: LaravelModifierGroup[];
}

interface LaravelModifierGroupResponse {
  success: boolean;
  message: string;
  data: LaravelModifierGroup;
}

interface LaravelCreateModifierGroupResponse {
  success: boolean;
  message: string;
  data: LaravelModifierGroup;
}

interface LaravelUpdateModifierGroupResponse {
  success: boolean;
  message: string;
  data: LaravelModifierGroup;
}

interface LaravelDeleteModifierGroupResponse {
  success: boolean;
  message: string;
  data?: {
    id: number | string;
  };
}

function normalizeModifierGroupType(
  modifierType: LaravelModifierGroup["modifier_type"],
): ModifierGroupType {
  let typeValue: number;

  if (typeof modifierType === "number") {
    typeValue = modifierType;
  } else if (typeof modifierType === "string") {
    typeValue =
      modifierType === "INCLUDE"
        ? 1
        : modifierType === "EXCLUDE"
          ? 2
          : Number(modifierType);
  } else {
    typeValue = Number(modifierType.value);
  }

  switch (typeValue) {
    case 1:
      return "include";

    case 2:
      return "exclude";

    default:
      throw new Error(`Unknown modifier group type: ${String(modifierType)}`);
  }
}

function normalizeModifierGroup(group: LaravelModifierGroup): ModifierGroup {
  return {
    id: String(group.id),
    restaurantId: String(group.restaurant_id),
    name: group.name,
    modifierType: normalizeModifierGroupType(group.modifier_type),
    isActive:
      typeof group.is_active === "boolean"
        ? group.is_active
        : Boolean(group.is_active),
  };
}

export class ModifierGroupService {
  static async getModifierGroups(): Promise<ModifierGroup[]> {
    const response = await apiRequest<LaravelModifierGroupListResponse>(
      "/api/v1/modifier-group/groups",
      {
        method: "GET",
      },
    );

    return response.data.map(normalizeModifierGroup);
  }

  static async createModifierGroup(
    payload: CreateModifierGroupPayload,
  ): Promise<ModifierGroup> {
    const response = await apiRequest<LaravelCreateModifierGroupResponse>(
      "/api/v1/modifier-group/create",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return normalizeModifierGroup(response.data);
  }

  static async updateModifierGroup(
    modifierGroupId: string,
    payload: UpdateModifierGroupPayload,
  ): Promise<ModifierGroup> {
    const response = await apiRequest<LaravelUpdateModifierGroupResponse>(
      `/api/v1/modifier-group/update/${modifierGroupId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return normalizeModifierGroup(response.data);
  }

  static async deleteModifierGroup(modifierGroupId: string): Promise<void> {
    await apiRequest<LaravelDeleteModifierGroupResponse>(
      `/api/v1/modifier-group/remove/${modifierGroupId}`,
      {
        method: "DELETE",
      },
    );
  }
}
