import { MenuItem } from "./menuData";

export interface CartItem {
  id: string; // unique ID to support multiple versions of the same item with different ingredient exclusions
  menuItem: MenuItem;
  quantity: number;
  excludedIngredients: string[];
  addedIngredients: string[];
  customInstructions: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  excludedIngredients: string[];
  addedIngredients: string[];
  customInstructions: string;
}

export interface TableOrder {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status:
    | "draft_submitted"
    | "on_review"
    | "sent_to_kitchen"
    | "preparing"
    | "ready"
    | "served"
    | "bill_requested"
    | "paid";
  waiterName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerGstin?: string;
  companyName?: string;
  invoiceNumber?: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  paymentDetails?: {
    method: string;
    transactionId: string;
    paidAt: string;
  };
  gstSummary?: {
    totalTaxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    roundOff: number;
    isInterstate: boolean;
  };
}

export interface WaiterRequest {
  id: string;
  type:
    | "general"
    | "water"
    | "cutlery"
    | "menu"
    | "bill"
    | "tissue"
    | "cleaning";
  label: string;
  tableNumber: string;
  status: "requested" | "assigned" | "on_the_way" | "resolved";
  waiterName?: string;
  etaString?: string;
}

export interface RestaurantGstProfile {
  restaurantName: string;
  legalBusinessName: string;
  gstin: string;
  fssaiNumber?: string;
  pan?: string;
  address: string;
  state: string;
  stateCode: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  invoicePrefix: string;
  financialYear: string;
  taxConfig: "CGST_SGST" | "IGST" | "BOTH";
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  rating: number;
  status: "active" | "break" | "off_duty";
  efficiency: number;
  code: string;
  phone?: string;
}

export type RestaurantTableSection =
  | "Main Dining"
  | "Outdoor Terrace"
  | "VIP Banquet"
  | "Window Corner"
  | "Bar Lounge"
  | "Private Dining";

export type RestaurantTableStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "disabled";

export interface RestaurantTable {
  id: string;
  /**
   * Frontend-only derived table number.
   *
   * This does NOT come from the database.
   * It is derived from backend table_code.
   *
   * Example:
   * DEMO-T005 -> 5
   */
  number: number;
  name: string;
  capacity: number;
  section: RestaurantTableSection;
  status: RestaurantTableStatus; //"available" | "occupied" | "reserved" | "disabled";
}

export interface CreateRestaurantTablePayload {
  table_name: string;
  section: RestaurantTableSection;
  capacity: number;
}

export interface UpdateRestaurantTablePayload {
  table_name?: string;
  section?: RestaurantTableSection;
  capacity?: number;
  status?: RestaurantTableStatus;
}

// Menu Category Types
export type MenuCategoryStatus = "active" | "inactive" | "unavailable";

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  sortOrder: number;
  status: MenuCategoryStatus;
}

export interface CreateMenuCategoryPayload {
  category_name: string;
  desc?: string | null;
  img_uri?: string | null;
  sort_order?: number;
  status?: 1 | 2 | 3;
}

export interface UpdateMenuCategoryPayload {
  category_name?: string;
  desc?: string | null;
  img_uri?: string | null;
  sort_order?: number;
  status?: 1 | 2 | 3;
}

// Menu Item Types
export type RestaurantMenuItemStatus = "active" | "inactive" | "unavailable";

export interface RestaurantMenuItem {
  id: string;

  restaurantId: string;

  categoryId: string;
  categoryName: string;

  foodTypeId: string;
  foodTypeName: string;

  name: string;
  description: string | null;

  basePrice: number;

  imagePath: string | null;

  sortOrder: number;

  status: RestaurantMenuItemStatus;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemPayload {
  item_name: string;
  category_id: number;
  food_type_id: number;
  base_price: number;

  description?: string;
  image_path?: string;

  sort_order?: number;
  status?: 1 | 2 | 3;
}

export interface UpdateMenuItemPayload {
  item_name?: string;
  category_id?: number;
  food_type_id?: number;
  base_price?: number;

  description?: string;
  image_path?: string;

  sort_order?: number;
  status?: 1 | 2 | 3;
}

export interface MenuItemListFilters {
  search?: string;
  category?: string;
  foodtype?: string;
  order?: "asc" | "desc";
  status?: 1 | 2 | 3;
  per_page?: number;
}

export interface CustomerMenuItemFilters {
  qr_token: string;

  search?: string;
  category?: string;
  foodtype?: string;
  order?: "asc" | "desc";
  per_page?: number;
}

export interface MenuItemPagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

// FoodType types
export interface FoodType {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

// Modifier Group types
export type ModifierGroupType = "include" | "exclude";

export interface ModifierGroup {
  id: string;
  restaurantId: string;
  name: string;
  modifierType: ModifierGroupType;
  isActive: boolean;
}

export interface CreateModifierGroupPayload {
  name: string;
  modifier_type: 1 | 2;
}

export interface UpdateModifierGroupPayload {
  name?: string;
  modifier_type?: 1 | 2;
}

// Modifier types
export type ModifierStatus = "active" | "inactive" | "unavailable";

export interface Modifier {
  id: string;
  modifierGroupId: string;
  modifierGroupName: string;
  name: string;
  modifierPrice: number;
  status: ModifierStatus;
}

export interface CreateModifierPayload {
  name: string;
  modifier_group_id: string;
  modifier_price: number;
  status?: 1 | 2 | 3;
}

export interface UpdateModifierPayload {
  name?: string;
  modifier_group_id?: string;
  modifier_price?: number;
  status?: 1 | 2 | 3;
}

export interface ModifierPagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

// MenuItemModifierGroup Assignment types
export interface MenuItemModifierGroupAssignment {
  id: string;
  menuItemId: string;
  modifierGroupId: string;
  modifierGroupName: string;
  modifierGroupType: ModifierGroupType;
  minSelection: number;
  maxSelection: number;
}

export interface AttachModifierGroupPayload {
  modifier_group_id: string;
  min_selection: number;
  max_selection: number;
}

export interface UpdateMenuItemModifierGroupPayload {
  modifier_group_id?: string;
  min_selection?: number;
  max_selection?: number;
}
