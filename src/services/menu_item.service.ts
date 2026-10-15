import { apiRequest } from "./api/client";

import {
  CreateMenuItemPayload,
  CustomerMenuItemFilters,
  MenuItemListFilters,
  MenuItemPagination,
  RestaurantMenuItem,
  RestaurantMenuItemStatus,
  UpdateMenuItemPayload,
} from "@/src/types/types";

interface LaravelMenuItem {
  id: number | string;
  restaurant_id: number | string;

  item_name: string;
  description: string | null;

  base_price: string | number;

  image_path: string | null;

  sort_order: number;

  status:
    | number
    | {
        value?: number;
        name?: string;
      };

  category_id: number | string;
  category_name?: string | null;

  food_type_id: number | string;
  food_type_name?: string | null;

  category?: {
    id: number | string;
    category_name: string;
  };

  foodType?: {
    id: number | string;
    name: string;
  };

  created_at?: string;
  updated_at?: string;
}

interface LaravelMenuItemListResponse {
  success: boolean;
  message: string;
  data: LaravelMenuItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface LaravelSingleMenuItemResponse {
  success: boolean;
  message: string;

  data: LaravelMenuItem;
}

interface LaravelCreateMenuItemResponse {
  success: boolean;
  message: string;

  data: {
    restaurant_name: string;

    category?: {
      category_id: number | string;
      category_name: string;
    };

    food_type?: {
      food_type_id: number | string;
      food_type_name: string;
    };

    menu_item: LaravelMenuItem;
  };
}

interface LaravelUpdateMenuItemResponse {
  success: boolean;
  message: string;

  data: {
    restaurant_name: string;
    menu_item: LaravelMenuItem;
  };
}

interface LaravelDeleteMenuItemResponse {
  success: boolean;
  message: string;

