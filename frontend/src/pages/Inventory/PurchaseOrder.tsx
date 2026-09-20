import { apiFetch } from "../../utils/api";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  ShoppingCart,
  Building2,
  CalendarDays,
  Package,
  IndianRupee,
  FileText,
  X,
} from "lucide-react";

type Vendor = {
  id: number;
  vendorCode: string;
  vendorName: string;
};

type PurchaseOrder = {
  id?: number;
  poNumber: string;
  vendorId: number;
  vendorCode?: string;
  vendorName?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  itemName: string;
  quantity: number;
  unitPrice: number | string;
  totalAmount: number | string;
  status: "Open" | "Approved" | "Received" | "Cancelled";
  notes?: string;
};


const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value: number | string = 0) => {
  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

function PurchaseOrder() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    poNumber: "",
    vendorId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    itemName: "",
    quantity: 1,
    unitPrice: "",
    notes: "",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/api/purchase-orders");

      if (!response.ok) {
        throw new Error("Failed to fetch purchase orders");
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch purchase orders error:", error);
      alert("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await apiFetch("/api/vendors");

      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await response.json();

      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch vendors error:", error);
      alert("Failed to load vendors");
    }
  };

  const loadData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchVendors(),
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "quantity"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.poNumber.trim()) {
      alert("Please enter PO number");
      return;
    }

    if (!formData.vendorId) {
      alert("Please select a vendor");
      return;
    }

    if (!formData.itemName.trim()) {
      alert("Please enter item name");
      return;
    }

    if (formData.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (
      formData.unitPrice === "" ||
      Number(formData.unitPrice) < 0
    ) {
      alert("Please enter a valid unit price");
      return;
    }

    if (
      formData.expectedDeliveryDate &&
      formData.expectedDeliveryDate < formData.orderDate
    ) {
      alert(
        "Expected delivery date cannot be before order date"
      );
      return;
    }

    try {
      const response = await apiFetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poNumber: formData.poNumber.trim(),
          vendorId: Number(formData.vendorId),
          orderDate: formData.orderDate,
          expectedDeliveryDate:
            formData.expectedDeliveryDate || null,
          itemName: formData.itemName.trim(),
          quantity: formData.quantity,
          unitPrice: Number(formData.unitPrice),
          notes: formData.notes.trim(),
          status: "Open",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create purchase order"
        );
      }

      setFormData({
        poNumber: "",
        vendorId: "",
        orderDate: new Date()
          .toISOString()
          .split("T")[0],
        expectedDeliveryDate: "",
        itemName: "",
        quantity: 1,
        unitPrice: "",
        notes: "",
      });

      setShowForm(false);
      fetchOrders();
    } catch (error) {
      console.error("Create purchase order error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create purchase order"
      );
    }
  };

  const updateStatus = async (
    order: PurchaseOrder,
    status: PurchaseOrder["status"]
  ) => {
    if (!order.id) {
      alert("Purchase order ID is missing");
      return;
    }

    try {
      setUpdatingId(order.id);

      const response = await apiFetch(
        `/api/purchase-orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update purchase order"
        );
      }

      await fetchOrders();
    } catch (error) {
      console.error("Update PO status error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update purchase order"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (!order.id) {
      alert("Purchase order ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Delete purchase order "${order.poNumber}"?`
    );

    if (!confirmed) return;

    try {
      const response = await apiFetch(
        `/api/purchase-orders/${order.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete purchase order"
        );
      }

      fetchOrders();
    } catch (error) {
      console.error("Delete purchase order error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete purchase order"
      );
    }
  };

  const openCount = orders.filter(
    (order) => order.status === "Open"
  ).length;

  const approvedCount = orders.filter(
    (order) => order.status === "Approved"
  ).length;

  const receivedCount = orders.filter(
    (order) => order.status === "Received"
  ).length;

  const totalOrderValue = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  const getStatusClass = (
    status: PurchaseOrder["status"]
  ) => {
    switch (status) {
      case "Open":
        return "bg-amber-50 text-amber-700";

      case "Approved":
        return "bg-blue-50 text-blue-700";

      case "Received":
        return "bg-emerald-50 text-emerald-700";

      case "Cancelled":
        return "bg-rose-50 text-rose-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <ShoppingCart size={16} />
              <span>Procurement</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Purchase Orders
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Purchase Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage vendor purchase orders.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              New Purchase Order
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Open Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {openCount}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <ShoppingCart size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Approved
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {approvedCount}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileText size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Received
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {receivedCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Package size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Order Value
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalOrderValue)}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <IndianRupee size={22} />
              </div>

            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Purchase Order Register
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Vendor orders and procurement status
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {orders.length} Records
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Loading purchase orders...
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <ShoppingCart size={32} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No purchase orders
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create a purchase order to begin the procurement process.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Create Purchase Order
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1300px] text-left">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      PO Number
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Vendor
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Item
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Qty
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Unit Price
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Order Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Delivery
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {orders.map((order) => {
                    const isUpdating =
                      order.id === updatingId;

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-slate-50/80"
                      >

                        {/* PO */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                              <ShoppingCart size={18} />
                            </div>

                            <div>
                              <p className="font-bold text-slate-800">
                                {order.poNumber}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                PO #{order.id}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Vendor */}
                        <td className="px-5 py-5">

                          <div className="flex items-start gap-2">

                            <Building2
                              size={15}
                              className="mt-0.5 text-slate-400"
                            />

                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {order.vendorName || "-"}
                              </p>

                              <p className="mt-1 text-xs text-blue-600">
                                {order.vendorCode || "-"}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Item */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2">

                            <Package
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm font-medium text-slate-700">
                              {order.itemName}
                            </span>

                          </div>

                        </td>

                        {/* Quantity */}
                        <td className="px-5 py-5">

                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                            {order.quantity}
                          </span>

                        </td>

                        {/* Unit price */}
                        <td className="px-5 py-5 text-sm text-slate-600">
                          {formatCurrency(order.unitPrice)}
                        </td>

                        {/* Total */}
                        <td className="px-5 py-5 text-sm font-bold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        {/* Order date */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />
                            {formatDate(order.orderDate)}
                          </div>

                        </td>

                        {/* Delivery */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />
                            {formatDate(
                              order.expectedDeliveryDate
                            )}
                          </div>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            {order.status === "Open" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    order,
                                    "Approved"
                                  )
                                }
                                disabled={isUpdating}
                                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}

                            {order.status === "Approved" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    order,
                                    "Received"
                                  )
                                }
                                disabled={isUpdating}
                                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Receive
                              </button>
                            )}

                            {(order.status === "Open" ||
                              order.status === "Approved") && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    order,
                                    "Cancelled"
                                  )
                                }
                                disabled={isUpdating}
                                className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDelete(order)
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Delete purchase order"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          Purchase order data synchronized with PostgreSQL
        </div>

      </div>

      {/* New Purchase Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Purchase Order
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a new vendor purchase order
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    PO Number
                  </label>

                  <input
                    type="text"
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleChange}
                    placeholder="PO003"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Vendor
                  </label>

                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">
                      Select vendor
                    </option>

                    {vendors.map((vendor) => (
                      <option
                        key={vendor.id}
                        value={vendor.id}
                      >
                        {vendor.vendorCode} -{" "}
                        {vendor.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Order Date
                  </label>

                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Expected Delivery
                  </label>

                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    min={formData.orderDate}
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Item Name
                  </label>

                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Example: A4 Xerox Paper"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Unit Price
                  </label>

                  <input
                    type="number"
                    name="unitPrice"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    placeholder="5.50"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

              </div>

              {/* Total preview */}
              {formData.unitPrice !== "" && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium text-blue-600">
                        Purchase Order Total
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-900">
                        {formatCurrency(
                          Number(formData.quantity) *
                            Number(formData.unitPrice)
                        )}
                      </p>
                    </div>

                    <IndianRupee
                      size={24}
                      className="text-blue-500"
                    />

                  </div>

                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add procurement notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus size={17} />
                  Create Purchase Order
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default PurchaseOrder;