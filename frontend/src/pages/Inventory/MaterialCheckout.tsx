import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  PackageCheck,
  CalendarDays,
  Building2,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

type CheckoutStatus = "Checked Out" | "Returned" | "Overdue";

type Checkout = {
  id?: number;
  itemName: string;
  department: string;
  quantity: number;
  checkoutDate: string;
  expectedReturnDate: string;
  purpose: string;
  status: CheckoutStatus;
};

const API_URL = `${API_BASE_URL}/api/checkouts`;

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function MaterialCheckout() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    itemName: "",
    department: "AIML",
    quantity: 1,
    checkoutDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    purpose: "",
  });

  const fetchCheckouts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch checkout records");
      }

      const data = await response.json();

      setCheckouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch checkouts error:", error);
      alert("Failed to load checkout records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      alert("Please enter the item name");
      return;
    }

    if (formData.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (!formData.expectedReturnDate) {
      alert("Please select expected return date");
      return;
    }

    if (!formData.purpose.trim()) {
      alert("Please enter the purpose");
      return;
    }

    if (
      formData.expectedReturnDate <
      formData.checkoutDate
    ) {
      alert(
        "Expected return date cannot be before checkout date"
      );
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: formData.itemName.trim(),
          department: formData.department,
          quantity: formData.quantity,
          checkoutDate: formData.checkoutDate,
          expectedReturnDate:
            formData.expectedReturnDate,
          purpose: formData.purpose.trim(),
          status: "Checked Out",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create checkout"
        );
      }

      setFormData({
        itemName: "",
        department: "AIML",
        quantity: 1,
        checkoutDate: new Date()
          .toISOString()
          .split("T")[0],
        expectedReturnDate: "",
        purpose: "",
      });

      setShowForm(false);
      fetchCheckouts();
    } catch (error) {
      console.error("Create checkout error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create checkout"
      );
    }
  };

  const updateStatus = async (
    checkout: Checkout,
    status: CheckoutStatus
  ) => {
    if (!checkout.id) {
      alert("Checkout ID is missing");
      return;
    }

    try {
      setUpdatingId(checkout.id);

      const response = await fetch(
        `${API_URL}/${checkout.id}/status`,
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
          data.message || "Failed to update status"
        );
      }

      await fetchCheckouts();
    } catch (error) {
      console.error("Update checkout status error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (checkout: Checkout) => {
    if (!checkout.id) {
      alert("Checkout ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Delete checkout record for "${checkout.itemName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${checkout.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete checkout"
        );
      }

      fetchCheckouts();
    } catch (error) {
      console.error("Delete checkout error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete checkout"
      );
    }
  };

  const checkedOutCount = checkouts.filter(
    (item) => item.status === "Checked Out"
  ).length;

  const returnedCount = checkouts.filter(
    (item) => item.status === "Returned"
  ).length;

  const overdueCount = checkouts.filter(
    (item) => item.status === "Overdue"
  ).length;

  const totalIssuedQuantity = checkouts
    .filter((item) => item.status === "Checked Out")
    .reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

  const getStatusClass = (status: CheckoutStatus) => {
    switch (status) {
      case "Checked Out":
        return "bg-blue-50 text-blue-700";

      case "Returned":
        return "bg-emerald-50 text-emerald-700";

      case "Overdue":
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
              <PackageCheck size={16} />
              <span>Inventory</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Material Checkout
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Material Checkout
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track materials issued to departments and their return status.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchCheckouts}
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
              New Checkout
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Checked Out
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {checkedOutCount}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <PackageCheck size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Returned
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {returnedCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overdue
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {overdueCount}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Items Issued
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalIssuedQuantity}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <PackageCheck size={22} />
              </div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Checkout Register
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Materials currently issued or previously returned
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {checkouts.length} Records
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Loading checkout records...
              </div>
            </div>
          ) : checkouts.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <PackageCheck size={32} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No checkout records
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create a checkout record when material is issued to a department.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                New Checkout
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px] text-left">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Material
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Checkout Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Return Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Purpose
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

                  {checkouts.map((checkout) => {
                    const isUpdating =
                      checkout.id === updatingId;

                    return (
                      <tr
                        key={checkout.id}
                        className="transition hover:bg-slate-50/80"
                      >

                        {/* Material */}
                        <td className="px-5 py-5">

                          <div className="flex items-start gap-3">

                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                              <PackageCheck size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {checkout.itemName}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Checkout #{checkout.id}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Department */}
                        <td className="px-5 py-5">

                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                            <Building2 size={14} />
                            {checkout.department}
                          </span>

                        </td>

                        {/* Quantity */}
                        <td className="px-5 py-5">

                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                            {checkout.quantity}
                          </span>

                        </td>

                        {/* Checkout date */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDate(
                              checkout.checkoutDate
                            )}
                          </div>

                        </td>

                        {/* Return date */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock3
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDate(
                              checkout.expectedReturnDate
                            )}
                          </div>

                        </td>

                        {/* Purpose */}
                        <td className="max-w-xs px-5 py-5">

                          <span className="block truncate text-sm text-slate-600">
                            {checkout.purpose}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              checkout.status
                            )}`}
                          >
                            {checkout.status}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            {checkout.status ===
                              "Checked Out" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateStatus(
                                      checkout,
                                      "Returned"
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                >
                                  Return
                                </button>

                                <button
                                  onClick={() =>
                                    updateStatus(
                                      checkout,
                                      "Overdue"
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                                >
                                  Overdue
                                </button>
                              </>
                            )}

                            {checkout.status ===
                              "Overdue" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    checkout,
                                    "Returned"
                                  )
                                }
                                disabled={isUpdating}
                                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Return
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDelete(checkout)
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Delete checkout"
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
          Checkout data synchronized with PostgreSQL
        </div>

      </div>

      {/* New Checkout Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  New Material Checkout
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Record material issued to a department
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

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Material / Item
                  </label>

                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Example: Dell Laptop"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Department
                  </label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="AIML">AIML</option>
                    <option value="CSE">CSE</option>
                    <option value="ISE">ISE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="IT">IT</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
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
                    Checkout Date
                  </label>

                  <input
                    type="date"
                    name="checkoutDate"
                    value={formData.checkoutDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Expected Return Date
                  </label>

                  <input
                    type="date"
                    name="expectedReturnDate"
                    value={formData.expectedReturnDate}
                    min={formData.checkoutDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Purpose
                </label>

                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData((previous) => ({
                      ...previous,
                      purpose: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Example: AI Lab Project"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* Info */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                <div className="flex gap-3">

                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                    <PackageCheck size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-blue-900">
                      Checkout status
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      New checkout records will automatically be created
                      with the status <strong>Checked Out</strong>.
                    </p>
                  </div>

                </div>

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
                  Create Checkout
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default MaterialCheckout;