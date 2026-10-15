import React, { useMemo, useState } from "react";
import { Edit3, MoreVertical, Plus, Search, Trash2 } from "lucide-react";

import { ModifierGroup } from "@/src/types/types";

interface ModifierGroupListProps {
  modifierGroups: ModifierGroup[];
  selectedGroupId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectGroup: (group: ModifierGroup) => void;
  onAddGroup: () => void;
  onEditGroup: (group: ModifierGroup) => void;
  onDeleteGroup: (group: ModifierGroup) => void;
}

export default function ModifierGroupList({
  modifierGroups,
  selectedGroupId,
  isLoading,
  error,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
}: ModifierGroupListProps) {
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return modifierGroups;
    }

    return modifierGroups.filter((group) =>
      group.name.toLowerCase().includes(query),
    );
  }, [modifierGroups, search]);

  return (
    <div className="bg-white border border-[#E8E5DD] rounded-[2rem] overflow-visible h-full">
      {/* Header */}
      <div className="p-5 border-b border-[#ECE7E1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#C83214] font-bold block uppercase">
              MODIFIER GROUPS
            </span>

            <h3 className="text-base font-display font-black text-[#1F2226] mt-0.5">
              Option Groups
            </h3>

            <p className="text-[10px] text-[#8C7A6B] mt-1">
              Organize reusable menu options.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddGroup}
            className="bg-[#E76F51] hover:bg-[#d95d3f] text-white px-3.5 py-2 rounded-xl text-[11px] font-display font-bold flex items-center gap-1.5 cursor-pointer shadow-brilixis-sm transition-all whitespace-nowrap"
          >
            <Plus size={13} />
            Add Group
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modifier groups..."
            className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl pl-9 pr-3 py-2.5 placeholder-neutral-400 focus:outline-none focus:border-[#E76F51]/50 text-[#1F2226] transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 rounded-2xl bg-[#FAF9F6] border border-[#ECE7E1] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[10px] leading-relaxed text-rose-700">
            {error}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-xs font-display font-bold text-[#1F2226]">
              {search.trim()
                ? "No modifier groups found."
                : "No modifier groups yet."}
            </div>

            {!search.trim() && (
              <>
                <p className="text-[10px] text-[#8C7A6B] mt-1.5">
                  Create your first group to start adding options.
                </p>

                <button
                  type="button"
                  onClick={onAddGroup}
                  className="mt-4 text-[10px] font-display font-bold text-[#C83214] hover:text-[#E76F51] cursor-pointer"
                >
                  + Create Modifier Group
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGroups.map((group) => {
              const isSelected = selectedGroupId === group.id;

              const modifierTypeLabel =
                group.modifierType === "include" ? "Include" : "Exclude";

              return (
                <div
                  key={group.id}
                  className={`relative rounded-2xl border transition-all ${
                    isSelected
                      ? "border-[#E76F51] bg-[#FFF8F4] shadow-brilixis-sm"
                      : "border-[#E8E5DD] bg-white hover:border-[#CFC8C0]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      onSelectGroup(group);
                    }}
                    className="w-full text-left p-4 pr-12 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection indicator */}
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-none ${
                          group.isActive ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-xs font-display font-black text-[#1F2226] truncate">
                            {group.name}
                          </h4>

                          {isSelected && (
                            <span className="text-[8px] font-mono uppercase font-bold text-[#C83214] bg-[#FFE8DE] px-1.5 py-0.5 rounded-md flex-none">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md ${
                              group.modifierType === "include"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {modifierTypeLabel}
                          </span>

                          <span
                            className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md ${
                              group.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            {group.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Group actions */}
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        setOpenMenuId((current) =>
                          current === group.id ? null : group.id,
                        );
                      }}
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
                      aria-label={`Actions for ${group.name}`}
                    >
                      <MoreVertical size={13} />
                    </button>

                    {openMenuId === group.id && (
                      <div className="absolute right-0 top-9 z-20 w-32 bg-white border border-[#E8E5DD] rounded-xl shadow-lg p-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId(null);
                            onEditGroup(group);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-display font-bold text-neutral-700 hover:bg-[#FAF9F6] cursor-pointer"
                        >
                          <Edit3 size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId(null);
                            onDeleteGroup(group);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-display font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
