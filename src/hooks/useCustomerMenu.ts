import { useCallback, useEffect, useState } from "react";

import { MenuItem } from "../types/menuData";

import { ApiError, getApiErrorMessage } from "../services/api/client";

import {
  enterDiningSession,
  DiningSessionContext,
} from "../services/customer/dining_session.service";

import { getCustomerMenuItems } from "../services/customer/menu.service";

import { getTableQrToken } from "../utils/customerQr";

/**
 * State required by the customer menu page.
 */
interface CustomerMenuState {
  qrToken: string | null;
  session: DiningSessionContext | null;
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  isSessionExpired: boolean;
  reload: () => Promise<void>;
  rejoinCurrentSession: () => Promise<void>;
}

// Helper function to get session key name
function getDiningSessionStorageKey(qrToken: string): string {
  return `customer:dining-session:${qrToken}`;
}

/**
 * Handles the complete customer bootstrap flow:
 *
 * URL
 *   ↓
 * QR token
 *   ↓
 * Laravel QR/session validation
 *   ↓
 * dining session
 *   ↓
 * restaurantId + tableId
 *   ↓
 * menu API
 *   ↓
 * menuItems
 *
 * CustomerPage should consume this hook instead of
 * directly calling API services.
 */
export function useCustomerMenu(): CustomerMenuState {
  const [qrToken, setQrToken] = useState<string | null>(null);

  const [session, setSession] = useState<DiningSessionContext | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  /**
   * Loads/reloads the customer's dining context
   * and restaurant menu.
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsSessionExpired(false);

    /*
     * Step 1:
     *
     * Read the QR token from the current URL.
     */
    const token = getTableQrToken();

    setQrToken(token);

    /*
     * No token means the customer did not arrive
     * through a valid table QR link.
     */
    if (!token) {
      setSession(null);
      setMenuItems([]);

      setError(
        "This menu link is missing a table QR token. Please scan the table QR code again.",
      );

      setIsLoading(false);

      return;
    }

    let savedSessionId: string | null = null;
    let enteringSession = true;

    try {
      /*
       * Step 2:
       *
       * Send the QR token to Laravel.
       *
       * Laravel validates the QR and returns:
       *
       * diningSessionId
       * tableId
       * tableNumber / tableName
       * restaurantId
       */
      const storageKey = getDiningSessionStorageKey(token);

      savedSessionId = sessionStorage.getItem(storageKey);

      const diningSession = await enterDiningSession(
        token,
        savedSessionId ?? undefined,
      );

      sessionStorage.setItem(storageKey, diningSession.diningSessionId);

      setSession(diningSession);

      // Session entry succeeded. Subsequent errors are not
      // automatically classified as session-expiry errors.
      enteringSession = false;

      /*
       * Step 3:
       *
       * Use the resolved restaurant/table IDs
       * to request the restaurant menu.
       *
       * We do NOT take restaurant_id or table_id
       * from the URL.
       *
       * Laravel's validated session is the source
       * of truth.
       */
      const items = await getCustomerMenuItems({
        qrToken: token,
      });

      /*
       * Step 4:
       *
       * Give the normalized menu to the UI.
       */
      setMenuItems(items);
    } catch (requestError) {
      const sessionExpired =
        enteringSession &&
        savedSessionId !== null &&
        requestError instanceof ApiError &&
        requestError.status === 409;

      setIsSessionExpired(sessionExpired);
      /*
       * Clear previously loaded customer data
       * when the bootstrap process fails.
       */
      setSession(null);
      setMenuItems([]);

      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load this restaurant menu.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejoinCurrentSession = useCallback(async () => {
    const token = getTableQrToken();

    if (token) {
      const storageKey = getDiningSessionStorageKey(token);

      // Clear the previous session only after explicit user action.
      sessionStorage.removeItem(storageKey);
    }

    // Bootstrap again without the previous session ID.
    await load();
  }, [load]);

  /*
   * Automatically bootstrap the customer page
   * when the component mounts.
   */
  useEffect(() => {
    void load();
  }, [load]);

  return {
    qrToken,
    session,
    menuItems,
    isLoading,
    error,
    isSessionExpired,
    reload: load,
    rejoinCurrentSession,
  };
}
