import { apiRequest } from "@/src/services/api/client";
import {
  CreateStaffPayload,
  StaffAccountStatus,
  StaffAvailabilityStatus,
  StaffMember,
  StaffRole,
  UpdateStaffPayload,
} from "@/src/types/staff";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

type UnknownRecord = Record<string, unknown>;

const ACCOUNT_STATUS_BY_CODE: Record<number, StaffAccountStatus> = {
  1: "PENDING",
  2: "ACTIVE",
  3: "INACTIVE",
  4: "SUSPENDED",
  5: "BANNED",
};

const AVAILABILITY_BY_CODE: Record<number, StaffAvailabilityStatus> = {
  1: "AVAILABLE",
  2: "ON_BREAK",
  3: "OFF_DUTY",
};

// These values follow the numeric status values documented in the users-table migration.
const ACCOUNT_STATUS_CODE: Record<"ACTIVE" | "INACTIVE", number> = {
  ACTIVE: 2,
  INACTIVE: 3,
};

const AVAILABILITY_CODE: Record<StaffAvailabilityStatus, number> = {
  AVAILABLE: 1,
  ON_BREAK: 2,
  OFF_DUTY: 3,
};

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : null;
}

function normalizeAccountStatus(value: unknown): StaffAccountStatus {
  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && ACCOUNT_STATUS_BY_CODE[numericValue]) {
    return ACCOUNT_STATUS_BY_CODE[numericValue];
  }

  const normalized = String(value ?? "PENDING").trim().toUpperCase();
  if (
    normalized === "ACTIVE" ||
    normalized === "INACTIVE" ||
    normalized === "SUSPENDED" ||
    normalized === "BANNED" ||
    normalized === "PENDING"
  ) {
    return normalized;
  }

  return "PENDING";
}

function normalizeAvailability(value: unknown): StaffAvailabilityStatus {
  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && AVAILABILITY_BY_CODE[numericValue]) {
    return AVAILABILITY_BY_CODE[numericValue];
  }

  const normalized = String(value ?? "OFF_DUTY")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    normalized === "AVAILABLE" ||
    normalized === "ON_BREAK" ||
    normalized === "OFF_DUTY"
  ) {
    return normalized;
  }

  return "OFF_DUTY";
}

function normalizeRole(value: unknown): StaffRole {
  const normalized = String(value ?? "waiter").trim().toLowerCase();
  if (normalized === "manager" || normalized === "kitchen") {
    return normalized;
  }
  return "waiter";
}

function normalizeStaffRecord(value: unknown): StaffMember {
  const record = asRecord(value);
  if (!record) {
    throw new Error("The staff-list endpoint returned an invalid staff record.");
  }

  // Eloquent normally serializes the `userRole` relationship as `user_role`.
  const nestedRole = asRecord(record.user_role ?? record.userRole);
  const roleValue =
    typeof record.role === "string" ? record.role : nestedRole?.role_name;

  return {
    id: String(record.id ?? ""),
    fullname: String(record.fullname ?? record.name ?? ""),
    username: String(record.username ?? ""),
    email: String(record.email ?? ""),
    phone_no: String(record.phone_no ?? record.contact_no ?? ""),
    role: normalizeRole(roleValue),
    status: normalizeAccountStatus(record.status),
    availability_status: normalizeAvailability(record.availability_status),
  };
}

/** GET /api/v1/staff */
export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const response = await apiRequest<ApiEnvelope<unknown[]>>("/api/v1/staff", {
    method: "GET",
    query: { per_page: 100 },
  });

  if (!Array.isArray(response.data)) {
    throw new Error("The staff-list endpoint did not return a data array.");
  }

  return response.data.map(normalizeStaffRecord);
}

/** POST /api/v1/staff/create-staff */
export async function createStaffMember(
  payload: CreateStaffPayload,
): Promise<void> {
  await apiRequest<ApiEnvelope<{ id: number | string; name: string; username: string }>>(
    "/api/v1/staff/create-staff",
    {
      method: "POST",
      body: JSON.stringify({
        fullname: payload.fullname.trim(),
        email: payload.email.trim().toLowerCase(),
        contact_no: payload.contact_no.trim(),
        role: payload.role,
      }),
    },
  );
}

/** PATCH /api/v1/staff/update/{staff} */
export async function updateStaffMember(
  staffId: string,
  payload: UpdateStaffPayload,
): Promise<void> {
  await apiRequest<ApiEnvelope<UnknownRecord>>(
    `/api/v1/staff/update/${encodeURIComponent(staffId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fullname: payload.fullname.trim(),
        contact_no: payload.contact_no.trim(),
        role: payload.role,
      }),
    },
  );
}

/** PATCH /api/v1/staff/{staff}/account-status */
export async function updateStaffAccountStatus(
  staffId: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<void> {
  await apiRequest<ApiEnvelope<UnknownRecord>>(
    `/api/v1/staff/${encodeURIComponent(staffId)}/account-status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: ACCOUNT_STATUS_CODE[status] }),
    },
  );
}

/** PATCH /api/v1/staff/{staff}/availability-status */
export async function updateStaffAvailabilityStatus(
  staffId: string,
  availabilityStatus: StaffAvailabilityStatus,
): Promise<void> {
  await apiRequest<ApiEnvelope<UnknownRecord>>(
    `/api/v1/staff/${encodeURIComponent(staffId)}/availability-status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        availability_status: AVAILABILITY_CODE[availabilityStatus],
      }),
    },
  );
}

/** DELETE /api/v1/staff/remove/{staff} */
export async function removeStaffMember(staffId: string): Promise<void> {
  await apiRequest<ApiEnvelope<unknown>>(
    `/api/v1/staff/remove/${encodeURIComponent(staffId)}`,
    { method: "DELETE" },
  );
}
