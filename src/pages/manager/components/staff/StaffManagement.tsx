import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Edit3, Plus, RefreshCw, Trash2, User, X } from "lucide-react";

import { useAuth } from "@/src/context/AuthContext";
import { getApiErrorMessage } from "@/src/services/api/client";
import {
  createStaffMember,
  fetchStaffMembers,
  removeStaffMember,
  updateStaffAccountStatus,
  updateStaffAvailabilityStatus,
  updateStaffMember,
} from "@/src/services/staff.service";
import {
  StaffAccountStatus,
  StaffAvailabilityStatus,
  StaffMember,
  StaffRole,
} from "@/src/types/staff";

interface StaffOrderSummary {
  status: string;
  waiterName?: string;
  tableNumber: number;
}

interface StaffManagementProps {
  allOrders: StaffOrderSummary[];
  onNotify: (message: string) => void;
}

interface StaffFormState {
  fullname: string;
  email: string;
  contact_no: string;
  role: StaffRole;
}

const EMPTY_FORM: StaffFormState = {
  fullname: "",
  email: "",
  contact_no: "",
  role: "waiter",
};

const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Manager",
  waiter: "Waiter",
  kitchen: "Kitchen Staff",
};

const ACCOUNT_STATUS_LABELS: Record<StaffAccountStatus, string> = {
  PENDING: "Pending setup",
  ACTIVE: "Active account",
  INACTIVE: "Inactive account",
  SUSPENDED: "Suspended",
  BANNED: "Banned",
};

const AVAILABILITY_LABELS: Record<StaffAvailabilityStatus, string> = {
  AVAILABLE: "Available",
  ON_BREAK: "On break",
  OFF_DUTY: "Off duty",
};

