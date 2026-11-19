import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Check } from "lucide-react";
import { MenuItem } from "../../../types/menuData";

import { getCustomerMenuItemDetails } from "../../../services/customer/menu.service";

import { getApiErrorMessage } from "../../../services/api/client";

import { CartItemModifier } from "../../../types/types";
import { CustomerMenuModifierGroup } from "../../../types/menuData";

interface ItemSelectorModalProps {
  item: MenuItem | null;
  qrToken: string;
  onClose: () => void;

  addConfiguredToCart: (
    item: MenuItem,
    quantity: number,
    modifiers: CartItemModifier[],
    notes: string,
  ) => void;
}

export const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({
  item,
  qrToken,
  onClose,
  addConfiguredToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedModifiersByGroup, setSelectedModifiersByGroup] = useState<
    Record<string, string[]>
  >({});

  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string>("");

  const [modifierGroups, setModifierGroups] = useState<
    CustomerMenuModifierGroup[]
  >([]);

  const [isLoadingModifiers, setIsLoadingModifiers] = useState(false);

  const [modifierLoadError, setModifierLoadError] = useState<string | null>(
    null,
  );

  const [loadedItemId, setLoadedItemId] = useState<string | null>(null);

  const selectedMenuItemId = item?.id;

  useEffect(() => {
    if (!selectedMenuItemId || !qrToken) return;

    // At this point, menuItemId is definitely a string.
    const menuItemId: string = selectedMenuItemId;

    let cancelled = false;

    async function loadModifiers() {
      setIsLoadingModifiers(true);
      setModifierLoadError(null);
      setModifierGroups([]);
      setLoadedItemId(null);

      try {
        const details = await getCustomerMenuItemDetails({
          qrToken,
          menuItemId,
        });

        if (cancelled) return;

        setModifierGroups(details.modifierGroups);
        setLoadedItemId(menuItemId);

        console.log("Customer menu item modifier details:", details);
      } catch (error) {
        if (cancelled) return;

        setModifierLoadError(
          getApiErrorMessage(error, "Unable to load customization options."),
        );
      } finally {
        if (!cancelled) {
          setIsLoadingModifiers(false);
        }
      }
    }

    void loadModifiers();

    return () => {
      cancelled = true;
    };
  }, [selectedMenuItemId, qrToken]);

  // Reset defaults on opening different item
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedModifiersByGroup({});
      setCustomInstructions("");
      setSelectionError(null);
    }
  }, [item]);

  if (!item) return null;

  const handleToggleModifier = (
    group: CustomerMenuModifierGroup,
    modifierId: string,
  ) => {
    setSelectionError(null);

    setSelectedModifiersByGroup((previous) => {
      const currentSelected = previous[group.id] ?? [];

      // Already selected: remove it.
      if (currentSelected.includes(modifierId)) {
        return {
          ...previous,
          [group.id]: currentSelected.filter((id) => id !== modifierId),
        };
      }

      // Maximum selection reached.
      if (currentSelected.length >= group.maxSelection) {
        return previous;
      }

      // Add the selection.
      return {
        ...previous,
        [group.id]: [...currentSelected, modifierId],
      };
    });
  };

  const calculateItemPrice = () => {
    const modifierTotal = selectedModifiers.reduce(
      (total, modifier) => total + modifier.modifierPrice,
      0,
    );

    return (item.price + modifierTotal) * quantity;
  };

  const selectedModifiers: CartItemModifier[] = modifierGroups.flatMap(
    (group) => {
      const selectedIds = selectedModifiersByGroup[group.id] ?? [];

      return group.modifiers
        .filter((modifier) => selectedIds.includes(modifier.id))
        .map((modifier) => ({
          modifierId: modifier.id,
          modifierGroupId: group.id,
          modifierGroupName: group.name,
          modifierName: modifier.name,
          modifierType: group.type,
          modifierPrice: modifier.price,
        }));
    },
  );

  const handleConfirmAdd = () => {
    if (!item || isLoadingModifiers || modifierLoadError) {
      return;
    }

    const invalidGroups = modifierGroups.filter((group) => {
      const selectedCount = selectedModifiersByGroup[group.id]?.length ?? 0;

      return (
        selectedCount < group.minSelection || selectedCount > group.maxSelection
      );
    });

    if (invalidGroups.length > 0) {
      setSelectionError(
        `Please complete the required selections: ${invalidGroups
          .map((group) => group.name)
          .join(", ")}`,
      );
      return;
    }

    addConfiguredToCart(item, quantity, selectedModifiers, customInstructions);

    onClose();
  };

  const isDetailsReady =
    !!item && loadedItemId === item.id && !isLoadingModifiers;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        id="customizer-modal-root"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          id="customizer-backdrop"
        />

        {/* Modal Sheet aligned to Brilixis light theme */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="relative w-full max-w-md bg-[#FFFDF8] border-t border-[#ECE7E1] rounded-t-[2.5rem] shadow-brilixis-lg overflow-y-auto max-h-[92vh] no-scrollbar z-50 text-[#2D2D2D]"
          id="customizer-panel"
        >
          {/* Keep the close button visible even during loading */}
          <button
            onClick={onClose}
            className="btn-icon absolute top-4 right-4 z-20 p-2 rounded-full w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md"
            id="close-customizer-btn"
          >
            <X size={18} />
          </button>

          {isDetailsReady ? (
            <>
              {/* Show actual image only after details are ready */}
              <div className="relative h-56 w-full bg-[#FFFDF8]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FFFDF8] to-transparent" />
              </div>
              {/* Modal details */}

              <div className="p-6 pt-2">
                {/* KEEP ALL THE EXISTING CONTENT HERE:
          1. Item name, veg badge and price
          2. Description
          3. Database-driven modifier groups
          4. Selection errors
          5. Special instructions
          6. Quantity stepper
          7. Add Dish button
      */}
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div>
                    {/* Veg / Non-veg badges */}
                    <div className="flex gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          item.isVeg
                            ? "bg-emerald-50 text-[#2A9D8F] border border-emerald-200"
                            : "bg-red-50 text-[#EB5757] border border-red-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-[#2A9D8F]" : "bg-[#EB5757]"}`}
                        />
                        {item.isVeg ? "VEGETARIAN" : "NON-VEGETARIAN"}
                      </span>

                      {item.isSignature && (
                        <span className="bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold">
                          CHEF'S CHOICE
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-display font-extrabold text-[#2D2D2D] tracking-tight leading-tight">
                      {item.name}
                    </h2>
                  </div>

                  <div
                    className="flex items-baseline gap-0.5"
                    id="customizer-price-badge"
                  >
                    <span className="text-xs font-mono text-[#E76F51] font-bold">
                      ₹
                    </span>
                    <span className="text-xl font-display font-black text-[#2D2D2D]">
                      {item.price}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Database-driven customization */}
                <div className="mb-6">
                  <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-3">
                    Customize Your Dish
                  </h3>

                  {isLoadingModifiers && (
                    <p className="text-xs text-[#6B7280]">
                      Loading customization options...
                    </p>
                  )}

                  {modifierLoadError && (
                    <p className="text-xs text-red-600">{modifierLoadError}</p>
                  )}

                  {!isLoadingModifiers &&
                    !modifierLoadError &&
                    modifierGroups.length === 0 && (
                      <p className="text-xs text-[#6B7280]">
                        No additional customization options available.
                      </p>
                    )}

                  {modifierGroups.map((group) => {
                    const selectedIds =
                      selectedModifiersByGroup[group.id] ?? [];

                    const selectionCount = selectedIds.length;

                    return (
                      <div
                        key={group.id}
                        className="mb-4 p-4 bg-white border border-[#ECE7E1] rounded-2xl"
                      >
                        {/* Group heading */}
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <h4 className="text-xs font-display font-bold text-[#2D2D2D]">
                            {group.name}
                          </h4>

                          <span
                            className={`text-[9px] uppercase font-mono font-bold px-2 py-1 rounded-lg ${
                              group.type === "include"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {group.type === "include" ? "Add" : "Remove"}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#6B7280] mb-3">
                          {group.minSelection === 0
                            ? `Optional — choose up to ${group.maxSelection}`
                            : `Choose at least ${group.minSelection} and at most ${group.maxSelection}`}
                        </p>

                        {/* Modifier options */}
                        <div className="space-y-2">
                          {group.modifiers.map((modifier) => {
                            const isSelected = selectedIds.includes(
                              modifier.id,
                            );

                            const isLimitReached =
                              selectionCount >= group.maxSelection;

                            const isDisabled = !isSelected && isLimitReached;

                            return (
                              <label
                                key={modifier.id}
                                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                                  isSelected
                                    ? "border-[#E76F51]/50 bg-[#E76F51]/5"
                                    : "border-[#ECE7E1] bg-white"
                                } ${
                                  isDisabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() =>
                                      handleToggleModifier(group, modifier.id)
                                    }
                                    className="accent-[#E76F51] w-4 h-4"
                                  />

                                  <span className="text-xs font-medium text-[#2D2D2D]">
                                    {modifier.name}
                                  </span>
                                </div>

                                <span className="text-xs font-mono font-bold text-[#6B7280]">
                                  {modifier.price === 0
                                    ? "₹0.00"
                                    : `₹${modifier.price.toFixed(2)}`}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Selection counter */}
                        <div className="mt-3 pt-2 border-t border-[#ECE7E1] flex justify-between">
                          <span className="text-[10px] text-[#6B7280]">
                            Selected
                          </span>

                          <span className="text-[10px] font-mono font-bold">
                            {selectionCount}/{group.maxSelection}
                          </span>
                        </div>

                        {selectionCount < group.minSelection && (
                          <p className="text-[10px] text-red-600 mt-2">
                            Please select at least {group.minSelection}{" "}
                            option(s).
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {selectionError && (
                    <p className="text-xs text-red-600 mt-2">
                      {selectionError}
                    </p>
                  )}
                </div>

                {/* Customizer Option 3: Additional Notes */}
                <div className="mb-6">
                  <h3 className="text-xs font-display font-extrabold uppercase tracking-wider text-[#6B7280] mb-2 font-mono">
                    Special Culinary Instructions
                  </h3>
                  <textarea
                    placeholder="Allergy alerts, spice preference, or specific chef instructions..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={3}
                    className="input-field p-3.5 text-xs focus:border-[#E76F51] resize-none shadow-brilixis-sm font-sans"
                    id="special-directions-textbox"
                  />
                </div>

                {/* Stepper + Indian Rupees Confirm Button */}
                <div className="pt-4 border-t border-[#ECE7E1] flex items-center justify-between gap-4">
                  {/* Stepper */}
                  <div
                    className="flex items-center bg-white border border-[#ECE7E1] rounded-2xl p-1.5 shadow-brilixis-sm"
                    id="customizer-stepper"
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer"
                      title="Decrease Quantity"
                      id="stepper-minus"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 min-w-[2.25rem] text-center font-mono font-bold text-[#2D2D2D] text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-[#6B7280] hover:text-[#E76F51] transition-colors cursor-pointer"
                      title="Increase Quantity"
                      id="stepper-plus"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Confirm CTA */}
                  <button
                    onClick={handleConfirmAdd}
                    disabled={isLoadingModifiers || !!modifierLoadError}
                    className="btn-primary flex-1 py-4 px-6 text-xs uppercase tracking-wider text-center disabled:opacity-50"
                    id="stepper-confirm-order"
                  >
                    Add Dish • ₹{calculateItemPrice().toFixed(2)}
                  </button>
                </div>
              </div>
            </>
          ) : modifierLoadError ? (
            <div className="p-8 text-center min-h-[300px] flex flex-col justify-center">
              <h3 className="text-lg font-bold text-[#2D2D2D]">
                Unable to load customization
              </h3>

              <p className="text-sm text-red-600 mt-2">{modifierLoadError}</p>

              <button onClick={onClose} className="btn-primary mt-5 px-5 py-3">
                Close
              </button>
            </div>
          ) : (
            <ItemSelectorSkeleton />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// skeleton loader
const ItemSelectorSkeleton: React.FC = () => {
  return (
    <div
      className="animate-pulse"
      role="status"
      aria-label="Loading menu item details"
    >
      {/* Image placeholder */}
      <div className="h-56 w-full bg-[#ECE7E1]" />

      {/* Details placeholder */}
      <div className="p-6 pt-4 space-y-5">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-[#ECE7E1] rounded" />
          <div className="h-7 w-3/4 bg-[#ECE7E1] rounded" />
          <div className="h-3 w-full bg-[#ECE7E1] rounded" />
          <div className="h-3 w-2/3 bg-[#ECE7E1] rounded" />
        </div>

        {/* Modifier group placeholders */}
        <div className="space-y-3">
          <div className="h-4 w-1/2 bg-[#ECE7E1] rounded" />

          {[1, 2, 3].map((index) => (
            <div key={index} className="h-12 w-full bg-[#ECE7E1] rounded-xl" />
          ))}
        </div>

        {/* Notes placeholder */}
        <div className="h-20 w-full bg-[#ECE7E1] rounded-xl" />

        {/* Footer placeholder */}
        <div className="h-14 w-full bg-[#ECE7E1] rounded-xl" />
      </div>

      <span className="sr-only">
        Loading menu item and customization options...
      </span>
    </div>
  );
};
