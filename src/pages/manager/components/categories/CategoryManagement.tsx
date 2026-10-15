import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Layers,
  CheckCircle2,
  CircleOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import useCategories from "@/src/hooks/useCategories";
import {
  CreateMenuCategoryPayload,
  MenuCategory,
  UpdateMenuCategoryPayload,
} from "@/src/types/types";
import CategoryList from "./CategoryList";
import CategoryFormModal from "./CategoryFormModal";

const CategoryManagement: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    refreshCategories,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      );
    });
  }, [categories, searchQuery]);

  const categoryStats = useMemo(() => {
    return {
      total: categories.length,
      active: categories.filter((category) => category.status === "active")
        .length,
      inactive: categories.filter((category) => category.status === "inactive")
        .length,
      unavailable: categories.filter(
        (category) => category.status === "unavailable",
      ).length,
    };
  }, [categories]);

  const handleEdit = (category: MenuCategory) => {
    setFormError(null);
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAddCategory = () => {
    setFormError(null);
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (category: MenuCategory) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeCategory(category.id);
    } catch {
      // useCategories already handles API error state.
    }
  };

  const handleSubmitCategory = async (
    payload: CreateMenuCategoryPayload | UpdateMenuCategoryPayload,
  ) => {
    try {
      setIsSaving(true);
      setFormError(null);

      if (editingCategory) {
        await editCategory(
          editingCategory.id,
          payload as UpdateMenuCategoryPayload,
        );
      } else {
        await addCategory(payload as CreateMenuCategoryPayload);
      }

      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#E76F51] font-bold">
            Menu Structure
          </span>

          <h2 className="text-xl font-display font-black text-[#1F2226]">
            Menu Categories
          </h2>

          <p className="text-xs text-[#8C7A6B] mt-1">
            Organize and manage the categories used by your restaurant menu.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          className="bg-[#E76F51] hover:bg-[#d95d3f] text-white px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer shadow-brilixis-sm transition-all whitespace-nowrap"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold">
              Total Categories
            </span>
            <Layers size={15} className="text-[#8C7A6B]" />
          </div>

          <div className="text-2xl font-display font-black text-[#1F2226] mt-2">
            {categoryStats.total}
          </div>
        </div>

        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold">
              Active
            </span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>

          <div className="text-2xl font-display font-black text-[#1F2226] mt-2">
            {categoryStats.active}
          </div>
        </div>

        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold">
              Inactive
            </span>
            <CircleOff size={15} className="text-zinc-500" />
          </div>

          <div className="text-2xl font-display font-black text-[#1F2226] mt-2">
            {categoryStats.inactive}
          </div>
        </div>

        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold">
              Unavailable
            </span>
            <AlertCircle size={15} className="text-amber-600" />
          </div>

          <div className="text-2xl font-display font-black text-[#1F2226] mt-2">
            {categoryStats.unavailable}
          </div>
        </div>
      </div>

      {/* Search / refresh */}
      <div className="bg-white border border-[#E8E5DD] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories..."
              className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl pl-10 pr-4 py-2.5 text-[#1F2226] focus:outline-none focus:border-[#E76F51]/50"
            />
          </div>

          <button
            type="button"
            onClick={() => void refreshCategories()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E5DD] text-xs font-display font-bold text-[#5C6168] hover:bg-[#FAF9F6] disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-12 text-center">
          <RefreshCw
            size={20}
            className="mx-auto animate-spin text-[#E76F51]"
          />

          <p className="text-xs text-[#8C7A6B] mt-3">Loading categories...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
          <AlertCircle size={22} className="mx-auto text-rose-500" />

          <p className="text-sm font-display font-bold text-[#1F2226] mt-3">
            Unable to load categories
          </p>

          <p className="text-xs text-[#8C7A6B] mt-1">{error}</p>

          <button
            type="button"
            onClick={() => void refreshCategories()}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1F2226] text-white text-xs font-display font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Category Registry */}
      {!isLoading && !error && (
        <div className="bg-white border border-[#E8E5DD] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E8E5DD]">
            <h3 className="text-sm font-display font-bold text-[#1F2226]">
              Category Registry
            </h3>

            <p className="text-[10px] text-[#8C7A6B] mt-1">
              {filteredCategories.length} categories shown
            </p>
          </div>

          <CategoryList
            categories={filteredCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <CategoryFormModal
        isOpen={isFormOpen}
        category={editingCategory}
        isSaving={isSaving}
        error={formError}
        onClose={() => {
          if (isSaving) {
            return;
          }

          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmitCategory}
      />
    </div>
  );
};

export default CategoryManagement;
