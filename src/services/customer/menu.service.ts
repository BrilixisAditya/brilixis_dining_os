import { apiRequest } from "../api/client";
import {
  MenuItem,
  CustomerMenuItemDetails,
  CustomerMenuModifierGroup,
} from "../../types/menuData";

type RawMenuItem = Record<string, unknown>;

interface MenuResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface GetMenuItemsParams {
  qrToken: string;
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
export interface GetMenuItemsParams {
  qrToken: string;
}

export async function getCustomerMenuItems({
  qrToken,
}: GetMenuItemsParams): Promise<MenuItem[]> {
  const response = await apiRequest<MenuResponse | RawMenuItem[]>(
    MENU_ITEMS_ENDPOINT,
    {
      method: "GET",
      query: {
        qr_token: qrToken,
      },
    },
  );

  const rawItems = extractItems(response);

  return rawItems
    .map(normalizeMenuItem)
    .filter((item): item is MenuItem => item !== null);
}

interface MenuItemDetailsResponse {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

interface GetCustomerMenuItemDetailsParams {
  qrToken: string;
  menuItemId: string;
}

export async function getCustomerMenuItemDetails({
  qrToken,
  menuItemId,
}: GetCustomerMenuItemDetailsParams): Promise<CustomerMenuItemDetails> {
  const response = await apiRequest<MenuItemDetailsResponse>(
    `/api/v1/customer/menu-item/items/${encodeURIComponent(menuItemId)}`,
    {
      method: "GET",
      query: {
        qr_token: qrToken,
      },
    },
  );

  if (!response.success || !isRecord(response.data)) {
    throw new Error(response.message || "Unable to fetch menu item details.");
  }

  const rawItem = response.data;

  const itemId = idValue(rawItem.id);

  const basePrice = numberValue(rawItem.base_price);

  if (basePrice === undefined || basePrice < 0) {
    throw new Error("Invalid menu item price returned by the server.");
  }

  if (!itemId) {
    throw new Error("Invalid menu item returned by the server.");
  }

  const assignments = rawItem.modifier_group_assignments;

  const modifierGroups: CustomerMenuModifierGroup[] = [];

  if (Array.isArray(assignments)) {
    for (const assignment of assignments) {
      if (!isRecord(assignment)) continue;

      const group = assignment.modifier_group;

      if (!isRecord(group)) continue;

      const groupId = idValue(group.id);
      const groupName = stringValue(group.name);

      const rawType = group.modifier_type;

      const type: CustomerMenuModifierGroup["type"] =
        rawType === 1 || rawType === "1" || rawType === "INCLUDE"
          ? "include"
          : rawType === 2 || rawType === "2" || rawType === "EXCLUDE"
            ? "exclude"
            : (() => {
                throw new Error(
                  `Invalid modifier type for group: ${groupName ?? groupId}`,
                );
              })();

      const minSelection = numberValue(assignment.min_selection);
      const maxSelection = numberValue(assignment.max_selection);

      if (
        !groupId ||
        !groupName ||
        minSelection === undefined ||
        maxSelection === undefined ||
        minSelection < 0 ||
        maxSelection < minSelection
      ) {
        throw new Error(
          `Invalid selection configuration for modifier group: ${groupName ?? groupId}`,
        );
      }

      const rawModifiers = group.modifiers;

      const modifiers = Array.isArray(rawModifiers)
        ? rawModifiers.flatMap((rawModifier) => {
            if (!isRecord(rawModifier)) return [];

            const id = idValue(rawModifier.id);
            const name = stringValue(rawModifier.name);
            const price = numberValue(rawModifier.modifier_price);

            if (!id || !name || price === undefined || price < 0) {
              return [];
            }

            return [
              {
                id,
                name,
                price,
              },
            ];
          })
        : [];

      modifierGroups.push({
        id: groupId,
        name: groupName,
        type,
        minSelection,
        maxSelection,
        modifiers,
      });
    }
  }

  return {
    id: itemId,
    basePrice,
    modifierGroups,
  };
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
