import { apiRequest } from "./api/client";

import {
  AttachModifierGroupPayload,
  MenuItemModifierGroupAssignment,
  ModifierGroupType,
  UpdateMenuItemModifierGroupPayload,
} from "@/src/types/types";

interface LaravelModifierGroup {
  id: number | string;
  name: string;
  modifier_type:
    | number
    | string
    | {
        value?: number | string;
        name?: string;
      };
}

interface LaravelAssignment {
  id: number | string;
  menu_item_id: number | string;
  modifier_group_id: number | string;
  min_selection: number;
  max_selection: number;

  modifierGroup?: LaravelModifierGroup;
}

interface LaravelAssignmentListResponse {
  success: boolean;
  message: string;
  data: LaravelAssignment[];
}

interface LaravelAssignmentResponse {
  success: boolean;
  message: string;
  data: {
    id: number | string;
    menu_item_id: number | string;
    modifier_group_id: number | string;
    min_selection: number;
    max_selection: number;
  };
}

interface LaravelAssignmentDeleteResponse {
  success: boolean;
  message: string;
}

function normalizeModifierGroupType(
  modifierType: LaravelModifierGroup["modifier_type"],
): ModifierGroupType {
  let value: number;

  if (typeof modifierType === "number") {
    value = modifierType;
  } else if (typeof modifierType === "string") {
    const normalized = modifierType.toUpperCase();

    if (normalized === "INCLUDE") {
      value = 1;
    } else if (normalized === "EXCLUDE") {
      value = 2;
    } else {
      value = Number(modifierType);
    }
  } else {
    value = Number(modifierType.value);
  }

  switch (value) {
    case 1:
      return "include";

    case 2:
      return "exclude";

    default:
      throw new Error(`Unknown modifier group type: ${String(modifierType)}`);
  }
}

function normalizeAssignment(
  assignment: LaravelAssignment,
): MenuItemModifierGroupAssignment {
  return {
    id: String(assignment.id),

    menuItemId: String(assignment.menu_item_id),

    modifierGroupId: String(assignment.modifier_group_id),

    modifierGroupName: assignment.modifierGroup?.name ?? "",

    modifierGroupType: assignment.modifierGroup
      ? normalizeModifierGroupType(assignment.modifierGroup.modifier_type)
      : "include",

    minSelection: Number(assignment.min_selection),

    maxSelection: Number(assignment.max_selection),
  };
}

function normalizeAssignmentResponse(
  response: LaravelAssignmentResponse,
  modifierGroup?: {
    id: string;
    name: string;
    type: ModifierGroupType;
  },
): MenuItemModifierGroupAssignment {
  return {
    id: String(response.data.id),

    menuItemId: String(response.data.menu_item_id),

    modifierGroupId: String(response.data.modifier_group_id),

    modifierGroupName: modifierGroup?.name ?? "",

    modifierGroupType: modifierGroup?.type ?? "include",

    minSelection: Number(response.data.min_selection),

    maxSelection: Number(response.data.max_selection),
  };
}

export class MenuItemModifierGroupService {
  static async getAssignments(
    menuItemId: string,
  ): Promise<MenuItemModifierGroupAssignment[]> {
    const response = await apiRequest<LaravelAssignmentListResponse>(
      `/api/v1/menu-item/${menuItemId}/modifier-groups`,
      {
        method: "GET",
      },
    );

    return response.data.map(normalizeAssignment);
  }

  static async attachModifierGroup(
    menuItemId: string,
    payload: AttachModifierGroupPayload,
    modifierGroup?: {
      name: string;
      type: ModifierGroupType;
    },
  ): Promise<MenuItemModifierGroupAssignment> {
    const response = await apiRequest<LaravelAssignmentResponse>(
      `/api/v1/menu-item/${menuItemId}/attach-modifier-group`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return normalizeAssignmentResponse(
      response,
      modifierGroup
        ? {
            id: payload.modifier_group_id,
            name: modifierGroup.name,
            type: modifierGroup.type,
          }
        : undefined,
    );
  }

  static async updateAssignment(
    assignmentId: string,
    payload: UpdateMenuItemModifierGroupPayload,
    modifierGroup?: {
      name: string;
      type: ModifierGroupType;
    },
  ): Promise<MenuItemModifierGroupAssignment> {
    const response = await apiRequest<LaravelAssignmentResponse>(
      `/api/v1/menu-item/modifier-group/${assignmentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return normalizeAssignmentResponse(
      response,
      modifierGroup
        ? {
            id: payload.modifier_group_id ?? "",
            name: modifierGroup.name,
            type: modifierGroup.type,
          }
        : undefined,
    );
  }

  static async deleteAssignment(assignmentId: string): Promise<void> {
    await apiRequest<LaravelAssignmentDeleteResponse>(
      `/api/v1/menu-item/modifier-group/${assignmentId}`,
      {
        method: "DELETE",
      },
    );
  }
}
