import { useCallback, useEffect, useState } from "react";

import { MenuItem } from "../types/menuData";

import { getApiErrorMessage } from "../services/api/client";

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

  reload: () => Promise<void>;
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

  /**
   * Loads/reloads the customer's dining context
   * and restaurant menu.
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
      const diningSession = await enterDiningSession(token);

      setSession(diningSession);

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
        restaurantId: diningSession.restaurantId,

        tableId: diningSession.tableId,
      });

      /*
       * Step 4:
       *
       * Give the normalized menu to the UI.
       */
      setMenuItems(items);
    } catch (requestError) {
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

    reload: load,
  };
}
