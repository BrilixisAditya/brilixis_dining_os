import React from "react";
import {
  Edit3,
  Trash2,
  CheckCircle2,
  CircleOff,
  AlertCircle,
} from "lucide-react";

import { MenuCategory } from "@/src/types/types";

interface CategoryListProps {
  categories: MenuCategory[];
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  const getStatusStyle = (status: MenuCategory["status"]) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={11} />,
        };

      case "inactive":
        return {
          label: "Inactive",
          className: "bg-neutral-100 text-neutral-600 border-neutral-200",
          icon: <CircleOff size={11} />,
        };

      case "unavailable":
        return {
          label: "Unavailable",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertCircle size={11} />,
        };
    }
  };

  if (categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-sm font-display font-bold text-[#1F2226]">
          No categories found
        </div>

        <p className="text-xs text-[#8C7A6B] mt-1">
          Try changing your search or create a new category.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#E8E5DD] bg-[#FAF9F6]">
            <th className="px-5 py-4 text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#8C7A6B]">
              Category
            </th>

            <th className="px-5 py-4 text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#8C7A6B]">
              Description
            </th>

            <th className="px-5 py-4 text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#8C7A6B]">
              Sort Order
            </th>

            <th className="px-5 py-4 text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#8C7A6B]">
              Status
            </th>

            <th className="px-5 py-4 text-right text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#8C7A6B]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#F3F0EA]">
          {categories.map((category) => {
            const status = getStatusStyle(category.status);

            return (
              <tr
                key={category.id}
                className="bg-white hover:bg-[#FFFCF7] transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="font-display font-bold text-sm text-[#1F2226]">
                    {category.name}
                  </div>

                  <div className="text-[9px] font-mono text-[#A29A91] mt-1">
                    ID #{category.id}
                  </div>
                </td>

                <td className="px-5 py-4 max-w-xs">
                  <p className="text-xs text-[#5C6168] truncate">
                    {category.description || "No description"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-[#FAF9F6] border border-[#E8E5DD] text-[10px] font-mono font-bold text-[#5C6168]">
                    {category.sortOrder}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono font-bold uppercase ${status.className}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="p-2 rounded-lg border border-[#E8E5DD] text-[#6B7280] hover:text-[#E76F51] hover:border-[#E76F51]/30 hover:bg-[#FAF9F6] transition-colors"
                      title="Edit category"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(category)}
                      className="p-2 rounded-lg border border-[#E8E5DD] text-[#6B7280] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
