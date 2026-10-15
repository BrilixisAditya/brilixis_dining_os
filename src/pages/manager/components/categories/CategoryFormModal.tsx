import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";

import {
  CreateMenuCategoryPayload,
  MenuCategory,
  UpdateMenuCategoryPayload,
} from "@/src/types/types";

interface CategoryFormModalProps {
  isOpen: boolean;
  category: MenuCategory | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    payload: CreateMenuCategoryPayload | UpdateMenuCategoryPayload,
  ) => Promise<void>;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  isSaving,
  error,
  onClose,
  onSubmit,
}) => {
  const isEditMode = category !== null;

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (category) {
      setCategoryName(category.name);
      setDescription(category.description ?? "");
      setImagePath(category.imagePath ?? "");
      setSortOrder(String(category.sortOrder));
      setStatus(
        category.status === "active"
          ? 1
          : category.status === "inactive"
            ? 2
            : 3,
      );

      return;
    }

    setCategoryName("");
    setDescription("");
    setImagePath("");
    setSortOrder("0");
    setStatus(1);
  }, [isOpen, category]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = categoryName.trim();
    const trimmedDescription = description.trim();
    const trimmedImagePath = imagePath.trim();
    const parsedSortOrder = Number(sortOrder);

    if (!trimmedName) {
      return;
    }

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      return;
    }

    if (isEditMode) {
      const payload: UpdateMenuCategoryPayload = {
        category_name: trimmedName,
        desc: trimmedDescription || null,
        img_uri: trimmedImagePath || null,
        sort_order: parsedSortOrder,
        status,
      };

      await onSubmit(payload);
      return;
    }

    const payload: CreateMenuCategoryPayload = {
      category_name: trimmedName,
      desc: trimmedDescription || null,
      img_uri: trimmedImagePath || null,
      sort_order: parsedSortOrder,
      status,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E8E5DD] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E8E5DD]">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#E76F51] font-bold">
              Menu Structure
            </span>

            <h3 className="text-lg font-display font-black text-[#1F2226] mt-1">
              {isEditMode ? "Edit Category" : "Add Category"}
            </h3>

            <p className="text-[10px] text-[#8C7A6B] mt-1">
              {isEditMode
                ? "Update the category details below."
                : "Create a new menu category for your restaurant."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-lg text-[#8C7A6B] hover:bg-[#FAF9F6] hover:text-[#1F2226] disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* for error */}
            {error && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-rose-500"
                  />

                  <p className="text-xs text-rose-700">{error}</p>
                </div>
              </div>
            )}
            {/* for error */}

            {/* Category name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-bold mb-2">
                Category Name
              </label>

              <input
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="e.g. Starters"
                required
                disabled={isSaving}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 text-[#1F2226] focus:outline-none focus:border-[#E76F51]/50 disabled:opacity-60"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-bold mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Brief description of this category"
                rows={3}
                disabled={isSaving}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 text-[#1F2226] resize-none focus:outline-none focus:border-[#E76F51]/50 disabled:opacity-60"
              />
            </div>

            {/* Image path */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-bold mb-2">
                Image URL
              </label>

              <input
                type="text"
                value={imagePath}
                onChange={(event) => setImagePath(event.target.value)}
                placeholder="https://example.com/category.jpg"
                disabled={isSaving}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 text-[#1F2226] focus:outline-none focus:border-[#E76F51]/50 disabled:opacity-60"
              />
            </div>

            {/* Sort order + status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-bold mb-2">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  disabled={isSaving}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 text-[#1F2226] focus:outline-none focus:border-[#E76F51]/50 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-bold mb-2">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(Number(event.target.value) as 1 | 2 | 3)
                  }
                  disabled={isSaving}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 text-[#1F2226] focus:outline-none focus:border-[#E76F51]/50 disabled:opacity-60"
                >
                  <option value={1}>Active</option>
                  <option value={2}>Inactive</option>
                  <option value={3}>Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E8E5DD] bg-[#FAF9F6] rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-[#E8E5DD] bg-white text-xs font-display font-bold text-[#5C6168] hover:bg-[#FAF9F6] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !categoryName.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E76F51] text-white text-xs font-display font-bold hover:bg-[#D95D42] disabled:opacity-50"
            >
              <Save size={13} />

              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
