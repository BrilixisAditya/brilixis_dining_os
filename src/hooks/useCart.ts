import { useEffect, useState } from "react";

import { CartItem, CartItemModifier } from "../types/types";

import { MenuItem } from "../types/menuData";

const CART_STORAGE_VERSION = 1;

// Expire a draft after 12 hours without cart modifications.
const CART_TTL_MS = 12 * 60 * 60 * 1000;

interface CartState {
  sessionId: string | null;
  items: CartItem[];
  updatedAt: number | null;
  isReady: boolean;
}

interface CartStorageRecord {
  version: number;
  diningSessionId: string;
  updatedAt: number;
  items: CartItem[];
}

function getCartStorageKey(sessionId: string): string {
  return `brilixis:customer-cart:v${CART_STORAGE_VERSION}:${sessionId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isCartItemModifier(value: unknown): value is CartItemModifier {
  if (!isRecord(value)) return false;

  return (
    typeof value.modifierId === "string" &&
    typeof value.modifierGroupId === "string" &&
    typeof value.modifierGroupName === "string" &&
    typeof value.modifierName === "string" &&
    (value.modifierType === "include" || value.modifierType === "exclude") &&
    typeof value.modifierPrice === "number" &&
    Number.isFinite(value.modifierPrice) &&
    value.modifierPrice >= 0
  );
}

/**
 * Validate restored localStorage data.
 *
 * Browser storage is untrusted and may be malformed or edited.
 */
function isPersistedCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false;

  const menuItem = value.menuItem;

  if (!isRecord(menuItem)) return false;

  if (
    typeof menuItem.id !== "string" ||
    typeof menuItem.name !== "string" ||
    typeof menuItem.price !== "number" ||
    !Number.isFinite(menuItem.price) ||
    menuItem.price < 0
  ) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    value.quantity > 0 &&
    Array.isArray(value.modifiers) &&
    value.modifiers.every(isCartItemModifier) &&
    isStringArray(value.excludedIngredients) &&
    isStringArray(value.addedIngredients) &&
    typeof value.customInstructions === "string"
  );
}

function normalizeStrings(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function normalizeNotes(notes: string): string {
  return notes.trim().toLowerCase();
}

function createCartItemId(menuItemId: string): string {
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${menuItemId}-${uniqueId}`;
}

function haveSameModifiers(
  first: CartItemModifier[],
  second: CartItemModifier[],
): boolean {
  const firstIds = first.map((modifier) => modifier.modifierId).sort();
  const secondIds = second.map((modifier) => modifier.modifierId).sort();

  return JSON.stringify(firstIds) === JSON.stringify(secondIds);
}

function haveSameLegacySelections(first: string[], second: string[]): boolean {
  return (
    JSON.stringify(normalizeStrings(first)) ===
    JSON.stringify(normalizeStrings(second))
  );
}

