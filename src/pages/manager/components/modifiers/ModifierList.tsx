import { createPortal } from "react-dom";
import { Edit3, MoreVertical, Plus, Trash2 } from "lucide-react";

import { Modifier } from "@/src/types/types";
import React from "react";

interface ModifierListProps {
  modifiers: Modifier[];
  isLoading: boolean;
  error: string | null;
  onAddModifier: () => void;
  onEditModifier: (modifier: Modifier) => void;
  onDeleteModifier: (modifier: Modifier) => void;
}

function getStatusLabel(status: Modifier["status"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "unavailable":
      return "Unavailable";
  }
}

export default function ModifierList({
  modifiers,
  isLoading,
  error,
  onAddModifier,
  onEditModifier,
  onDeleteModifier,
}: ModifierListProps) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] font-mono tracking-widest text-[#8C7A6B] font-bold uppercase">
            GROUP OPTIONS
          </span>

          <h4 className="text-sm font-display font-black text-[#1F2226] mt-0.5">
            Modifiers
          </h4>
        </div>

        <button
          type="button"
          onClick={onAddModifier}
          className="bg-[#E76F51] hover:bg-[#d95d3f] text-white px-3.5 py-2 rounded-xl text-[10px] font-display font-bold flex items-center gap-1.5 cursor-pointer shadow-brilixis-sm transition-all whitespace-nowrap"
        >
          <Plus size={13} />
          Add Modifier
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="border border-[#E8E5DD] rounded-2xl overflow-hidden">
          <div className="bg-[#FAF9F6] h-10 animate-pulse" />

          <div className="divide-y divide-[#E8E5DD]">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 bg-white animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3 py-2.5 text-[10px] leading-relaxed">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && modifiers.length === 0 && (
        <div className="border border-dashed border-[#DDD7CF] rounded-2xl bg-[#FAF9F6] py-12 px-6 text-center">
          <div className="text-xs font-display font-black text-[#1F2226]">
            No modifiers yet
          </div>

          <p className="text-[10px] text-[#8C7A6B] mt-1.5 leading-relaxed">
            Add the first option to this modifier group.
          </p>

          <button
            type="button"
            onClick={onAddModifier}
            className="mt-4 text-[10px] font-display font-bold text-[#C83214] hover:text-[#E76F51] cursor-pointer"
          >
            + Add Modifier
          </button>
        </div>
      )}

      {/* Modifier table */}
      {!isLoading && !error && modifiers.length > 0 && (
        <div className="border border-[#E8E5DD] rounded-2xl overflow-visible bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E8E5DD] text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B]">
                  <th className="text-left px-4 py-3 font-bold">Modifier</th>

                  <th className="text-left px-4 py-3 font-bold">Price</th>

                  <th className="text-left px-4 py-3 font-bold">Status</th>

                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E8E5DD]">
                {modifiers.map((modifier) => (
                  <ModifierRow
                    key={modifier.id}
                    modifier={modifier}
                    onEdit={() => onEditModifier(modifier)}
                    onDelete={() => onDeleteModifier(modifier)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Modifier Row
interface ModifierRowProps {
  modifier: Modifier;
  onEdit: () => void;
  onDelete: () => void;
}

function ModifierRow({ modifier, onEdit, onDelete }: ModifierRowProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({
    top: 0,
    left: 0,
  });

  const actionButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const status = getStatusLabel(modifier.status);

  const statusClass =
    modifier.status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : modifier.status === "inactive"
        ? "bg-neutral-100 text-neutral-500"
        : "bg-amber-50 text-amber-700";

  const openMenu = () => {
    const button = actionButtonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.right - 128,
    });

    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  React.useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleScroll = () => {
      closeMenu();
    };

    const handleResize = () => {
      closeMenu();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  return (
    <tr className="hover:bg-[#FFFDF8] transition-colors">
      <td className="px-4 py-3">
        <div>
          <div className="text-xs font-display font-bold text-[#1F2226]">
            {modifier.name}
          </div>

          <div className="text-[9px] font-mono text-[#A09286] mt-0.5">
            ID: {modifier.id}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-xs font-mono font-bold text-[#1F2226]">
          ₹{modifier.modifierPrice}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex text-[8px] font-mono uppercase font-bold px-1.5 py-1 rounded-md ${statusClass}`}
        >
          {status}
        </span>
      </td>

      <td className="px-2 py-3">
        <div className="flex justify-end">
          <button
            ref={actionButtonRef}
            type="button"
            onClick={() => {
              if (isMenuOpen) {
                closeMenu();
              } else {
                openMenu();
              }
            }}
            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
            aria-label={`Actions for ${modifier.name}`}
          >
            <MoreVertical size={13} />
          </button>
        </div>
      </td>

      {isMenuOpen &&
        createPortal(
          <div
            className="fixed z-999 w-32 bg-white border border-[#E8E5DD] rounded-xl shadow-lg p-1"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-display font-bold text-neutral-700 hover:bg-[#FAF9F6] cursor-pointer"
            >
              <Edit3 size={12} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-display font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </tr>
  );
}
