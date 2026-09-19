import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  ShoppingCart,
  Package,
  Building2,
  Boxes,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  IndianRupee,
  FileText,
} from "lucide-react";

type DashboardData = {
  pendingApprovals: number;
  lowStockItems: number;
  openPurchaseOrders: number;
  totalAssets: number;
  totalVendors: number;
  totalStock: number;
};

type PendingIndent = {
  id?: number;
  _id?: number;
  date: string;
  branch: string;
  description: string;
  qty: number;
  status: string;
};

type LowStockItem = {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: string;
  storageLocation: string;
  invoiceNumber: string;
};

type OpenPurchaseOrder = {
  id: number;
  po_number: string;
  order_date: string;
  expected_delivery_date: string | null;
  item_name: string;
  quantity: number;
  unit_price: string;
  total_amount: string;
  status: string;
  notes: string | null;
  vendor_code: string;
  vendor_name: string;
};

const API_URL = "http://localhost:5001/api/dashboard";

// --------------------------------------------------
// DATE FORMAT
// --------------------------------------------------

const formatDate = (date: string | null) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// --------------------------------------------------
// CURRENCY FORMAT
// --------------------------------------------------

const formatCurrency = (value: string | number) => {
  const amount = Number(value);

  if (isNaN(amount)) {
    return "₹0.00";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// --------------------------------------------------
// GET INDENT ID
// --------------------------------------------------

const getIndentId = (indent: PendingIndent) => {
  return indent.id ?? indent._id;
};

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [pendingIndents, setPendingIndents] = useState<PendingIndent[]>([]);

  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  const [openPurchaseOrders, setOpenPurchaseOrders] = useState<
    OpenPurchaseOrder[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showPending, setShowPending] = useState(false);

  const [showLowStock, setShowLowStock] = useState(false);

  const [showOpenPO, setShowOpenPO] = useState(false);

  // --------------------------------------------------
  // FETCH DASHBOARD
  // --------------------------------------------------

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard");
      }

      const result = await response.json();

      setDashboard(result.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH PENDING APPROVALS
  // --------------------------------------------------

  const fetchPendingIndents = async () => {
    try {
      const response = await fetch(
        `${API_URL}/pending-approvals`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending approvals");
      }

      const result = await response.json();

      setPendingIndents(result.data || []);
    } catch (err) {
      console.error("Pending approvals error:", err);
    }
  };

  // --------------------------------------------------
  // FETCH LOW STOCK
  // --------------------------------------------------

  const fetchLowStock = async () => {
    try {
      const response = await fetch(
        `${API_URL}/low-stock`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch low stock");
      }

      const result = await response.json();

      setLowStock(result.data || []);
    } catch (err) {
      console.error("Low stock error:", err);
    }
  };

  // --------------------------------------------------
  // FETCH OPEN PURCHASE ORDERS
  // --------------------------------------------------

  const fetchOpenPurchaseOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/open-purchase-orders`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch open purchase orders");
      }

      const result = await response.json();

      setOpenPurchaseOrders(result.data || []);
    } catch (err) {
      console.error("Open purchase orders error:", err);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchDashboard();
    fetchPendingIndents();
    fetchLowStock();
    fetchOpenPurchaseOrders();
  }, []);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const refreshDashboard = async () => {
    await Promise.all([
      fetchDashboard(),
      fetchPendingIndents(),
      fetchLowStock(),
      fetchOpenPurchaseOrders(),
    ]);
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[calc(100vh-82px)] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error && !dashboard) {
    return (
      <div className="flex min-h-[calc(100vh-82px)] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={refreshDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-82px)] bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* DASHBOARD INTRO */}
        {/* ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Live Overview
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Inventory Dashboard
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Monitor inventory, procurement, approvals and stock
              activity from one place.
            </p>
          </div>

          <button
            onClick={refreshDashboard}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

        </div>

        {/* ================================================= */}
        {/* MAIN STAT CARDS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* PENDING APPROVALS */}

          <button
            onClick={() => setShowPending(!showPending)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg"
          >

            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-50 opacity-70 blur-2xl" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ClipboardCheck size={21} />
                </div>

                <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition group-hover:bg-amber-50 group-hover:text-amber-600">
                  {showPending ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </div>

              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Pending Approvals
              </p>

              <div className="mt-1 flex items-end justify-between">

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {dashboard?.pendingApprovals ?? 0}
                </p>

                <span className="mb-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  Requires Action
                </span>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                {showPending
                  ? "Click to collapse details"
                  : "Click to view pending indents"}
              </p>

            </div>

          </button>

          {/* LOW STOCK */}

          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
          >

            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-50 opacity-70 blur-2xl" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle size={21} />
                </div>

                <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition group-hover:bg-red-50 group-hover:text-red-600">
                  {showLowStock ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </div>

              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Low Stock Items
              </p>

              <div className="mt-1 flex items-end justify-between">

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {dashboard?.lowStockItems ?? 0}
                </p>

                <span className="mb-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                  Stock Alert
                </span>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                {showLowStock
                  ? "Click to collapse details"
                  : "Click to view low stock items"}
              </p>

            </div>

          </button>

          {/* OPEN PURCHASE ORDERS */}

          <button
            onClick={() => setShowOpenPO(!showOpenPO)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
          >

            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-blue-50 opacity-70 blur-2xl" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingCart size={21} />
                </div>

                <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                  {showOpenPO ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </div>

              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Open Purchase Orders
              </p>

              <div className="mt-1 flex items-end justify-between">

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {dashboard?.openPurchaseOrders ?? 0}
                </p>

                <span className="mb-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  In Progress
                </span>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                {showOpenPO
                  ? "Click to collapse details"
                  : "Click to view purchase orders"}
              </p>

            </div>

          </button>

        </div>

        {/* ================================================= */}
        {/* PENDING DETAILS */}
        {/* ================================================= */}

        {showPending && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ClipboardCheck size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Pending Approval Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Indents waiting for approval
                  </p>
                </div>

              </div>

              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {pendingIndents.length} Pending
              </span>

            </div>

            {pendingIndents.length === 0 ? (

              <div className="p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <ClipboardCheck size={22} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No pending indents
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All indent requests have been processed.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px] text-left">

                  <thead className="bg-slate-50/80">

                    <tr>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        ID
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Branch
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Description
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Quantity
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {pendingIndents.map((indent) => (

                      <tr
                        key={getIndentId(indent)}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          #{getIndentId(indent)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(indent.date)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {indent.branch}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {indent.description}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {indent.qty}
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                            {indent.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        )}

        {/* ================================================= */}
        {/* LOW STOCK DETAILS */}
        {/* ================================================= */}

        {showLowStock && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Low Stock Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Items with quantity of 10 or less
                  </p>
                </div>

              </div>

              <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {lowStock.length} Alert
                {lowStock.length !== 1 ? "s" : ""}
              </span>

            </div>

            {lowStock.length === 0 ? (

              <div className="p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Package size={22} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No low stock items
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Current stock levels are above the alert threshold.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px] text-left">

                  <thead className="bg-slate-50/80">

                    <tr>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        ID
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Item
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Quantity
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Unit Price
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Location
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Invoice
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {lowStock.map((item) => (

                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          #{item.id}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {item.itemName}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {item.category || "-"}
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            {item.quantity}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {item.storageLocation}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {item.invoiceNumber || "-"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        )}

        {/* ================================================= */}
        {/* OPEN PURCHASE ORDERS */}
        {/* ================================================= */}

        {showOpenPO && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingCart size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Open Purchase Order Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Purchase orders currently in progress
                  </p>
                </div>

              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {openPurchaseOrders.length} Open
              </span>

            </div>

            {openPurchaseOrders.length === 0 ? (

              <div className="p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <ShoppingCart size={22} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No open purchase orders
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  There are currently no purchase orders in progress.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1150px] text-left">

                  <thead className="bg-slate-50/80">

                    <tr>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        PO Number
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Vendor
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Item
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Qty
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Unit Price
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Order Date
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Delivery
                      </th>

                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {openPurchaseOrders.map((po) => (

                      <tr
                        key={po.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <FileText
                              size={16}
                              className="text-blue-500"
                            />

                            <span className="text-sm font-bold text-slate-800">
                              {po.po_number}
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-slate-700">
                            {po.vendor_name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {po.vendor_code}
                          </p>

                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {po.item_name}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {po.quantity}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatCurrency(po.unit_price)}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-slate-800">
                          {formatCurrency(po.total_amount)}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <CalendarDays size={14} />
                            {formatDate(po.order_date)}
                          </div>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(po.expected_delivery_date)}
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                            {po.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>
        )}

        {/* ================================================= */}
        {/* INVENTORY OVERVIEW */}
        {/* ================================================= */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Boxes size={19} />
              </div>

              <div>

                <h2 className="font-semibold text-slate-800">
                  Inventory Overview
                </h2>

                <p className="text-xs text-slate-400">
                  Current inventory summary
                </p>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">

            {/* ASSETS */}

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Assets
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {dashboard?.totalAssets ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Total registered asset quantity
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Package size={19} />
                </div>

              </div>

            </div>

            {/* VENDORS */}

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Vendors
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {dashboard?.totalVendors ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Registered suppliers
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Building2 size={19} />
                </div>

              </div>

            </div>

            {/* STOCK */}

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Stock Quantity
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {dashboard?.totalStock ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Units currently in stock
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Boxes size={19} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* FOOTER STATUS */}
        {/* ================================================= */}

        <div className="mt-5 flex flex-col gap-2 pb-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Dashboard connected to PostgreSQL
          </div>

          <div>
            College Inventory Management System
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;