function useCart(diningSessionId: string | null) {
  const [cartState, setCartState] = useState<CartState>({
    sessionId: diningSessionId,
    items: [],
    updatedAt: null,
    isReady: false,
  });

  /*
   * STEP 1: Restore the cart for the exact dining session.
   */
  useEffect(() => {
    if (!diningSessionId) {
      setCartState({
        sessionId: null,
        items: [],
        updatedAt: null,
        isReady: false,
      });

      return;
    }

    let cancelled = false;

    const sessionId = diningSessionId;
    const storageKey = getCartStorageKey(sessionId);

    let restoredItems: CartItem[] = [];
    let restoredUpdatedAt: number | null = null;

    try {
      const storedValue = localStorage.getItem(storageKey);

      if (storedValue) {
        const parsed: unknown = JSON.parse(storedValue);

        if (
          isRecord(parsed) &&
          parsed.version === CART_STORAGE_VERSION &&
          parsed.diningSessionId === sessionId &&
          typeof parsed.updatedAt === "number" &&
          Number.isFinite(parsed.updatedAt) &&
          Array.isArray(parsed.items) &&
          parsed.items.every(isPersistedCartItem)
        ) {
          const now = Date.now();
          const age = now - parsed.updatedAt;

          const isNotExpired = age >= 0 && age < CART_TTL_MS;

          if (isNotExpired && parsed.items.length > 0) {
            restoredItems = parsed.items;
            restoredUpdatedAt = parsed.updatedAt;
          } else {
            localStorage.removeItem(storageKey);
          }
        } else {
          // Malformed, incompatible or mismatched session data.
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      // Includes invalid JSON and browser storage failures.
      console.warn("Unable to restore customer cart:", error);

      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Storage may be unavailable.
      }
    }

    if (!cancelled) {
      setCartState({
        sessionId,
        items: restoredItems,
        updatedAt: restoredUpdatedAt,
        isReady: true,
      });
    }

    return () => {
      cancelled = true;
    };
  }, [diningSessionId]);

  /*
   * STEP 2: Persist cart changes.
   *
   * This effect only writes after the correct session's
   * cart has finished restoring.
   */
  useEffect(() => {
    if (
      !diningSessionId ||
      cartState.sessionId !== diningSessionId ||
      !cartState.isReady
    ) {
      return;
    }

    const storageKey = getCartStorageKey(diningSessionId);

    if (cartState.items.length === 0) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn("Unable to clear customer cart storage:", error);
      }

      return;
    }

    if (cartState.updatedAt === null) return;

    const storageRecord: CartStorageRecord = {
      version: CART_STORAGE_VERSION,
      diningSessionId,
      updatedAt: cartState.updatedAt,
      items: cartState.items,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(storageRecord));
    } catch (error) {
      console.warn("Unable to save customer cart:", error);
    }
  }, [diningSessionId, cartState]);

  /*
   * STEP 3: Automatically expire an abandoned cart
   * even if the browser tab remains open.
   */
  useEffect(() => {
    if (
      !diningSessionId ||
      cartState.sessionId !== diningSessionId ||
      !cartState.isReady ||
      cartState.items.length === 0 ||
      cartState.updatedAt === null
    ) {
      return;
    }

    const expiresAt = cartState.updatedAt + CART_TTL_MS;
    const remainingTime = Math.max(0, expiresAt - Date.now());

    const timeoutId = window.setTimeout(() => {
      setCartState((previousState) => {
        // Don't expire a cart that has been modified since
        // this expiration timer was scheduled.
        if (
          previousState.sessionId !== diningSessionId ||
          previousState.updatedAt !== cartState.updatedAt
        ) {
          return previousState;
        }

        return {
          ...previousState,
          items: [],
          updatedAt: null,
        };
      });
    }, remainingTime);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [diningSessionId, cartState]);

  const isCartReady =
    diningSessionId !== null &&
    cartState.sessionId === diningSessionId &&
    cartState.isReady;

  const cart = isCartReady ? cartState.items : [];

  /*
   * Internal helper for adding or merging cart lines.
   */
  const addOrMergeCartItem = (newItem: Omit<CartItem, "id">): void => {
    if (!diningSessionId || !isCartReady) return;

    // Generate outside the state updater.
    const newCartItemId = createCartItemId(newItem.menuItem.id);

    setCartState((previousState) => {
      if (
        previousState.sessionId !== diningSessionId ||
        !previousState.isReady
      ) {
        return previousState;
      }

      const existingIndex = previousState.items.findIndex(
        (cartItem) =>
          cartItem.menuItem.id === newItem.menuItem.id &&
          haveSameModifiers(cartItem.modifiers, newItem.modifiers) &&
          haveSameLegacySelections(
            cartItem.excludedIngredients,
            newItem.excludedIngredients,
          ) &&
          haveSameLegacySelections(
            cartItem.addedIngredients,
            newItem.addedIngredients,
          ) &&
          normalizeNotes(cartItem.customInstructions) ===
            normalizeNotes(newItem.customInstructions),
      );

      let updatedItems: CartItem[];

      if (existingIndex >= 0) {
        updatedItems = previousState.items.map((cartItem, index) =>
          index === existingIndex
            ? {
                ...cartItem,
                quantity: cartItem.quantity + newItem.quantity,
              }
            : cartItem,
        );
      } else {
        updatedItems = [
          ...previousState.items,
          {
            ...newItem,
            id: newCartItemId,
          },
        ];
      }

      return {
        ...previousState,
        items: updatedItems,
        updatedAt: Date.now(),
      };
    });
  };

  /**
   * Temporary legacy function.
   * Remove after all old customization components are migrated.
   */
  const addToCart = (
    item: MenuItem,
    quantity: number,
    excludedIngredients: string[],
    addedIngredients: string[],
    customInstructions: string,
  ): void => {
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    addOrMergeCartItem({
      menuItem: item,
      quantity,
      modifiers: [],
      excludedIngredients: [...excludedIngredients],
      addedIngredients: [...addedIngredients],
      customInstructions,
    });
  };

  /**
   * Database-backed modifier cart function.
   */
  const addConfiguredToCart = (
    item: MenuItem,
    quantity: number,
    modifiers: CartItemModifier[],
    customInstructions: string,
  ): void => {
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    const uniqueModifiers = [
      ...new Map(
        modifiers.map((modifier) => [modifier.modifierId, modifier]),
      ).values(),
    ];

    const excludedIngredients = uniqueModifiers
      .filter((modifier) => modifier.modifierType === "exclude")
      .map((modifier) => modifier.modifierName);

    const addedIngredients = uniqueModifiers
      .filter((modifier) => modifier.modifierType === "include")
      .map((modifier) => modifier.modifierName);

    addOrMergeCartItem({
      menuItem: item,
      quantity,
      modifiers: uniqueModifiers,
      excludedIngredients,
      addedIngredients,
      customInstructions,
    });
  };

  const removeFromCart = (cartItemId: string): void => {
    if (!isCartReady || !diningSessionId) return;

    setCartState((previousState) => {
      if (
        previousState.sessionId !== diningSessionId ||
        !previousState.isReady
      ) {
        return previousState;
      }

      const updatedItems = previousState.items.filter(
        (item) => item.id !== cartItemId,
      );

      if (updatedItems.length === previousState.items.length) {
        return previousState;
      }

      return {
        ...previousState,
        items: updatedItems,
        updatedAt: Date.now(),
      };
    });
  };

  const updateCartItemQuantity = (
    cartItemId: string,
    quantity: number,
  ): void => {
    if (!Number.isFinite(quantity)) return;

    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    if (!isCartReady || !diningSessionId) return;

    setCartState((previousState) => {
      if (
        previousState.sessionId !== diningSessionId ||
        !previousState.isReady
      ) {
        return previousState;
      }

      const existingItem = previousState.items.find(
        (item) => item.id === cartItemId,
      );

      if (!existingItem || existingItem.quantity === quantity) {
        return previousState;
      }

      return {
        ...previousState,
        items: previousState.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
        updatedAt: Date.now(),
      };
    });
  };

  const clearCart = (): void => {
    if (!isCartReady || !diningSessionId) return;

    setCartState((previousState) => {
      if (
        previousState.sessionId !== diningSessionId ||
        !previousState.isReady ||
        previousState.items.length === 0
      ) {
        return previousState;
      }

      return {
        ...previousState,
        items: [],
        updatedAt: Date.now(),
      };
    });
  };

  return {
    cart,
    isCartReady,
    addToCart,
    addConfiguredToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  };
}

export default useCart;
