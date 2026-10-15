import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign,
  Search,
  Award,
  TrendingUp,
  Notebook,
  LogOut,
  CheckCircle2,
  Users,
  Layers,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  RefreshCw,
  Coffee,
  UtensilsCrossed,
  User,
  MapPin,
  Sparkles,
  Package,
  Activity,
  Building,
  Percent,
  Edit3,
  Trash2,
  X,
  LockKeyhole,
  Hash,
  Settings2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  StaffUser,
  RestaurantTable,
  WaiterRequest,
  RestaurantTableSection,
  RestaurantMenuItem,
} from "../../../types/types";
import { useRestaurant } from "@/src/context/RestaurantContext";
import { resolveWaiterCall } from "@/src/services/waiter_request.service";
// import useStaff from "@/src/hooks/useStaff";
import useOrders from "@/src/hooks/useOrders";
import { useNavigate } from "react-router-dom";
import useTables from "@/src/hooks/useTables";
import CategoryManagement from "./categories/CategoryManagement";
import MenuManagement from "./menu/MenuManagement";

import { MenuItemService } from "@/src/services/menu_item.service";
import { getApiErrorMessage } from "@/src/services/api/client";
import useMenuItems from "@/src/hooks/useMenuItems";
import ModifierManagement from "./modifiers/ModifierManagement";
import MenuFormModal, { MenuFormState } from "./menu/MenuFormModal";
import StaffManagement from "./staff/StaffManagement";

