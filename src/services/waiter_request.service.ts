import type { Dispatch, SetStateAction } from "react";
import { WaiterRequest } from "../types/types";

/**
 * Legacy local helper kept for the current UI until the customer waiter-request
 * endpoint is wired. Network code belongs in a service; the component owns state.
 */
export function createLocalWaiterRequest(
  type: WaiterRequest["type"],
  label: string,
  tableNumber: string,
): WaiterRequest {
  return {
    id: `local-${Date.now()}`,
    type,
    label,
    tableNumber,
    status: "requested",
  };
}

export function removeLocalWaiterRequest(
  requests: WaiterRequest[],
  tableNumber: string,
): WaiterRequest[] {
  return requests.filter((request) => request.tableNumber !== tableNumber);
}

export function assignLocalWaiterRequest(
  requests: WaiterRequest[],
  requestId: string,
  waiterName: string,
): WaiterRequest[] {
  return requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: "assigned",
          waiterName,
          etaString: "Inside Dining Area",
        }
      : request,
  );
}

export function resolveLocalWaiterRequest(
  requests: WaiterRequest[],
  requestId: string,
): WaiterRequest[] {
  return requests.filter((request) => request.id !== requestId);
}

// Backward-compatible exports for components that have not yet migrated to
// the API-backed waiter request service.
export const triggerCallWaiter = (
  type: WaiterRequest["type"],
  label: string,
  tableNumber: string,
  setRequests: Dispatch<SetStateAction<WaiterRequest[]>>,
) => {
  setRequests((previous) => [
    ...previous,
    createLocalWaiterRequest(type, label, tableNumber),
  ]);
};

export const cancelWaiterRequest = (
  tableNumber: string,
  setRequests: Dispatch<SetStateAction<WaiterRequest[]>>,
  setActiveRequest: Dispatch<SetStateAction<WaiterRequest | null>>,
) => {
  setRequests((previous) => removeLocalWaiterRequest(previous, tableNumber));
  setActiveRequest(null);
};

export const assignWaiterToCall = (
  requestId: string,
  waiterName: string,
  setRequests: Dispatch<SetStateAction<WaiterRequest[]>>,
) => {
  setRequests((previous) =>
    assignLocalWaiterRequest(previous, requestId, waiterName),
  );
};

export const resolveWaiterCall = (
  requestId: string,
  setRequests: Dispatch<SetStateAction<WaiterRequest[]>>,
) => {
  setRequests((previous) => resolveLocalWaiterRequest(previous, requestId));
};