export default function StaffManagement({
  allOrders,
  onNotify,
}: StaffManagementProps) {
  const { role: currentRole } = useAuth();
  const isOwner = currentRole === "owner";

  // The frontend follows the intended hierarchy. Backend authorization still
  // must enforce this independently; the UI is not a security boundary.
  const availableRoles: StaffRole[] = isOwner
    ? ["manager", "waiter", "kitchen"]
    : ["waiter", "kitchen"];

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyStaffId, setBusyStaffId] = useState<string | null>(null);

  const refreshStaff = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const records = await fetchStaffMembers();
      setStaffMembers(records);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to load staff. Check the Staff API route and try again.",
      );
      setLoadError(message);
      console.error("Failed to fetch staff members:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStaff();
  }, [refreshStaff]);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staffMembers;

    return staffMembers.filter((member) =>
      [member.fullname, member.username, member.email, member.phone_no, member.role]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [staffMembers, searchTerm]);

  const activeShiftCount = staffMembers.filter(
    (member) =>
      member.status === "ACTIVE" &&
      member.availability_status === "AVAILABLE",
  ).length;

  const openAddModal = () => {
    setEditingStaff(null);
    setForm({ ...EMPTY_FORM, role: availableRoles[0] ?? "waiter" });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setForm({
      fullname: member.fullname,
      email: member.email,
      contact_no: member.phone_no,
      role: member.role,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormError(null);
  };

  const handleSaveStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const fullname = form.fullname.trim();
    const email = form.email.trim().toLowerCase();
    const contactNo = form.contact_no.trim();

    if (!fullname || !contactNo || (!editingStaff && !email)) {
      setFormError("Please complete the required name, email and phone fields.");
      return;
    }

    if (!availableRoles.includes(form.role)) {
      setFormError("You cannot assign the selected role.");
      return;
    }

    try {
      setIsSaving(true);

      if (editingStaff) {
        await updateStaffMember(editingStaff.id, {
          fullname,
          contact_no: contactNo,
          role: form.role,
        });
        onNotify(`Updated staff record for ${fullname}.`);
      } else {
        await createStaffMember({
          fullname,
          email,
          contact_no: contactNo,
          role: form.role,
        });
        onNotify(`Created staff account for ${fullname}. The account starts pending setup.`);
      }

      setIsModalOpen(false);
      setEditingStaff(null);
      await refreshStaff();
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to save staff member.");
      setFormError(message);
      console.error("Staff save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvailabilityChange = async (member: StaffMember) => {
    if (member.status !== "ACTIVE" || busyStaffId) return;

    const nextStatus: StaffAvailabilityStatus =
      member.availability_status === "AVAILABLE" ? "ON_BREAK" : "AVAILABLE";

    try {
      setBusyStaffId(member.id);
      await updateStaffAvailabilityStatus(member.id, nextStatus);
      await refreshStaff();
      onNotify(`${member.fullname} is now ${AVAILABILITY_LABELS[nextStatus].toLowerCase()}.`);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to change shift availability.");
      onNotify(message);
      console.error("Staff availability update failed:", error);
    } finally {
      setBusyStaffId(null);
    }
  };

  const handleAccountStatusChange = async (member: StaffMember) => {
    if (!['ACTIVE', 'INACTIVE'].includes(member.status) || busyStaffId) return;

    const nextStatus: "ACTIVE" | "INACTIVE" =
      member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setBusyStaffId(member.id);
      await updateStaffAccountStatus(member.id, nextStatus);
      await refreshStaff();
      onNotify(`${member.fullname}'s account is now ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to change the account status.");
      onNotify(message);
      console.error("Staff account-status update failed:", error);
    } finally {
      setBusyStaffId(null);
    }
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (busyStaffId) return;
    if (!window.confirm(`Remove staff member "${member.fullname}"?`)) return;

    try {
      setBusyStaffId(member.id);
      await removeStaffMember(member.id);
      await refreshStaff();
      onNotify(`Removed staff member "${member.fullname}".`);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to remove staff member.");
      onNotify(message);
      console.error("Staff deletion failed:", error);
    } finally {
      setBusyStaffId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white border border-[#E8E5DD] rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#C83214] font-bold block uppercase">
            TEAM DIRECTORY SHIFTS
          </span>
          <h3 className="text-base font-display font-black text-[#1F2226] mt-0.5">
            Staff directory ({staffMembers.length} total)
          </h3>
          <p className="text-[10px] text-[#8C7A6B] mt-1">
            Staff data is loaded from the current Laravel API.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs bg-[#FAF9F6] border border-[#E8E5DD] px-3 py-1.5 rounded-xl text-[#8C7A6B]">
            Active shifts: <span className="text-[#1F2226] font-bold">{activeShiftCount}</span>
          </div>
          <button
            type="button"
            onClick={() => void refreshStaff()}
            disabled={isLoading}
            title="Refresh staff directory"
            className="p-2 rounded-xl border border-[#E8E5DD] text-[#6B7280] hover:bg-[#FAF9F6] disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#E76F51] hover:bg-[#d95d3f] text-white px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer shadow-brilixis-sm transition-all whitespace-nowrap"
          >
            <Plus size={14} /> Add Staff Member
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white border border-[#E8E5DD] rounded-2xl px-3 py-2.5">
        <User size={15} className="text-[#8C7A6B]" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search name, username, email or phone..."
          className="w-full text-xs outline-none bg-transparent text-[#2D2D2D]"
        />
      </div>

      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 flex-none" />
          <div className="flex-1">
            <p className="text-xs font-bold">Staff data could not be loaded</p>
            <p className="text-xs mt-1">{loadError}</p>
            <p className="text-[10px] mt-2">
              This may indicate an API route, authorization or response-format mismatch. The backend has not been changed by this frontend module.
            </p>
          </div>
          <button type="button" onClick={() => void refreshStaff()} className="text-xs font-bold underline">
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#6B7280]">
          <RefreshCw size={18} className="animate-spin" /> Loading staff...
        </div>
      ) : !loadError && filteredStaff.length === 0 ? (
        <div className="bg-white border border-[#E8E5DD] rounded-[2rem] py-16 text-center">
          <User size={24} className="mx-auto mb-3 text-[#8C7A6B]" />
          <p className="text-sm font-display font-bold text-[#1F2226]">
            {staffMembers.length === 0 ? "No staff members found" : "No matching staff members"}
          </p>
          <p className="text-xs text-[#8C7A6B] mt-1">
            {staffMembers.length === 0 ? "Create a staff account to get started." : "Try another search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="staff-shifts-grid">
          {filteredStaff.map((member) => {
            const isBusy = busyStaffId === member.id;
            const assignedTables = allOrders
              .filter((order) => order.status !== "paid" && order.waiterName === member.fullname)
              .map((order) => `TBL ${order.tableNumber.toString().padStart(2, "0")}`);

            return (
              <div
                key={member.id}
                className={`bg-white border border-[#E8E5DD] rounded-[2rem] p-5 flex flex-col justify-between transition-all ${member.availability_status !== "AVAILABLE" ? "opacity-90 bg-neutral-50/50" : "shadow-xs"}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2.5 items-center flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-none bg-[#C83214]/10 text-[#C83214]">
                        <User size={15} />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-display font-bold text-[#1F2226] truncate">{member.fullname}</h4>
                        <p className="text-[10px] text-[#8C7A6B] font-mono leading-none mt-0.5 truncate">
                          {ROLE_LABELS[member.role]} · {member.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        title="Edit Staff Member"
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-[#E76F51] hover:text-white text-neutral-600 transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteStaff(member)}
                        disabled={isBusy}
                        title="Remove Staff Member"
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-600 hover:text-white text-neutral-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`text-[8px] font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full uppercase ${member.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : member.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-neutral-200 text-neutral-700"}`}>
                      {ACCOUNT_STATUS_LABELS[member.status]}
                    </span>
                    <span className={`text-[8px] font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full uppercase ${member.availability_status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : member.availability_status === "ON_BREAK" ? "bg-amber-100 text-amber-800" : "bg-neutral-200 text-neutral-700"}`}>
                      {AVAILABILITY_LABELS[member.availability_status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#FAF9F6]">
                    <div className="bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl p-2 min-w-0">
                      <span className="text-[8px] font-mono text-[#8C7A6B] block uppercase">Phone</span>
                      <span className="text-[10px] font-mono font-bold text-[#2D2D2D] truncate block">{member.phone_no || "N/A"}</span>
                    </div>
                    <div className="bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl p-2 min-w-0">
                      <span className="text-[8px] font-mono text-[#8C7A6B] block uppercase">Email</span>
                      <span className="text-[10px] font-mono font-bold text-[#2D2D2D] truncate block">{member.email || "N/A"}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50/50 border border-zinc-100 rounded-xl mt-3 space-y-1">
                    <span className="text-[8.5px] font-mono text-neutral-500 uppercase tracking-wider font-bold block">Active Tables Assignment</span>
                    {assignedTables.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assignedTables.map((tableLabel, index) => (
                          <span key={`${member.id}-${tableLabel}-${index}`} className="text-[8px] font-mono font-bold bg-[#C83214]/5 border border-[#C83214]/10 text-[#C83214] px-1.5 py-0.5 rounded uppercase">
                            {tableLabel}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-[#8C7A6B] italic block leading-tight">No active tables assigned right now</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[#FAF9F6]">
                  <button
                    type="button"
                    onClick={() => void handleAvailabilityChange(member)}
                    disabled={member.status !== "ACTIVE" || isBusy}
                    title={member.status !== "ACTIVE" ? "Availability can be changed after the account is active" : undefined}
                    className="py-2 px-3 border rounded-lg text-[9px] uppercase font-mono font-black transition-colors cursor-pointer text-center bg-white hover:bg-[#FAF9F6] border-[#E8E5DD] text-[#8C7A6B] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isBusy ? "Saving..." : member.availability_status === "AVAILABLE" ? "Set Break" : "Mark Available"}
                  </button>

                  {member.status === "ACTIVE" || member.status === "INACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => void handleAccountStatusChange(member)}
                      disabled={isBusy}
                      className={`py-2 px-3 border rounded-lg text-[9px] uppercase font-mono font-black transition-colors cursor-pointer text-center disabled:opacity-40 ${member.status === "ACTIVE" ? "bg-white hover:bg-rose-50 border-[#E8E5DD] text-rose-700" : "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"}`}
                    >
                      {member.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  ) : (
                    <div className="py-2 px-3 border border-dashed border-[#E8E5DD] rounded-lg text-[8px] text-center text-[#8C7A6B] flex items-center justify-center">
                      {member.status === "PENDING" ? "Waiting for account setup" : "Account status locked"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-[#8C7A6B] px-1">
        Performance ratings and bonuses are not connected because the current backend does not provide those operations. This screen does not create fake ratings or bonus records.
      </p>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#ECE7E1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#ECE7E1]">
              <div>
                <h3 className="text-base font-display font-bold text-[#2D2D2D]">
                  {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
                </h3>
                <p className="text-[9px] text-[#8C7A6B] font-mono mt-0.5">Existing Laravel Staff API</p>
              </div>
              <button type="button" onClick={closeModal} disabled={isSaving} className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer disabled:opacity-50">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle size={14} className="flex-none mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">Full Name *</label>
                <input type="text" required maxLength={255} value={form.fullname} onChange={(event) => setForm({ ...form, fullname: event.target.value })} placeholder="e.g. Rahul Sharma" className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]" />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">Email Address {!editingStaff ? "*" : "(cannot be changed here)"}</label>
                <input type="email" required={!editingStaff} readOnly={Boolean(editingStaff)} maxLength={255} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="staff@example.com" className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51] read-only:bg-neutral-100 read-only:text-[#8C7A6B]" />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">Phone Number *</label>
                <input type="tel" required maxLength={20} value={form.contact_no} onChange={(event) => setForm({ ...form, contact_no: event.target.value })} placeholder="+91 9876543210" className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]" />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">Application Role *</label>
                <select required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })} className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]">
                  {availableRoles.map((staffRole) => (
                    <option key={staffRole} value={staffRole}>{ROLE_LABELS[staffRole]}</option>
                  ))}
                </select>
                <p className="text-[9px] text-[#8C7A6B] mt-1.5 leading-relaxed">
                  This role controls which POS portal the member may access. A new account starts as pending and cannot use the portal until its account setup is complete.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ECE7E1]">
                <button type="button" onClick={closeModal} disabled={isSaving} className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 cursor-pointer disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E76F51] hover:bg-[#d95d3f] cursor-pointer shadow-brilixis-sm disabled:opacity-50">
                  {isSaving ? "Saving..." : editingStaff ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
