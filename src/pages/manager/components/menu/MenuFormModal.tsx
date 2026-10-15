import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

import type { RestaurantMenuItem } from "@/src/types/types";

import useCategories from "@/src/hooks/useCategories";
import useFoodTypes from "@/src/hooks/useFoodTypes";

import MenuItemOptionsSection from "./MenuItemOptionsSection";

export interface MenuFormState {
  itemName: string;
  categoryId: string;
  foodTypeId: string;
  basePrice: string;
  description: string;
  imagePath: string;
  sortOrder: string;
  status: 1 | 2 | 3;
}

interface MenuFormModalProps {
  isOpen: boolean;
  editingMenuItem: RestaurantMenuItem | null;

  menuForm: MenuFormState;
  setMenuForm: React.Dispatch<React.SetStateAction<MenuFormState>>;

  isMenuSaving: boolean;
  menuFormError: string;

  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  editingMenuItem,
  menuForm,
  setMenuForm,
  isMenuSaving,
  menuFormError,
  onClose,
  onSubmit,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Category / Food Type API data
  |--------------------------------------------------------------------------
  |
  | These are needed only by the menu-item form, so they now belong
  | to the form component instead of ManagerDashboard.
  |
  */

  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const { foodTypes, isLoading: isFoodTypesLoading } = useFoodTypes();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#ECE7E1] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#ECE7E1]">
          <div>
            <h3 className="text-base font-display font-bold text-[#2D2D2D]">
              {editingMenuItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>

            <p className="text-[9px] text-[#8C7A6B] font-mono mt-0.5">
              Restaurant Menu Registry
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isMenuSaving}
            className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form error */}
        {menuFormError && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertTriangle size={14} className="flex-none mt-0.5" />

            <span>{menuFormError}</span>
          </div>
        )}

        <form id="menu-item-form" onSubmit={onSubmit} className="space-y-3">
          {/* Item name */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Dish / Item Name *
            </label>

            <input
              type="text"
              required
              minLength={3}
              maxLength={255}
              placeholder="e.g. Truffle Mushroom Risotto"
              value={menuForm.itemName}
              onChange={(event) =>
                setMenuForm((current) => ({
                  ...current,
                  itemName: event.target.value,
                }))
              }
              className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
            />
          </div>

          {/* Category + Food Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                Category *
              </label>

              <select
                required
                value={menuForm.categoryId}
                disabled={isCategoriesLoading}
                onChange={(event) =>
                  setMenuForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
                className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
              >
                <option value="">
                  {isCategoriesLoading ? "Loading..." : "Select category"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.status !== "active"
                      ? ` (${category.status})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                Food Type *
              </label>

              <select
                required
                value={menuForm.foodTypeId}
                disabled={isFoodTypesLoading}
                onChange={(event) =>
                  setMenuForm((current) => ({
                    ...current,
                    foodTypeId: event.target.value,
                  }))
                }
                className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] disabled:opacity-60"
              >
                <option value="">
                  {isFoodTypesLoading ? "Loading..." : "Select food type"}
                </option>

                {foodTypes.map((foodType) => (
                  <option key={foodType.id} value={foodType.id}>
                    {foodType.name}
                    {foodType.code ? ` (${foodType.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Sort Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                Base Price (₹) *
              </label>

              <input
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="299.00"
                value={menuForm.basePrice}
                onChange={(event) =>
                  setMenuForm((current) => ({
                    ...current,
                    basePrice: event.target.value,
                  }))
                }
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                Sort Order
              </label>

              <input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={menuForm.sortOrder}
                onChange={(event) =>
                  setMenuForm((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Description
            </label>

            <textarea
              rows={3}
              maxLength={255}
              placeholder="Describe the dish, ingredients, taste profile or preparation..."
              value={menuForm.description}
              onChange={(event) =>
                setMenuForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] resize-none"
            />

            <p className="text-[8px] text-[#8C7A6B] font-mono mt-1">
              Optional. When provided, minimum 10 characters.
            </p>
          </div>

          {/* Image path */}
          <div>
            <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
              Image Path / URL
            </label>

            <input
              type="text"
              maxLength={255}
              placeholder="https://... or /storage/menu/..."
              value={menuForm.imagePath}
              onChange={(event) =>
                setMenuForm((current) => ({
                  ...current,
                  imagePath: event.target.value,
                }))
              }
              className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
            />
          </div>
        </form>

        {/* Options & Addons */}
        <MenuItemOptionsSection
          menuItem={editingMenuItem}
          itemName={menuForm.itemName}
        />

        {/* Status */}
        <div>
          <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
            Status
          </label>

          <select
            form="menu-item-form"
            value={menuForm.status}
            onChange={(event) =>
              setMenuForm((current) => ({
                ...current,
                status: Number(event.target.value) as 1 | 2 | 3,
              }))
            }
            className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
          >
            <option value={1}>Active</option>
            <option value={2}>Inactive</option>
            <option value={3}>Unavailable</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#ECE7E1]">
          <button
            type="button"
            onClick={onClose}
            disabled={isMenuSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="menu-item-form"
            disabled={isMenuSaving || isCategoriesLoading || isFoodTypesLoading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E76F51] hover:bg-[#d95d3f] cursor-pointer shadow-brilixis-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isMenuSaving && <RefreshCw size={13} className="animate-spin" />}

            {isMenuSaving
              ? editingMenuItem
                ? "Saving..."
                : "Creating..."
              : editingMenuItem
                ? "Save Changes"
                : "Create Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuFormModal;
