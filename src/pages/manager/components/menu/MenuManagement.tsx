import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit3, Trash2, RefreshCw, Loader2 } from "lucide-react";

import { RestaurantMenuItem } from "@/src/types/types";

import useMenuItems from "@/src/hooks/useMenuItems";
import useCategories from "@/src/hooks/useCategories";

import { getApiErrorMessage } from "@/src/services/api/client";

interface MenuManagementProps {
  onAdd: () => void;
  onEdit: (item: RestaurantMenuItem) => void;
  refreshToken?: number;
}

const MenuManagement: React.FC<MenuManagementProps> = ({
  onAdd,
  onEdit,
  refreshToken = 0,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Menu API state
  |--------------------------------------------------------------------------
  */

  const { menuItems, isLoading, error, refreshMenuItems, removeMenuItem } =
    useMenuItems();

  /*
  |--------------------------------------------------------------------------
  | Category API state
  |--------------------------------------------------------------------------
  */

  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCategories();

  /*
  |--------------------------------------------------------------------------
  | UI filters
  |--------------------------------------------------------------------------
  */

  const [menuSearch, setMenuSearch] = useState("");

  const [menuCatFilter, setMenuCatFilter] = useState<string>("all");

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch menu items whenever search/category changes
  |--------------------------------------------------------------------------
  |
  | We deliberately use the backend filters instead of filtering a
  | hard-coded/mock array.
  |
  */

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshMenuItems({
        search: menuSearch.trim() || undefined,
        category: menuCatFilter !== "all" ? menuCatFilter : undefined,
        order: "asc",
        per_page: 20,
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [menuSearch, menuCatFilter, refreshMenuItems, refreshToken]);

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (item: RestaurantMenuItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}" from the menu?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingId(item.id);

      await removeMenuItem(item.id);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to delete menu item.");

      console.error("Failed to delete menu item:", message);
    } finally {
      setIsDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Category options
  |--------------------------------------------------------------------------
  |
  | Only active categories should normally be used as menu filters.
  |
  */

  const categoryOptions = useMemo(() => {
    return categories
      .filter((category) => category.status === "active")
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }

        return a.name.localeCompare(b.name);
      });
  }, [categories]);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E8E5DD] p-5 rounded-[2rem]">
        {/* Dynamic category filters */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setMenuCatFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-extrabold cursor-pointer transition-colors ${
              menuCatFilter === "all"
                ? "bg-zinc-900 border border-zinc-900 text-white"
                : "bg-[#FAF9F6] border border-[#E8E5DD] text-[#8C7A6B] hover:text-[#1F2226]"
            }`}
          >
            All
          </button>

          {categoryOptions.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setMenuCatFilter(category.name)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-extrabold cursor-pointer transition-colors ${
                menuCatFilter === category.name
                  ? "bg-zinc-900 border border-zinc-900 text-white"
                  : "bg-[#FAF9F6] border border-[#E8E5DD] text-[#8C7A6B] hover:text-[#1F2226]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={13}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]"
            />

            <input
              type="text"
              placeholder="Filter by name..."
              value={menuSearch}
              onChange={(event) => setMenuSearch(event.target.value)}
              className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl pl-9 pr-4 py-2 placeholder-neutral-400 focus:outline-none focus:border-[#C83214]/50 text-[#1F2226] transition-colors shadow-xs"
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() =>
              void refreshMenuItems({
                search: menuSearch.trim() || undefined,
                category: menuCatFilter !== "all" ? menuCatFilter : undefined,
                order: "asc",
                per_page: 20,
              })
            }
            disabled={isLoading}
            title="Refresh menu"
            className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E5DD] text-[#6B7280] hover:text-[#1F2226] hover:bg-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* Add */}
          <button
            type="button"
            onClick={onAdd}
            className="bg-[#E76F51] hover:bg-[#d95d3f] text-white px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer shadow-brilixis-sm transition-all whitespace-nowrap"
          >
            <Plus size={14} />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Category loading/error */}
      {isCategoriesLoading && (
        <div className="text-[10px] font-mono text-[#8C7A6B]">
          Loading categories...
        </div>
      )}

      {categoriesError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
          {categoriesError}
        </div>
      )}

      {/* Menu error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => void refreshMenuItems()}
            className="font-bold underline cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-12 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C7A6B]">
            <Loader2 size={15} className="animate-spin" />
            Loading menu items...
          </div>
        </div>
      ) : menuItems.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-12 text-center">
          <p className="text-sm font-display font-bold text-[#1F2226]">
            No menu items found
          </p>

          <p className="text-xs text-[#8C7A6B] mt-1">
            Try changing the search or category filter.
          </p>
        </div>
      ) : (
        /* Registry */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border border-[#E8E5DD] rounded-[2rem] p-5 transition-all hover:border-[#1F2226]/20 shadow-xs ${
                item.status !== "active" ? "opacity-75" : ""
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                {/* Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-none bg-neutral-100 border border-[#E8E5DD]">
                  {item.imagePath ? (
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8C7A6B]">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-mono text-[#8C7A6B] uppercase font-black">
                    {item.categoryName || "Uncategorized"}
                  </span>

                  <h4 className="text-xs font-display font-black text-[#1F2226] truncate leading-tight mt-0.5">
                    {item.name}
                  </h4>

                  <p className="text-[10px] text-[#8C7A6B] font-mono leading-none mt-1 truncate">
                    {item.foodTypeName || "Unknown Food Type"}
                  </p>

                  <p className="text-[9px] text-[#8C7A6B] font-mono leading-none mt-1">
                    Ref ID: {item.id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    title="Edit Menu Item"
                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-[#E76F51] hover:text-white text-neutral-600 transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    disabled={isDeletingId === item.id}
                    title="Delete Menu Item"
                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-600 hover:text-white text-neutral-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingId === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[10.5px] text-[#5C6168] mt-4 line-clamp-3 leading-relaxed">
                {item.description || "No description provided."}
              </p>

              {/* Basic information */}
              <div className="mt-4 pt-4 border-t border-[#F3F0EA] flex items-center justify-between">
                <div>
                  <span className="block text-[8px] font-mono uppercase text-[#8C7A6B]">
                    Base Price
                  </span>

                  <span className="text-sm font-display font-black text-[#1F2226]">
                    ₹{item.basePrice.toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="block text-[8px] font-mono uppercase text-[#8C7A6B]">
                    Status
                  </span>

                  <span
                    className={`text-[9px] font-mono uppercase font-bold ${
                      item.status === "active"
                        ? "text-emerald-600"
                        : item.status === "inactive"
                          ? "text-zinc-500"
                          : "text-rose-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
