import { apiRequest } from "./api/client";

import {
  MenuCategory,
  CreateMenuCategoryPayload,
  UpdateMenuCategoryPayload,
} from "../types/types";

/**
 * Backend category status values.
 *
 * Laravel:
 * 1 = ACTIVE
 * 2 = INACTIVE
 * 3 = UNAVAILABLE
 */
type LaravelMenuCategoryStatus = 1 | 2 | 3;

interface LaravelMenuCategory {
  id: number;
  restaurant_id: number;
  category_name: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  status: LaravelMenuCategoryStatus;
}

interface LaravelCategoryListResponse {
  success: boolean;
  message: string;
  data: LaravelMenuCategory[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface LaravelCategoryResponse {
  success: boolean;
  message: string;
  data: LaravelMenuCategory;
}

interface LaravelDeleteCategoryResponse {
  success: boolean;
  message: string;
}

function normalizeStatus(
  status: LaravelMenuCategoryStatus,
): MenuCategory["status"] {
  switch (status) {
    case 1:
      return "active";

    case 2:
      return "inactive";

    case 3:
      return "unavailable";
  }
}

// currently not in a use
function statusToLaravelStatus(
  status: MenuCategory["status"],
): LaravelMenuCategoryStatus {
  switch (status) {
    case "active":
      return 1;

    case "inactive":
      return 2;

    case "unavailable":
      return 3;
  }
}

function normalizeCategory(category: LaravelMenuCategory): MenuCategory {
  return {
    id: String(category.id),

    name: category.category_name,

    description: category.description,

    imagePath: category.image_path,

    sortOrder: Number(category.sort_order),

    status: normalizeStatus(category.status),
  };
}

export class MenuCategoryService {
  /**
   * Fetch restaurant categories.
   *
   * GET /api/v1/menu-item-category/categories
   */
  static async getCategories(): Promise<MenuCategory[]> {
    const response = await apiRequest<LaravelCategoryListResponse>(
      "/api/v1/menu-item-category/categories",
      {
        method: "GET",
      },
    );

    return response.data.map(normalizeCategory);
  }

  /**
   * Create a restaurant category.
   *
   * POST /api/v1/menu-item-category/create-category
   */
  static async createCategory(
    payload: CreateMenuCategoryPayload,
  ): Promise<MenuCategory> {
    const response = await apiRequest<LaravelCategoryResponse>(
      "/api/v1/menu-item-category/create-category",
      {
        method: "POST",

        body: JSON.stringify({
          category_name: payload.category_name.trim(),
          desc: payload.desc ?? null,
          img_uri: payload.img_uri ?? null,
          sort_order: payload.sort_order ?? 0,
          status: payload.status ?? 1,
        }),
      },
    );

    return normalizeCategory(response.data);
  }

  /**
   * Update a restaurant category.
   *
   * PATCH /api/v1/menu-item-category/update-category/{category}
   */
  static async updateCategory(
    categoryId: string,
    payload: UpdateMenuCategoryPayload,
  ): Promise<MenuCategory> {
    const body: Record<string, unknown> = {};

    if (payload.category_name !== undefined) {
      body.category_name = payload.category_name.trim();
    }

    if (payload.desc !== undefined) {
      body.desc = payload.desc;
    }

    if (payload.img_uri !== undefined) {
      body.img_uri = payload.img_uri;
    }

    if (payload.sort_order !== undefined) {
      body.sort_order = payload.sort_order;
    }

    if (payload.status !== undefined) {
      body.status = payload.status;
    }

    const response = await apiRequest<LaravelCategoryResponse>(
      `/api/v1/menu-item-category/update-category/${categoryId}`,
      {
        method: "PATCH",

        body: JSON.stringify(body),
      },
    );

    return normalizeCategory(response.data);
  }

  /**
   * Soft-delete a restaurant category.
   *
   * DELETE /api/v1/menu-item-category/remove-category/{category}
   */
  static async deleteCategory(
    categoryId: string,
  ): Promise<LaravelDeleteCategoryResponse> {
    return apiRequest<LaravelDeleteCategoryResponse>(
      `/api/v1/menu-item-category/remove-category/${categoryId}`,
      {
        method: "DELETE",
      },
    );
  }
}