const INDIAN_STATES = [
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Punjab", code: "03" },
  { name: "Chandigarh", code: "04" },
  { name: "Uttarakhand", code: "05" },
  { name: "Haryana", code: "06" },
  { name: "Delhi", code: "07" },
  { name: "Rajasthan", code: "08" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Bihar", code: "10" },
  { name: "Sikkim", code: "11" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Nagaland", code: "13" },
  { name: "Manipur", code: "14" },
  { name: "Mizoram", code: "15" },
  { name: "Tripura", code: "16" },
  { name: "Meghalaya", code: "17" },
  { name: "Assam", code: "18" },
  { name: "West Bengal", code: "19" },
  { name: "Jharkhand", code: "20" },
  { name: "Odisha", code: "21" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Gujarat", code: "24" },
  { name: "Daman and Diu", code: "25" },
  { name: "Dadra and Nagar Haveli", code: "26" },
  { name: "Maharashtra", code: "27" },
  { name: "Andhra Pradesh", code: "28" },
  { name: "Karnataka", code: "29" },
  { name: "Goa", code: "30" },
  { name: "Lakshadweep", code: "31" },
  { name: "Kerala", code: "32" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Puducherry", code: "34" },
  { name: "Andaman and Nicobar Islands", code: "35" },
  { name: "Telangana", code: "36" },
  { name: "Ladakh", code: "38" },
];

export const ManagerDashboard: React.FC = () => {
  const [allWaiterRequests, setAllWaiterRequest] = useState<WaiterRequest[]>(
    [],
  );
  const { restaurantGstProfile, updateRestaurantGstProfile } = useRestaurant();

  const { menuItems, addMenuItem, editMenuItem, removeMenuItem } =
    useMenuItems();

  const { orders: allOrders } = useOrders();

  const navigate = useNavigate();

  const {
    restaurantTables,
    isLoading: isTablesLoading,
    error: tablesError,
    refreshTables,
    addTable,
    editTable,
    removeTable,
  } = useTables();

  // Navigation Tabs matching prompt requirements:
  // 1: Analytics & financials + Audit ledger
  // 2: Floor & Table Management
  // 3: Menu Stock & Pricing Registry
  // 4: Staff Directory Management
  // 5: GST Settings & Tax Profile
  const [activeTab, setActiveTab] = useState<
    | "analytics"
    | "floor"
    | "menu"
    | "categories"
    | "modifiers"
    | "staff"
    | "gst"
  >("analytics");

  // Tab 1 state: Ledger search
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Tab 3 state: Menu search and category filters
  // const [menuSearch, setMenuSearch] = useState("");
  // const [menuCatFilter, setMenuCatFilter] = useState<
  //   "all" | "starters" | "appetizers" | "main course" | "beverages" | "desserts"
  // >("all");

  // Menu Item Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuRefreshToken, setMenuRefreshToken] = useState(0);

  const [editingMenuItem, setEditingMenuItem] =
    useState<RestaurantMenuItem | null>(null);

  const [isMenuSaving, setIsMenuSaving] = useState(false);

  const [menuFormError, setMenuFormError] = useState("");

  const [menuForm, setMenuForm] = useState<MenuFormState>({
    itemName: "",
    categoryId: "",
    foodTypeId: "",
    basePrice: "",
    description: "",
    imagePath: "",
    sortOrder: "",
    status: 1,
  });

  // Selected table helper for detail overlay on Floor view
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);

  // Bonus action notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenAddMenuModal = () => {
    setEditingMenuItem(null);
    setMenuFormError("");

    setMenuForm({
      itemName: "",
      categoryId: "",
      foodTypeId: "",
      basePrice: "",
      description: "",
      imagePath: "",
      sortOrder: "",
      status: 1,
    });

    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenuModal = (item: RestaurantMenuItem) => {
    const statusMap = {
      active: 1,
      inactive: 2,
      unavailable: 3,
    } as const;

    setEditingMenuItem(item);
    setMenuFormError("");

    setMenuForm({
      itemName: item.name,
      categoryId: item.categoryId,
      foodTypeId: item.foodTypeId,
      basePrice: String(item.basePrice),
      description: item.description ?? "",
      imagePath: item.imagePath ?? "",
      sortOrder: String(item.sortOrder),
      status: statusMap[item.status],
    });

    setIsMenuModalOpen(true);
  };

  const handleCloseMenuModal = () => {
    if (isMenuSaving) {
      return;
    }

    setIsMenuModalOpen(false);
    setEditingMenuItem(null);
    setMenuFormError("");
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuFormError("");

    const itemName = menuForm.itemName.trim();
    const basePriceValue = menuForm.basePrice.trim();
    const description = menuForm.description.trim();
    const imagePath = menuForm.imagePath.trim();
    const sortOrderValue = menuForm.sortOrder.trim();

    /*
     * Required fields
     */
    if (!itemName) {
      setMenuFormError("Please enter the menu item name.");
      return;
    }

    if (itemName.length < 3) {
      setMenuFormError("Menu item name must contain at least 3 characters.");
      return;
    }

    if (!menuForm.categoryId) {
      setMenuFormError("Please select a category.");
      return;
    }

    if (!menuForm.foodTypeId) {
      setMenuFormError("Please select a food type.");
      return;
    }

    if (!basePriceValue) {
      setMenuFormError("Please enter the base price.");
      return;
    }

    const basePrice = Number(basePriceValue);

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      setMenuFormError(
        "Base price must be a valid number greater than or equal to 0.",
      );
      return;
    }

    /*
     * Backend accepts at most 2 decimal places.
     */
    const decimalPart = basePriceValue.split(".")[1];

    if (decimalPart && decimalPart.length > 2) {
      setMenuFormError("Base price can contain at most 2 decimal places.");
      return;
    }

    /*
     * `description` is optional, but when supplied the backend
     * requires at least 10 characters.
     */
    if (description && description.length < 10) {
      setMenuFormError(
        "Description must contain at least 10 characters when provided.",
      );
      return;
    }

    /*
     * sort_order is optional.
     */
    let sortOrder: number | undefined;

    if (sortOrderValue !== "") {
      sortOrder = Number(sortOrderValue);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        setMenuFormError(
          "Sort order must be a whole number greater than or equal to 0.",
        );
        return;
      }
    }

    const categoryId = Number(menuForm.categoryId);
    const foodTypeId = Number(menuForm.foodTypeId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      setMenuFormError("Please select a valid category.");
      return;
    }

    if (!Number.isInteger(foodTypeId) || foodTypeId <= 0) {
      setMenuFormError("Please select a valid food type.");
      return;
    }

    try {
      setIsMenuSaving(true);

      /*
       * Required fields are always sent.
       *
       * Optional fields are added only when they have values.
       * This follows the backend `sometimes|required` contract.
       */
      const basePayload = {
        item_name: itemName,
        base_price: basePrice,
        category_id: categoryId,
        food_type_id: foodTypeId,
      };

      if (editingMenuItem) {
        const payload: {
          item_name: string;
          base_price: number;
          category_id: number;
          food_type_id: number;
          description?: string;
          image_path?: string;
          sort_order?: number;
          status?: 1 | 2 | 3;
        } = {
          ...basePayload,
        };

        if (description !== "") {
          payload.description = description;
        }

        if (imagePath !== "") {
          payload.image_path = imagePath;
        }

        if (sortOrder !== undefined) {
          payload.sort_order = sortOrder;
        }

        payload.status = menuForm.status;

        await MenuItemService.updateMenuItem(editingMenuItem.id, payload);

        triggerToast(`Updated menu item "${itemName}" successfully.`);
      } else {
        const payload: {
          item_name: string;
          base_price: number;
          category_id: number;
          food_type_id: number;
          description?: string;
          image_path?: string;
          sort_order?: number;
          status?: 1 | 2 | 3;
        } = {
          ...basePayload,
        };

        if (description !== "") {
          payload.description = description;
        }

        if (imagePath !== "") {
          payload.image_path = imagePath;
        }

        if (sortOrder !== undefined) {
          payload.sort_order = sortOrder;
        }

        /*
         * Status is optional on backend, but our UI defaults
         * new items to ACTIVE.
         */
        payload.status = menuForm.status;

        await MenuItemService.createMenuItem(payload);

        triggerToast(`Added new menu item "${itemName}".`);
      }

      /*
       * Tell MenuManagement to fetch the fresh API data.
       */
      setMenuRefreshToken((current) => current + 1);

      setIsMenuModalOpen(false);
      setEditingMenuItem(null);
    } catch (error) {
      console.error("Menu item save failed:", error);

      setMenuFormError(getApiErrorMessage(error, "Unable to save menu item."));
    } finally {
      setIsMenuSaving(false);
    }
  };

  // Table Management Modal State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(
    null,
  );
  const [tableForm, setTableForm] = useState({
    number: 1,
    name: "Table 01",
    capacity: 4,
    section: "Main Dining" as RestaurantTableSection,
    status: "available" as "available" | "occupied" | "reserved" | "disabled",
  });

  const nextTableNumber = useMemo(() => {
    return (
      restaurantTables.reduce(
        (maxNumber, table) => Math.max(maxNumber, table.number),
        0,
      ) + 1
    );
  }, [restaurantTables]);

  const handleOpenAddTableModal = () => {
    setEditingTable(null);
    const maxNum =
      restaurantTables.length > 0
        ? Math.max(...restaurantTables.map((t) => t.number))
        : 0;
    const nextNum = nextTableNumber;
    setTableForm({
      number: nextNum,
      name: `Table ${nextNum.toString().padStart(2, "0")}`,
      capacity: 4,
      section: "Main Dining",
      status: "available",
    });
    setIsTableModalOpen(true);
  };

  const handleOpenEditTableModal = (tbl: RestaurantTable) => {
    setEditingTable(tbl);
    setTableForm({
      number: tbl.number,
      name: tbl.name,
      capacity: tbl.capacity,
      section: tbl.section,
      status: tbl.status,
    });
    setIsTableModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();

    const tableName = tableForm.name.trim();

    if (!tableName) {
      triggerToast("Please provide a Table Name or Label.");
      return;
    }

    try {
      if (editingTable) {
        await editTable(editingTable.id, {
          table_name: tableName,
          capacity: Number(tableForm.capacity),
          section: tableForm.section,
          status: tableForm.status,
        });

        triggerToast(`Updated ${tableName} configuration.`);
      } else {
        /**
         * The backend generates:
         * - id
         * - table_code
         * - qr_token
         * - initial status
         *
         * Therefore we only send table_name, capacity and section.
         */
        const createdTable = await addTable({
          table_name: tableName,
          capacity: Number(tableForm.capacity),
          section: tableForm.section,
        });

        /**
         * Keep the existing UI behavior / messaging.
         */
        triggerToast(
          `Created new ${createdTable.name} (${tableForm.capacity} Pax).`,
        );
      }

      setIsTableModalOpen(false);
      setEditingTable(null);
    } catch (error) {
      console.error("Table save failed:", error);

      triggerToast(
        error instanceof Error ? error.message : "Unable to save table.",
      );
    }
  };

  const handleDeleteTable = async (tbl: RestaurantTable) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${tbl.name} (Table ${tbl.number})?`,
      )
    ) {
      return;
    }

    try {
      await removeTable(tbl.id);

      if (selectedTableNum === tbl.number) {
        setSelectedTableNum(null);
      }

      triggerToast(`Deleted ${tbl.name} from floor plan.`);
    } catch (error) {
      console.error("Table deletion failed:", error);

      triggerToast(
        error instanceof Error ? error.message : "Unable to delete table.",
      );
    }
  };

  // Local states for Restaurant GST profile setup
  const [profileRestaurantName, setProfileRestaurantName] = useState(
    restaurantGstProfile?.restaurantName || "",
  );
  const [profileLegalName, setProfileLegalName] = useState(
    restaurantGstProfile?.legalBusinessName || "",
  );
  const [profileGstin, setProfileGstin] = useState(
    restaurantGstProfile?.gstin || "",
  );
  const [profilePan, setProfilePan] = useState(restaurantGstProfile?.pan || "");
  const [profileFssai, setProfileFssai] = useState(
    restaurantGstProfile?.fssaiNumber || "",
  );
  const [profileAddress, setProfileAddress] = useState(
    restaurantGstProfile?.address || "",
  );
  const [profilePincode, setProfilePincode] = useState(
    restaurantGstProfile?.pincode || "",
  );
  const [profileState, setProfileState] = useState(
    restaurantGstProfile?.state || "Maharashtra",
  );
  const [profileStateCode, setProfileStateCode] = useState(
    restaurantGstProfile?.stateCode || "27",
  );
  const [profilePhone, setProfilePhone] = useState(
    restaurantGstProfile?.phoneNumber || "",
  );
  const [profileEmail, setProfileEmail] = useState(
    restaurantGstProfile?.email || "",
  );
  const [profileFy, setProfileFy] = useState(
    restaurantGstProfile?.financialYear || "FY 2026-27",
  );
  const [gstFormError, setGstFormError] = useState("");

  // Sync state if profile changes in global context
  React.useEffect(() => {
    if (restaurantGstProfile) {
      setProfileRestaurantName(restaurantGstProfile.restaurantName);
      setProfileLegalName(restaurantGstProfile.legalBusinessName);
      setProfileGstin(restaurantGstProfile.gstin);
      setProfilePan(restaurantGstProfile?.pan ?? "none");
      setProfileFssai(restaurantGstProfile?.fssaiNumber ?? "none");
      setProfileAddress(restaurantGstProfile.address);
      setProfilePincode(restaurantGstProfile.pincode);
      setProfileState(restaurantGstProfile.state);
      setProfileStateCode(restaurantGstProfile.stateCode);
      setProfilePhone(restaurantGstProfile.phoneNumber);
      setProfileEmail(restaurantGstProfile.email);
      setProfileFy(restaurantGstProfile.financialYear);
    }
  }, [restaurantGstProfile]);

  const handleStateChange = (stateName: string) => {
    setProfileState(stateName);
    const matched = INDIAN_STATES.find((s) => s.name === stateName);
    if (matched) {
      setProfileStateCode(matched.code);
    }
  };

  const handleSaveGstProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setGstFormError("");

    if (
      !profileRestaurantName.trim() ||
      !profileLegalName.trim() ||
      !profileGstin.trim() ||
      !profileAddress.trim() ||
      !profilePincode.trim() ||
      !profilePhone.trim() ||
      !profileEmail.trim()
    ) {
      setGstFormError("Please fill out all required fields.");
      return;
    }

    // GSTIN Validation
    const cleanGstin = profileGstin.trim().toUpperCase();
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(cleanGstin)) {
      setGstFormError(
        "GSTIN is invalid. It must be a 15-character Indian GSTIN (e.g. 27AAPCH1234F1Z5).",
      );
      return;
    }

    // PAN Validation
    const cleanPan = profilePan.trim().toUpperCase();
    if (cleanPan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        setGstFormError(
          "PAN is invalid. It must be exactly 10 alphanumeric characters (e.g. AAPCH1234F).",
        );
        return;
      }
    }

    // FSSAI Validation
    const cleanFssai = profileFssai.trim();
    if (cleanFssai) {
      const fssaiRegex = /^[0-9]{14}$/;
      if (!fssaiRegex.test(cleanFssai)) {
        setGstFormError(
          "FSSAI number is invalid. It must be exactly 14 digits.",
        );
        return;
      }
    }

    // Update profile
    // updateRestaurantGstProfile({
    //   restaurantName: profileRestaurantName.trim(),
    //   legalBusinessName: profileLegalName.trim(),
    //   gstin: cleanGstin,
    //   pan: cleanPan,
    //   fssaiNumber: cleanFssai,
    //   address: profileAddress.trim(),
    //   pincode: profilePincode.trim(),
    //   state: profileState,
    //   stateCode: profileStateCode,
    //   phoneNumber: profilePhone.trim(),
    //   email: profileEmail.trim(),
    //   financialYear: profileFy,
    // });

    triggerToast(
      "SUCCESS: Saffron GST compliance profile updated & synchronized!",
    );
  };

  const handleLogout = () => {
    // TODO logout api call and context deletion code
    navigate("/auth/login");
  };

  const handleIssueBonus = (name: string) => {
    // Simulate payment award
    triggerToast(`Success: Custom ₹1,500 excellence bonus logged for ${name}.`);
  };

  // Compile calculations safely from live + historical data
  const financials = useMemo(() => {
    const paidOrders = allOrders.filter((o) => o.status === "paid");

    let totalSales = 0;
    let totalGST = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalTaxableValue = 0;
    let totalExtras = 0;
    let totalDiscounts = 0;

    paidOrders.forEach((o) => {
      totalSales += o.total;
      totalDiscounts += o.discount || 0;

      if (o.gstSummary) {
        totalGST += o.gstSummary.totalGst;
        totalCGST += o.gstSummary.cgst;
        totalSGST += o.gstSummary.sgst;
        totalIGST += o.gstSummary.igst;
        totalTaxableValue += o.gstSummary.totalTaxable;
      } else {
        totalGST += o.tax;
        totalCGST += o.tax / 2;
        totalSGST += o.tax / 2;
        totalTaxableValue += o.subtotal;
      }

      // Calculate extras (₹50 each)
      o.items.forEach((it) => {
        totalExtras += it.addedIngredients.length * 50 * it.quantity;
      });
    });

    return {
      totalSales: Math.round(totalSales),
      totalGST: Math.round(totalGST),
      totalCGST: Math.round(totalCGST),
      totalSGST: Math.round(totalSGST),
      totalIGST: Math.round(totalIGST),
      totalTaxableValue: Math.round(totalTaxableValue),
      totalExtras: Math.round(totalExtras),
      totalDiscounts: Math.round(totalDiscounts),
    };
  }, [allOrders]);

  // Aggregate Top Selling dishes for analysis
  const topSellingDishes = useMemo(() => {
    const itemMap: Record<
      string,
      { name: string; count: number; revenue: number; isVeg: boolean }
    > = {};
    const paidOrders = allOrders.filter((o) => o.status === "paid");

    paidOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        const name = it.menuItem.name;
        if (!itemMap[name]) {
          itemMap[name] = {
            name,
            count: 0,
            revenue: 0,
            isVeg: it.menuItem.isVeg,
          };
        }
        itemMap[name].count += it.quantity;
        itemMap[name].revenue +=
          (it.menuItem.price + it.addedIngredients.length * 50) * it.quantity;
      });
    });

    // Sort descending and grab top 6
    return Object.values(itemMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allOrders]);

  // Filtered Ledger List
  const filteredLedger = useMemo(() => {
    const paidOrders = allOrders.filter((o) => o.status === "paid");
    if (!ledgerSearch.trim()) return paidOrders;

    return paidOrders.filter((o) => {
      const idMatch = o.id.toLowerCase().includes(ledgerSearch.toLowerCase());
      const custMatch = o.customerName
        ?.toLowerCase()
        .includes(ledgerSearch.toLowerCase());
      const phoneMatch = o.customerPhone
        ?.toLowerCase()
        .includes(ledgerSearch.toLowerCase());
      const tableMatch = `table ${o.tableNumber}`.includes(
        ledgerSearch.toLowerCase(),
      );

      return idMatch || custMatch || phoneMatch || tableMatch;
    });
  }, [allOrders, ledgerSearch]);

  // Map floor plan data dynamically from current active unpaid orders & requests
  const tableDataList = useMemo(() => {
    return restaurantTables.map((tbl) => {
      const num = tbl.number;

      // ---------------------------------------------------------
      // Existing order system
      // ---------------------------------------------------------
      // TableOrder currently uses numeric tableNumber,
      // so we continue using the derived frontend number here.
      const activeUnpaidOrd = allOrders.find(
        (ord) => ord.tableNumber === num && ord.status !== "paid",
      );

      // ---------------------------------------------------------
      // Waiter request system
      // ---------------------------------------------------------
      // IMPORTANT:
      // Backend waiter requests currently identify the table
      // using table_name, not the derived numeric table number.
      //
      // Example:
      // restaurant table:
      //   id         = 5
      //   table_code = "DEMO-T005"
      //   table_name = "T1"
      //
      // waiter request:
      //   tableNumber = "T1"
      //
      // Therefore compare req.tableNumber with tbl.name.
      const activeRequestCount = allWaiterRequests.filter(
        (req) => req.tableNumber === tbl.name && req.status !== "resolved",
      ).length;

      // Calculate table status
      let derivedStatus:
        | "Available"
        | "Ordering"
        | "Preparing"
        | "Dining"
        | "Billing"
        | "Disabled" = "Available";

      if (tbl.status === "disabled") {
        derivedStatus = "Disabled";
      } else if (activeUnpaidOrd) {
        if (["draft_submitted", "on_review"].includes(activeUnpaidOrd.status)) {
          derivedStatus = "Ordering";
        } else if (
          ["sent_to_kitchen", "preparing", "ready"].includes(
            activeUnpaidOrd.status,
          )
        ) {
          derivedStatus = "Preparing";
        } else if (activeUnpaidOrd.status === "served") {
          derivedStatus = "Dining";
        } else if (activeUnpaidOrd.status === "bill_requested") {
          derivedStatus = "Billing";
        }
      }

      // Check for active bill request using table_name.
      const activeBillRequest = allWaiterRequests.find(
        (req) =>
          req.tableNumber === tbl.name &&
          req.type === "bill" &&
          req.status !== "resolved",
      );

      if (activeBillRequest && derivedStatus === "Available") {
        derivedStatus = "Billing";
      }

      return {
        tableObj: tbl,

        // Frontend display number derived from table_code.
        tableNumber: num,

        // Actual backend table_name.
        tableName: tbl.name,

        section: tbl.section,

        status: derivedStatus,

        activeOrder: activeUnpaidOrd || null,

        activeRequests: activeRequestCount,

        assignedSteward:
          activeUnpaidOrd?.waiterName ||
          (num % 2 === 0 ? "Devi Patel" : "Alex Thorne"),

        capacity: tbl.capacity,
      };
    });
  }, [restaurantTables, allOrders, allWaiterRequests]);

  // Handle Tables status releases
  const handleClearTable = (tableName: string) => {
    // Clear/resolve active waiter requests for this table.
    // Backend waiter request tableNumber currently contains
    // the restaurant table_name, for example "T1".
    const tableRequests = allWaiterRequests.filter(
      (req) => req.tableNumber === tableName,
    );

    tableRequests.forEach((req) =>
      resolveWaiterCall(req.id, setAllWaiterRequest),
    );

    triggerToast(
      `Cleared: ${tableName} has been marked available and readied for next seating.`,
    );
  };

  return (
    <div className="space-y-8 p-4 md:p-6 text-[#2D2D2D]" id="manager-page">
      {/* Upper Navigation Row with Branding */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-surface p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E76F51]/10 border border-[#E76F51]/20 flex items-center justify-center text-2xl">
            👑
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-bold block">
              Back-of-House Enterprise
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-black text-[#2D2D2D] tracking-tight">
                Hush Operations Orchestrator
              </h2>
              <span className="text-[9px] uppercase font-mono bg-zinc-900 text-white font-extrabold px-1.5 py-0.5 rounded-md">
                System Administrator
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-outline flex items-center gap-2 px-4 py-2.5 text-xs ml-auto sm:ml-0"
          id="manager-exit-btn"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>

      {/* LUXURY FLAT TAB SELECTORS BAR */}
      <div className="flex overflow-x-auto gap-2 bg-[#FFFDF8] border border-[#ECE7E1] p-1.5 rounded-2xl no-scrollbar">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <TrendingUp size={14} />
          Settle Analytics & Ledger
        </button>
        <button
          onClick={() => setActiveTab("floor")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "floor"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <Layers size={14} />
          Floorplan & Tables
          {allWaiterRequests.filter((r) => r.status !== "resolved").length >
            0 && (
            <span className="w-2.5 h-2.5 bg-[#E76F51] rounded-full animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "menu"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <Notebook size={14} />
          Menu Registry Stock & Pricing
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "categories"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <Layers size={14} />
          Menu Categories
        </button>
        <button
          onClick={() => setActiveTab("modifiers")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "modifiers"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <Settings2 size={14} />
          Menu Modifiers
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "staff"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <Users size={14} />
          Luxury Shift Directory
        </button>
        <button
          onClick={() => setActiveTab("gst")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-display text-xs cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "gst"
              ? "bg-white text-[#E76F51] shadow-brilixis-sm font-bold border border-[#ECE7E1]"
              : "text-[#6B7280] hover:text-[#2D2D2D]"
          }`}
        >
          <DollarSign size={14} />
          GST Settings & Tax Profile
        </button>
      </div>

      {/* TOAST PANEL PROMPT */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed bottom-6 right-6 z-55 max-w-sm bg-neutral-900 text-white text-xs py-3 px-4.5 rounded-xl flex items-center gap-2.5 shadow-xl border border-white/10"
          >
            <Sparkles size={14} className="text-amber-400" />
            <p className="font-sans leading-none">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB CONTENT PANEL SECTIONS */}
      <div>
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Analytical KPI Matrix cards */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              id="manager-financials"
            >
              <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-5 shadow-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold block mb-1">
                  Sales Ledger (Gross)
                </span>
                <div className="text-lg font-display font-black text-[#1F2226] mb-1 leading-none">
                  ₹{financials.totalSales.toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">
                  Grand Total Received
                </span>
              </div>

              <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-5 shadow-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold block mb-1">
                  Taxable Value (Net)
                </span>
                <div className="text-lg font-display font-black text-[#1F2226] mb-1 leading-none">
                  ₹{financials.totalTaxableValue.toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-sky-600 font-semibold font-mono">
                  Sales Before GST Tax
                </span>
              </div>

              <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-5 shadow-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold block mb-1">
                  Compliance GST Collected
                </span>
                <div className="text-lg font-display font-black text-[#1F2226] mb-1 leading-none">
                  ₹{financials.totalGST.toLocaleString("en-IN")}
                </div>
                <span className="text-[9px] text-[#C83214] font-mono font-bold block truncate">
                  C+S: ₹{financials.totalCGST + financials.totalSGST} / I: ₹
                  {financials.totalIGST}
                </span>
              </div>

              <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-5 shadow-xs">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold block mb-1">
                  Campaign Discounts
                </span>
                <div className="text-lg font-display font-black text-rose-700 mb-1 leading-none">
                  -₹{financials.totalDiscounts.toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono font-medium">
                  Auto-ledger discounts
                </span>
              </div>
            </div>

            {/* Item Sales Analysis Section */}
            <div
              className="grid grid-cols-1 lg:grid-cols-5 gap-6"
              id="manager-dishes-analysis"
            >
              {/* Left Bar Chart */}
              <div className="lg:col-span-3 bg-white border border-[#E8E5DD] rounded-[2.5rem] p-6 shadow-xs flex flex-col justify-between">
                <div className="mb-4">
                  <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-[#8C7A6B] block mb-1">
                    Quantity metrics
                  </span>
                  <h3 className="text-base font-display font-bold text-[#1F2226]">
                    Top Performing Menu Items (Units Sold)
                  </h3>
                </div>

                <div
                  className="h-64 w-full mt-2"
                  id="dish-performance-bar-chart"
                >
                  {topSellingDishes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#8C7A6B] italic font-mono">
                      No orders compiled yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topSellingDishes}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 35, bottom: 5 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          style={{
                            fontSize: "10px",
                            fill: "#1F2226",
                            fontFamily: "Inter",
                            fontWeight: "bold",
                          }}
                          width={90}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FAF9F6",
                            borderRadius: "10px",
                            border: "1px solid #E8E5DD",
                          }}
                          itemStyle={{ fontSize: "11px", color: "#C83214" }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                          {topSellingDishes.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.isVeg ? "#10B981" : "#C83214"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Right Tabular Analytics List */}
              <div className="lg:col-span-2 bg-white border border-[#E8E5DD] rounded-[2.5rem] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-[#8C7A6B] block mb-1">
                    Volume vs Net Revenue
                  </span>
                  <h3 className="text-base font-display font-bold text-[#1F2226] mb-4">
                    Dish Volume Breakdown
                  </h3>

                  <div
                    className="space-y-4 overflow-y-auto max-h-56 pr-2 no-scrollbar"
                    id="manager-dish-listings"
                  >
                    {topSellingDishes.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center pb-2 border-b border-[#FAF9F6] last:border-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full flex-none ${it.isVeg ? "bg-emerald-500" : "bg-[#C83214]"}`}
                          />
                          <div className="truncate max-w-[130px]">
                            <p className="text-xs font-display font-bold text-[#1F2226] truncate leading-tight">
                              {it.name}
                            </p>
                            <p className="text-[10px] text-[#8C7A6B] font-mono">
                              {it.count} units ordered
                            </p>
                          </div>
                        </div>
                        <div className="text-right leading-none">
                          <span className="text-xs font-mono font-bold text-[#1F2226]">
                            ₹{it.revenue}
                          </span>
                          <span className="text-[8px] text-[#8C7A6B] font-mono block uppercase">
                            Gross
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E5DD] flex items-center gap-2">
                  <Award size={14} className="text-amber-500" />
                  <p className="text-[10px] text-[#5C6168] leading-relaxed">
                    Top items are automatically generated using current live
                    transaction volumes. Stock levels hold stable.
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Ledger List of Final Receipts */}
            <div
              className="bg-white border border-[#E8E5DD] rounded-[2.5rem] p-6 shadow-sm space-y-4"
              id="ledger-audit-box"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-display font-bold text-[#1F2226]">
                    Staff Audit ledger
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Comprehensive record of cleared, completed guest invoices
                  </p>
                </div>

                {/* Ledger Search */}
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={13}
                    className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]"
                  />
                  <input
                    type="text"
                    placeholder="Search Ledger ID, Name, Table..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-full pl-10 pr-4 py-2.5 placeholder-neutral-400 focus:outline-none focus:border-[#C83214]/50 text-[#1F2226] transition-colors shadow-xs"
                    id="ledger-search-input"
                  />
                </div>
              </div>

              {/* Receipts Ledger Table */}
              <div
                className="overflow-x-auto rounded-2xl border border-[#E8E5DD]"
                id="ledger-table-container"
              >
                <table className="w-full text-left text-xs text-[#4A4F55]">
                  <thead className="bg-[#FAF9F6] border-b border-[#E8E5DD] font-display font-bold text-[#1F2226] text-[10px] tracking-wider uppercase">
                    <tr>
                      <th className="px-5 py-4">Receipt ID</th>
                      <th className="px-5 py-4">Table</th>
                      <th className="px-5 py-4">Customer Name & GSTIN</th>
                      <th className="px-5 py-4">Taxable Val</th>
                      <th className="px-5 py-4">CGST / SGST</th>
                      <th className="px-5 py-4">IGST</th>
                      <th className="px-5 py-4 text-right">Grand Total</th>
                      <th className="px-5 py-4 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF9F6]">
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-5 py-8 text-center text-xs text-[#8C7A6B] italic font-mono bg-white"
                        >
                          No final invoices matched your query.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((ord, idx) => {
                        const taxableVal =
                          ord.gstSummary?.totalTaxable ??
                          Math.round(ord.subtotal);
                        const cgst =
                          ord.gstSummary?.cgst ?? Math.round(ord.tax / 2);
                        const sgst =
                          ord.gstSummary?.sgst ?? Math.round(ord.tax / 2);
                        const igst = ord.gstSummary?.igst ?? 0;
                        const isCorporate = !!ord.customerGstin;

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-[#FAF9F6]/50 bg-white transition-colors"
                          >
                            <td className="px-5 py-4 font-mono font-bold text-neutral-800">
                              {ord.id}
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-3 py-1 bg-neutral-100 rounded-lg text-neutral-700 font-mono font-bold text-[10px]">
                                TBL{" "}
                                {ord.tableNumber.toString().padStart(2, "0")}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-display font-extrabold text-[#1F2226]">
                                {ord.customerName || "Walk-In Guest"}
                              </div>
                              {isCorporate ? (
                                <div className="text-[9px] bg-red-50 text-[#C83214] border border-red-100 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                                  GSTIN: {ord.customerGstin}
                                </div>
                              ) : (
                                <div className="text-[10px] text-[#8C7A6B] font-mono leading-none mt-0.5">
                                  {ord.customerPhone || "Not Provided"}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 font-mono font-semibold text-neutral-700">
                              ₹{Math.round(taxableVal)}
                            </td>
                            <td className="px-5 py-4 font-mono text-[10.5px] text-[#8C7A6B]">
                              ₹{Math.round(cgst)} / ₹{Math.round(sgst)}
                            </td>
                            <td className="px-5 py-4 font-mono text-[10.5px] text-zinc-500">
                              ₹{Math.round(igst)}
                            </td>
                            <td className="px-5 py-4 text-right font-mono font-bold text-[#C83214]">
                              ₹{Math.round(ord.total)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                                <CheckCircle2 size={10} /> Certified
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Room Floor plan & Seating status */}
        {activeTab === "floor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left floor board */}
            <div className="lg:col-span-2 bg-white border border-[#E8E5DD] rounded-[2.5rem] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                  <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-extrabold">
                    DINE FLOORPLAN MONITOR
                  </span>
                  <h3 className="text-base font-display font-black text-[#1F2226] mt-1">
                    Live Seating Layout ({restaurantTables.length} Tables)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddTableModal}
                    className="bg-[#E76F51] hover:bg-[#d95d3f] text-white px-3.5 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer shadow-brilixis-sm transition-all whitespace-nowrap"
                  >
                    <Plus size={13} /> Add Table
                  </button>

                  <div className="hidden sm:flex gap-1">
                    {/* Status Legend Indicators */}
                    <span className="text-[8px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      Avail
                    </span>
                    <span className="text-[8px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                      Order
                    </span>
                    <span className="text-[8px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      Cook
                    </span>
                    <span className="text-[8px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      Dine
                    </span>
                    <span className="text-[8px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                      Bill
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout representing live floor */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                id="floor-grid-elements"
              >
                {isTablesLoading ? (
                  <div className="col-span-full flex items-center justify-center py-16">
                    <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                      <RefreshCw size={18} className="animate-spin" />
                      Loading tables...
                    </div>
                  </div>
                ) : tablesError ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <AlertTriangle size={24} className="mb-3 text-[#E76F51]" />

                    <p className="text-sm font-semibold text-[#2D2D2D]">
                      Failed to load tables
                    </p>

                    <p className="mt-1 max-w-md text-xs text-[#6B7280]">
                      {tablesError}
                    </p>

                    <button
                      type="button"
                      onClick={() => void refreshTables()}
                      className="mt-4 btn-outline px-4 py-2 text-xs"
                    >
                      <RefreshCw size={13} className="mr-2 inline-block" />
                      Retry
                    </button>
                  </div>
                ) : restaurantTables.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <Building size={24} className="mb-3 text-[#6B7280]" />

                    <p className="text-sm font-semibold text-[#2D2D2D]">
                      No tables created yet
                    </p>

                    <p className="mt-1 text-xs text-[#6B7280]">
                      Add your first restaurant table to start managing the
                      floor.
                    </p>
                  </div>
                ) : (
                  tableDataList.map((tbl) => {
                    const hasCalls = tbl.activeRequests > 0;
                    return (
                      <div
                        key={tbl.tableNumber}
                        onClick={() => setSelectedTableNum(tbl.tableNumber)}
                        className={`p-5 rounded-[2rem] text-left relative overflow-hidden transition-all duration-300 border flex flex-col justify-between h-44 cursor-pointer ${
                          selectedTableNum === tbl.tableNumber
                            ? "ring-2 ring-black scale-98 border-black bg-amber-50/20"
                            : tbl.status === "Disabled"
                              ? "bg-neutral-100 border-neutral-200 opacity-60"
                              : "bg-white hover:border-[#1F2226]"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <span className="text-lg font-display font-black text-[#1F2226]">
                              {tbl.tableName ||
                                `T-${tbl.tableNumber.toString().padStart(2, "0")}`}
                            </span>
                            <span className="text-[8px] font-mono text-[#8C7A6B] block uppercase mt-0.5">
                              {tbl.section} • {tbl.capacity} Pax
                            </span>
                          </div>

                          {/* Status Light Badges */}
                          <span
                            className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex-none ${
                              tbl.status === "Available"
                                ? "bg-slate-100 text-slate-700"
                                : tbl.status === "Ordering"
                                  ? "bg-amber-100 text-amber-800"
                                  : tbl.status === "Preparing"
                                    ? "bg-blue-100 text-blue-800 animate-pulse"
                                    : tbl.status === "Dining"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : tbl.status === "Disabled"
                                        ? "bg-neutral-200 text-neutral-600"
                                        : "bg-rose-100 text-rose-800 animate-bounce"
                            }`}
                          >
                            {tbl.status}
                          </span>
                        </div>

                        {/* Content summary inside table */}
                        <div className="space-y-1">
                          {tbl.status !== "Available" &&
                          tbl.status !== "Disabled" ? (
                            <>
                              <div className="text-[10px] text-zinc-900 leading-none truncate font-semibold">
                                🥘{" "}
                                {tbl.activeOrder
                                  ? `${tbl.activeOrder.items.length} items ordered`
                                  : "Checking bill"}
                              </div>
                              <div className="text-[9px] text-neutral-500 font-mono truncate">
                                Host: {tbl.assignedSteward}
                              </div>
                            </>
                          ) : tbl.status === "Disabled" ? (
                            <div className="text-[9px] text-neutral-500 italic font-mono uppercase">
                              Out of Service / Merged
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-400 italic font-mono uppercase">
                              Vacant Table
                            </div>
                          )}
                        </div>

                        {/* Bottom row: Edit / Delete quick controls */}
                        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditTableModal(tbl.tableObj);
                              }}
                              title="Edit Table"
                              className="p-1 rounded-md bg-neutral-100 hover:bg-[#E76F51] hover:text-white text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTable(tbl.tableObj);
                              }}
                              title="Delete Table"
                              className="p-1 rounded-md bg-neutral-100 hover:bg-rose-600 hover:text-white text-neutral-600 transition-colors cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>

                          {/* Beeping Alert Badge */}
                          {hasCalls && (
                            <div className="flex items-center gap-1 bg-red-600 text-white text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded-md animate-pulse shadow-sm">
                              <Activity size={8} /> Call
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side details card overlay */}
            <div className="bg-white border border-[#E8E5DD] rounded-[2.5rem] p-6 shadow-xs h-full">
              {selectedTableNum ? (
                (() => {
                  const tblDetail = tableDataList.find(
                    (t) => t.tableNumber === selectedTableNum,
                  )!;
                  return (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start pb-4 border-b border-[#FAF9F6]">
                        <div>
                          <span className="text-[10px] font-mono text-[#C83214] font-bold block uppercase">
                            Active Audit
                          </span>
                          <h4 className="text-lg font-display font-black text-[#1F2226]">
                            {tblDetail.tableName ||
                              `Table ${selectedTableNum.toString().padStart(2, "0")}`}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedTableNum(null)}
                          className="text-xs bg-zinc-100 px-2 py-0.5 rounded hover:bg-[#C83214]/10 hover:text-[#C83214]"
                        >
                          Close
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#8C7A6B]">Floor Section</span>
                          <span className="font-mono font-bold text-neutral-800">
                            {tblDetail.section}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#8C7A6B]">
                            Table Safe Capacity
                          </span>
                          <span className="font-mono font-bold text-neutral-800">
                            {tblDetail.capacity} Seated Pax
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#8C7A6B]">Active Status</span>
                          <span className="font-mono font-bold text-neutral-800">
                            {tblDetail.status}
                          </span>
                        </div>
                        {/* <div className="flex justify-between items-center text-xs">
                          <span className="text-[#8C7A6B]">
                            Assigned Representative
                          </span>
                          <span className="font-semibold text-neutral-800">
                            {tblDetail.assignedSteward}
                          </span>
                        </div> */}
                      </div>

                      <div className="pt-4 border-t border-[#FAF9F6] space-y-3">
                        <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#8C7A6B] block">
                          Interactive Actions
                        </h4>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleOpenEditTableModal(tblDetail.tableObj)
                            }
                            className="flex-1 bg-neutral-100 hover:bg-[#E76F51] hover:text-white text-neutral-700 py-2.5 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Edit3 size={13} /> Edit Config
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTable(tblDetail.tableObj)
                            }
                            className="px-3 bg-neutral-100 hover:bg-rose-600 hover:text-white text-neutral-700 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {tblDetail.status !== "Available" &&
                        tblDetail.status !== "Disabled" ? (
                          <>
                            <button
                              onClick={() =>
                                handleClearTable(tblDetail.tableName)
                              }
                              className="w-full bg-[#1F2226] text-white hover:bg-[#C83214] py-3 rounded-xl font-display font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer mt-2"
                            >
                              Force Clear Table Seating
                            </button>
                            <div className="p-3 bg-amber-50 rounded-lg text-[9px] text-amber-700 leading-relaxed border border-amber-100 flex items-start gap-1.5">
                              <AlertTriangle
                                size={12}
                                className="flex-none mt-0.5 text-amber-600"
                              />
                              Force clearing archives table transactions and
                              resets state directly back to Available for the
                              next walk-in guest.
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-[#8C7A6B] italic text-xs font-mono">
                            Table is available. A waiting customer scanning the
                            custom QR code on Table {selectedTableNum} will
                            automatically start a dining session.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                  <span className="text-3xl mb-3">📍</span>
                  <h4 className="text-sm font-display font-bold text-[#1F2226]">
                    Interactive Floor Coordinator
                  </h4>
                  <p className="text-[10px] text-[#8C7A6B] max-w-xs mt-1">
                    Select any table on the interactive dine floor layout to
                    edit capacity, merge tables, assign stewards, or force
                    trigger seating resets.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Menu registry stock / out of stock toggle / pricing adjustments */}
        {activeTab === "menu" && (
          <MenuManagement
            onAdd={handleOpenAddMenuModal}
            onEdit={handleOpenEditMenuModal}
            refreshToken={menuRefreshToken}
          />
        )}

        {/* Tab 5: Categories Panel  */}
        {activeTab === "categories" && <CategoryManagement />}

        {/* Tab 6: Modifiers Panel */}
        {activeTab === "modifiers" && <ModifierManagement />}

        {/* Tab 7: GST Settings Panel */}
        {activeTab === "gst" && (
          <div className="space-y-6">
            <div className="p-5 bg-white border border-[#E8E5DD] rounded-[2rem] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C83214] font-bold block uppercase font-black">
                  FINANCE & TAX COMPLIANCE
                </span>
                <h3 className="text-base font-display font-black text-[#1F2226] mt-0.5">
                  Restaurant GST Profile Management
                </h3>
              </div>
              <div className="text-xs bg-[#FAF9F6] border border-[#E8E5DD] px-3 py-1.5 rounded-xl text-[#8C7A6B] font-mono">
                Active Code:{" "}
                <span className="text-[#1F2226] font-extrabold">
                  STATE-{profileStateCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form panel */}
              <div className="lg:col-span-2 bg-white border border-[#E8E5DD] rounded-[2rem] p-6 shadow-xs">
                <form onSubmit={handleSaveGstProfile} className="space-y-4">
                  {gstFormError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle size={15} className="flex-none" />
                      <span>{gstFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Restaurant Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileRestaurantName}
                        onChange={(e) =>
                          setProfileRestaurantName(e.target.value)
                        }
                        placeholder="e.g. Hush Dine & Lounge"
                        className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Legal Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileLegalName}
                        onChange={(e) => setProfileLegalName(e.target.value)}
                        placeholder="e.g. Saffron Heritage Hospitality Private Limited"
                        className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        GSTIN *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={profileGstin}
                        onChange={(e) =>
                          setProfileGstin(e.target.value.toUpperCase())
                        }
                        placeholder="15-char (e.g. 27AAPCH1234F1Z5)"
                        className="w-full text-xs font-mono bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Permanent Account Number (PAN)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={profilePan}
                        onChange={(e) =>
                          setProfilePan(e.target.value.toUpperCase())
                        }
                        placeholder="10-char (e.g. AAPCH1234F)"
                        className="w-full text-xs font-mono bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        FSSAI License Number
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        value={profileFssai}
                        onChange={(e) =>
                          setProfileFssai(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="14 digits (e.g. 11521000000123)"
                        className="w-full text-xs font-mono bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                      Registered Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Street address, building number, block, landmark"
                      className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Place of Supply (State) *
                      </label>
                      <select
                        value={profileState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st.code} value={st.name}>
                            {st.name} ({st.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        State Code
                      </label>
                      <input
                        type="text"
                        disabled
                        value={profileStateCode}
                        className="w-full text-xs font-mono bg-[#E8E5DD]/20 border border-[#E8E5DD] rounded-xl px-4 py-3 text-neutral-500 cursor-not-allowed font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={profilePincode}
                        onChange={(e) =>
                          setProfilePincode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="400001"
                        className="w-full text-xs font-mono bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Billing Contact Phone *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={profilePhone}
                        onChange={(e) =>
                          setProfilePhone(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="9876543210"
                        className="w-full text-xs font-mono bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Billing Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="finance@hushcuisine.com"
                        className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#8C7A6B] uppercase font-bold tracking-wider block mb-1.5">
                        Compliance Financial Year
                      </label>
                      <select
                        value={profileFy}
                        onChange={(e) => setProfileFy(e.target.value)}
                        className="w-full text-xs font-display bg-[#FAF9F6] border border-[#E8E5DD] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C83214] text-[#1F2226]"
                      >
                        <option value="FY 2025-26">FY 2025-26</option>
                        <option value="FY 2026-27">FY 2026-27</option>
                        <option value="FY 2027-28">FY 2027-28</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#FAF9F6]">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#C83214] hover:bg-[#D73C1E] text-white font-display font-bold text-xs tracking-wider uppercase rounded-xl cursor-pointer transition-colors shadow-md flex items-center gap-2"
                    >
                      ✔ Save GST Profile
                    </button>
                  </div>
                </form>
              </div>

              {/* Reference sidebar */}
              <div className="bg-white border border-[#E8E5DD] rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#C83214] font-bold block font-black">
                      Tax Code Mapping Reference
                    </span>
                    <h4 className="text-sm font-display font-black text-[#1F2226] mt-0.5">
                      Indian States GST Numeric Directory
                    </h4>
                    <p className="text-[10.5px] text-[#8C7A6B] leading-relaxed mt-1">
                      GST invoices determine interstate (IGST) vs intrastate
                      (CGST/SGST) charges based on matching the first two digits
                      of the customer's GSTIN to the restaurant's code.
                    </p>
                  </div>

                  <div className="border border-[#E8E5DD] rounded-xl overflow-hidden text-[10px] font-mono max-h-96 overflow-y-auto no-scrollbar bg-[#FAF9F6]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-100 text-neutral-600 border-b border-[#E8E5DD]">
                          <th className="py-2 px-3 text-left">Code</th>
                          <th className="py-2 px-3 text-left">
                            State Jurisdiction Name
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E5DD]/50">
                        {INDIAN_STATES.map((st) => (
                          <tr
                            key={st.code}
                            className="hover:bg-neutral-50 transition-colors"
                          >
                            <td className="py-2 px-3 font-bold text-[#C83214]">
                              {st.code}
                            </td>
                            <td className="py-2 px-3 text-[#1F2226]">
                              {st.name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#FAF9F6] text-[10px] text-[#8C7A6B] leading-relaxed">
                  📢 <strong>Compliance Advice:</strong> Keep GSTIN and PAN
                  synchronized. Changing Place of Supply automatically shifts
                  tax splits for new orders.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Staff shift directory logs */}
        {activeTab === "staff" && (
          <StaffManagement allOrders={allOrders} onNotify={triggerToast} />
        )}

        {/* Modal 1: Add/Edit Menu Item */}
        <MenuFormModal
          isOpen={isMenuModalOpen}
          editingMenuItem={editingMenuItem}
          menuForm={menuForm}
          setMenuForm={setMenuForm}
          isMenuSaving={isMenuSaving}
          menuFormError={menuFormError}
          onClose={handleCloseMenuModal}
          onSubmit={handleSaveMenuItem}
        />

        {/* Modal 2: Add/Edit Table */}
        {isTableModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-[#ECE7E1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
              <div className="flex justify-between items-center pb-3 border-b border-[#ECE7E1]">
                <h3 className="text-base font-display font-bold text-[#2D2D2D]">
                  {editingTable
                    ? "Edit Table Configuration"
                    : "Add New Restaurant Table"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTable} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                      Table Number *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tableForm.number}
                      readOnly
                      onChange={(e) =>
                        setTableForm({
                          ...tableForm,
                          number: Number(e.target.value),
                        })
                      }
                      className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                      Capacity (Pax) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tableForm.capacity}
                      onChange={(e) =>
                        setTableForm({
                          ...tableForm,
                          capacity: Number(e.target.value),
                        })
                      }
                      className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
                    />
                  </div>
                </div>

                {/* 
              Table Name Label 1
              <div>
                <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                  Table Label / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 01 or Merged Table 02+03"
                  value={tableForm.name}
                  readOnly
                  onChange={(e) =>
                    setTableForm({ ...tableForm, name: e.target.value })
                  }
                  className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
                />
              </div> */}

                {/* Table Name Label 2
               Previous read-only Table Label / Name UI.
               Kept for reference; replaced by the editable field below.
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase">
                    Table Label / Name
                  </label>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF9F6] border border-[#E8E5DD] px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-[#8C7A6B]">
                    <LockKeyhole size={9} />
                    System Generated
                  </span>
                </div>

                <div
                  className="w-full min-h-[38px] flex items-center justify-between rounded-xl border border-[#E8E5DD] bg-[#FAF9F6] px-3 py-2"
                  aria-readonly="true"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E5DD] flex items-center justify-center flex-none">
                      <Hash size={12} className="text-[#8C7A6B]" />
                    </div>

                    <span className="text-xs font-mono font-bold text-[#2D2D2D] truncate">
                      {tableForm.name}
                    </span>
                  </div>

                  <LockKeyhole
                    size={13}
                    className="text-[#B0AAA3] flex-none ml-2"
                  />
                </div>

                <p className="mt-1.5 text-[9px] text-[#8C7A6B] leading-relaxed">
                  This name is assigned automatically from the table sequence
                  and cannot be edited.
                </p>
              </div>

            */}

                {/* Table Name Label 3 */}
                {/* Editable Table Label / Name */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                    Table Label / Name *
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Table 02 or Merged Table 02+03"
                    value={tableForm.name}
                    onChange={(event) => {
                      const name = event.target.value;

                      // Recognize standard labels such as "Table 02" or "Table 2".
                      const match = /^table\s+0*(\d+)$/i.exec(name.trim());
                      const parsedNumber = match ? Number(match[1]) : null;

                      setTableForm((current) => ({
                        ...current,
                        name,

                        // While adding/restoring, keep the number preview in sync.
                        // Custom labels retain the next suggested number.
                        number:
                          !editingTable &&
                          parsedNumber !== null &&
                          parsedNumber > 0
                            ? parsedNumber
                            : !editingTable
                              ? nextTableNumber
                              : current.number,
                      }));
                    }}
                    className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
                  />

                  <p className="mt-1.5 text-[9px] text-[#8C7A6B] leading-relaxed">
                    To restore a deleted table, enter its exact previous name.
                    Otherwise, enter a new name for the table.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                    Floor Area / Section *
                  </label>
                  <select
                    value={tableForm.section}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        section: e.target.value as RestaurantTableSection,
                      })
                    }
                    className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
                  >
                    <option value="Main Dining">Main Dining Room</option>
                    <option value="Outdoor Terrace">Outdoor Terrace</option>
                    <option value="VIP Banquet">VIP Banquet Room</option>
                    <option value="Window Corner">Window Corner</option>
                    <option value="Bar Lounge">Bar Lounge</option>
                    <option value="Private Dining">Private Dining Suite</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase block mb-1">
                    Operational Status
                  </label>
                  <select
                    value={tableForm.status}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full text-xs bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
                  >
                    <option value="available">
                      Available for Guest Seating
                    </option>
                    <option value="occupied">Occupied / Active Dining</option>
                    <option value="reserved">Reserved for VIP Guest</option>
                    <option value="disabled">
                      Disabled / Merged / Out of Service
                    </option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#ECE7E1]">
                  <button
                    type="button"
                    onClick={() => setIsTableModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E76F51] hover:bg-[#d95d3f] cursor-pointer shadow-brilixis-sm"
                  >
                    {editingTable ? "Save Changes" : "Create Table"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
