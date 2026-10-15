export type StaffRole = "manager" | "waiter" | "kitchen";

export type StaffAccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "BANNED";

export type StaffAvailabilityStatus = "AVAILABLE" | "ON_BREAK" | "OFF_DUTY";

/** Normalized frontend representation of the existing Laravel User response. */
export interface StaffMember {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone_no: string;
  role: StaffRole;
  status: StaffAccountStatus;
  availability_status: StaffAvailabilityStatus;
}

export interface CreateStaffPayload {
  fullname: string;
  email: string;
  contact_no: string;
  role: StaffRole;
}

export interface UpdateStaffPayload {
  fullname: string;
  contact_no: string;
  role: StaffRole;
}