  data?: {
    id: number | string;
    item_name?: string;
  };
}

/**
 * Converts Laravel status number into frontend status.
 */
function normalizeStatus(
  status: LaravelMenuItem["status"],
): RestaurantMenuItemStatus {
  let statusValue: number;

  if (typeof status === "number") {
    statusValue = status;
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
      throw new Error(`Unknown menu item status: ${statusValue}`);
  }
}

/**
 * Converts Laravel menu item into our frontend model.
 */
function normalizeMenuItem(
  item: LaravelMenuItem,
  fallbackCategory?: {
    id: number | string;
    name: string;
  },
  fallbackFoodType?: {
    id: number | string;
    name: string;
  },
): RestaurantMenuItem {
  const categoryId =
    item.category_id ?? item.category?.id ?? fallbackCategory?.id ?? "";

  const categoryName =
    item.category_name ??
    item.category?.category_name ??
    fallbackCategory?.name ??
    "";

  const foodTypeId =
    item.food_type_id ?? item.foodType?.id ?? fallbackFoodType?.id ?? "";

  const foodTypeName =
    item.food_type_name ?? item.foodType?.name ?? fallbackFoodType?.name ?? "";

  return {
    id: String(item.id),

    restaurantId: String(item.restaurant_id),

    categoryId: String(categoryId),
    categoryName,

    foodTypeId: String(foodTypeId),
    foodTypeName,

    name: item.item_name,

    description: item.description ?? null,

    basePrice: Number(item.base_price),

    imagePath: item.image_path ?? null,

    sortOrder: Number(item.sort_order),

    status: normalizeStatus(item.status),

    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function normalizePagination(
  pagination: LaravelMenuItemListResponse["pagination"],
): MenuItemPagination {
  return {
    currentPage: pagination.current_page,
    perPage: pagination.per_page,
    total: pagination.total,
    lastPage: pagination.last_page,
  };
}

export class MenuItemService {
  // --------------------------------------------------------------------------
  // ADMIN
  // --------------------------------------------------------------------------

  /**
   * GET /api/v1/menu-item/items
   */
  static async getMenuItems(filters: MenuItemListFilters = {}): Promise<{
    items: RestaurantMenuItem[];
    pagination: MenuItemPagination;
  }> {
    const response = await apiRequest<LaravelMenuItemListResponse>(
      "/api/v1/menu-item/items",
      {
        method: "GET",

        query: {
          search: filters.search,
          category: filters.category,
          foodtype: filters.foodtype,
          order: filters.order,
          status: filters.status,
          per_page: filters.per_page,
        },
      },
    );

    return {
      items: response.data.map((item) => normalizeMenuItem(item)),

      pagination: normalizePagination(response.pagination),
    };
  }

  /**
   * GET /api/v1/menu-item/items/{menuItem}
   */
  static async getMenuItem(menuItemId: string): Promise<RestaurantMenuItem> {
    const response = await apiRequest<LaravelSingleMenuItemResponse>(
      `/api/v1/menu-item/items/${menuItemId}`,
      {
        method: "GET",
      },
    );

    return normalizeMenuItem(response.data);
  }

  /**
   * POST /api/v1/menu-item/create-menu-item
   */
  static async createMenuItem(
    payload: CreateMenuItemPayload,
  ): Promise<RestaurantMenuItem> {
    const response = await apiRequest<LaravelCreateMenuItemResponse>(
      "/api/v1/menu-item/create-menu-item",
      {
        method: "POST",

        body: JSON.stringify(payload),
      },
    );

    const menuItem = response.data.menu_item;

    return normalizeMenuItem(
      menuItem,

      response.data.category
        ? {
            id: response.data.category.category_id,
            name: response.data.category.category_name,
          }
        : undefined,

      response.data.food_type
        ? {
            id: response.data.food_type.food_type_id,
            name: response.data.food_type.food_type_name,
          }
        : undefined,
    );
  }

  /**
   * PATCH /api/v1/menu-item/update-menu-item/{menuItem}
   */
  static async updateMenuItem(
    menuItemId: string,
    payload: UpdateMenuItemPayload,
  ): Promise<RestaurantMenuItem> {
    const response = await apiRequest<LaravelUpdateMenuItemResponse>(
      `/api/v1/menu-item/update-menu-item/${menuItemId}`,
      {
        method: "PATCH",

        body: JSON.stringify(payload),
      },
    );

    return normalizeMenuItem(response.data.menu_item);
  }

  /**
   * DELETE /api/v1/menu-item/remove-menu-item/{menuItem}
   */
  static async deleteMenuItem(menuItemId: string): Promise<void> {
    await apiRequest<LaravelDeleteMenuItemResponse>(
      `/api/v1/menu-item/remove-menu-item/${menuItemId}`,
      {
        method: "DELETE",
      },
    );
  }

  // --------------------------------------------------------------------------
  // CUSTOMER
  // --------------------------------------------------------------------------

  /**
   * GET /api/v1/customer/menu-item/items
   *
   * Customer does not have a Sanctum token.
   * The QR token determines the restaurant/table context.
   */
  static async getCustomerMenuItems(filters: CustomerMenuItemFilters): Promise<{
    items: RestaurantMenuItem[];
    pagination: MenuItemPagination;
  }> {
    const response = await apiRequest<LaravelMenuItemListResponse>(
      "/api/v1/customer/menu-item/items",
      {
        method: "GET",

        query: {
          qr_token: filters.qr_token,

          search: filters.search,
          category: filters.category,
          foodtype: filters.foodtype,
          order: filters.order,
          per_page: filters.per_page,
        },
      },
    );

    return {
      items: response.data.map((item) => normalizeMenuItem(item)),

      pagination: normalizePagination(response.pagination),
    };
  }

  /**
   * GET /api/v1/customer/menu-item/items/{menuItem}
   */
  static async getCustomerMenuItem(
    menuItemId: string,
    qrToken: string,
  ): Promise<RestaurantMenuItem> {
    const response = await apiRequest<LaravelSingleMenuItemResponse>(
      `/api/v1/customer/menu-item/items/${menuItemId}`,
      {
        method: "GET",

        query: {
          qr_token: qrToken,
        },
      },
    );

    return normalizeMenuItem(response.data);
  }
}
