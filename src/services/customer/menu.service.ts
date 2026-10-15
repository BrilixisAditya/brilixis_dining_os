import { apiRequest } from "../api/client";
import { MenuItem } from "../../types/menuData";

type RawMenuItem = Record<string, unknown>;

interface MenuResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface GetMenuItemsParams {
  restaurantId: string;
  tableId: string;
}

/**
 * Customer menu endpoint.
 *
 * The frontend first resolves restaurantId + tableId from the QR code.
 * Those values are then sent to this endpoint.
 *
 * You can override the endpoint from .env:
 *
 * VITE_MENU_ITEMS_ENDPOINT=/api/v1/...
 */
export const MENU_ITEMS_ENDPOINT =
  import.meta.env.VITE_MENU_ITEMS_ENDPOINT || "/api/v1/menu-items";

/**
 * Fetch menu items for the current customer's restaurant/table.
 *
 * Current backend item example:
 *
 * {
 *   id: 1,
 *   restaurant_id: 1,
 *   category_id: 1,
 *   food_type_id: 1,
 *   item_name: "Margherita Pizza",
 *   base_price: "299.00",
 *   description: "Classic cheese and tomato pizza",
 *   image_path: null,
 *   status: 1
 * }
 */
export async function getCustomerMenuItems({
  restaurantId,
  tableId,
}: GetMenuItemsParams): Promise<MenuItem[]> {
  const response = await apiRequest<MenuResponse | RawMenuItem[]>(
    MENU_ITEMS_ENDPOINT,
    {
      method: "GET",
      query: {
        restaurant_id: restaurantId,
        table_id: tableId,
      },
    },
  );

  console.log("Customer menu API response:", response);

  const rawItems = extractItems(response);

  console.log("Raw menu items:", rawItems);

  const menuItems = rawItems
    .map(normalizeMenuItem)
    .filter((item): item is MenuItem => item !== null);

  console.log("Normalized menu items:", menuItems);

  return menuItems;
}

/**
 * Extract menu items from the response.
 *
 * Currently your backend sends a plain array:
 *
 * [
 *   {...},
 *   {...}
 * ]
 *
 * We also support common Laravel response wrappers:
 *
 * {
 *   data: [...]
 * }
 *
 * {
 *   data: {
 *     data: [...]
 *   }
 * }
 */
function extractItems(response: MenuResponse | RawMenuItem[]): RawMenuItem[] {
  // Backend returned:
  // [...]
  if (Array.isArray(response)) {
    return response.filter(isRecord);
  }

  // Backend returned:
  // { data: [...] }
  if (Array.isArray(response.data)) {
    return response.data.filter(isRecord);
  }

  // Laravel Resource / pagination style:
  // { data: { data: [...] } }
  if (isRecord(response.data) && Array.isArray(response.data.data)) {
    return response.data.data.filter(isRecord);
  }

  return [];
}

/**
 * Convert one Laravel menu item into the frontend MenuItem model.
 */
function normalizeMenuItem(raw: RawMenuItem): MenuItem | null {
  /*
   * Laravel:
   * id: 1
   *
   * Frontend:
   * id: "1"
   */
  const id = idValue(raw.id);

  /*
   * Laravel uses item_name.
   * Keep raw.name as a fallback so the frontend remains
   * compatible with another API representation later.
   */
  const name = stringValue(raw.item_name, raw.name);

  if (!id || !name) {
    console.warn("Skipping invalid menu item:", raw);

    return null;
  }

  return {
    id,

    name,

    /*
     * At the moment the backend gives category_id only.
     *
     * Example:
     * category_id = 1
     *
     * Until Laravel sends the category name, we use a
     * stable category key. The UI can still group/filter
     * by the same key.
     */
    category: stringValue(raw.category_name) as MenuItem["category"],

    /*
     * Laravel sends:
     *
     * base_price: "299.00"
     *
     * Convert it into a JavaScript number.
     */
    price: numberValue(raw.base_price, raw.price, raw.selling_price) ?? 0,

    /*
     * Current payload only contains food_type_id.
     *
     * We must NOT assume:
     *
     * food_type_id === 1 -> Veg
     *
     * because that is a backend database mapping.
     *
     * When Laravel sends is_veg or food_type.name,
     * this code will automatically use it.
     *
     * Until then, false is used because the existing
     * MenuItem interface requires a boolean.
     */
    isVeg: stringValue(raw.food_type_name)?.toLowerCase() === "vegetarian",

    isSignature: booleanValue(raw.is_signature, raw.isSignature) ?? false,

    description: stringValue(raw.description) ?? "",

    ingredients: stringArray(raw.ingredients),

    /*
     * Laravel:
     * image_path
     */
    imageUrl: stringValue(raw.image_path, raw.image_url, raw.imageUrl) ?? "",

    tags: stringArray(raw.tags),

    /*
     * Current Laravel response includes:
     * status: 1
     *
     * Assuming status=1 means active/available.
     */
    isOutOfStock:
      numberValue(raw.status) !== undefined
        ? numberValue(raw.status) !== 1
        : stringValue(raw.status) !== undefined
          ? stringValue(raw.status) !== "1"
          : false,

    gstRate: numberValue(raw.gst_rate, raw.gstRate),

    hsnCode: stringValue(raw.hsn_code, raw.hsnCode),

    isTaxInclusive: booleanValue(raw.is_tax_inclusive, raw.isTaxInclusive),
  };
}

/**
 * Safely determine whether a value is an object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Convert an ID into a string.
 *
 * Laravel commonly returns database IDs as integers:
 *
 * 1 -> "1"
 */
function idValue(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

/**
 * Return the first non-empty string.
 */
function stringValue(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

/**
 * Convert numeric values and numeric strings into numbers.
 *
 * Example:
 *
 * "299.00" -> 299
 */
function numberValue(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

/**
 * Convert common Laravel boolean representations.
 *
 * Supports:
 * true / false
 * 1 / 0
 * "1" / "0"
 */
function booleanValue(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === 1 || value === "1") {
      return true;
    }

    if (value === 0 || value === "0") {
      return false;
    }
  }

  return undefined;
}

/**
 * Try to read Veg information when Laravel eventually
 * returns a food_type relationship.
 *
 * Supported examples:
 *
 * food_type: {
 *   name: "Veg"
 * }
 *
 * food_type: {
 *   type: "veg"
 * }
 */
function foodTypeIsVeg(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const type = stringValue(value.name, value.type, value.code);

  return type?.trim().toLowerCase() === "veg";
}

/**
 * Convert an unknown array into string[].
 */
function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
