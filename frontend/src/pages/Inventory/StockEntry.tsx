import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Package,
  Warehouse,
  CalendarDays,
  FileText,
  ShoppingCart,
  X,
  IndianRupee,
} from "lucide-react";

type Stock = {
  id?: number;
  itemName: string;
  category?: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice?: number | string;
  storageLocation: string;
  entryDate: string;
  invoiceNumber?: string;
  purchaseOrder?: string;
};

const API_URL = "http://localhost:5001/api/stock";

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

function StockEntry() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    itemName: "",
    category: "Stationery",
    quantity: 1,
    unitPrice: "",
    storageLocation: "Central Store",
    entryDate: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    purchaseOrder: "",
  });

  const fetchStock = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch stock");
      }

      const data = await response.json();

      setStock(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch stock error:", error);
      alert("Failed to load stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (!formData.itemName.trim()) {
      alert("Please enter an item name");
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

    if (!formData.storageLocation.trim()) {
      alert("Please enter a storage location");
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
          category: formData.category,
          quantity: formData.quantity,
          unitPrice: Number(formData.unitPrice),
          storageLocation: formData.storageLocation.trim(),
          entryDate: formData.entryDate,
          invoiceNumber: formData.invoiceNumber.trim(),
          purchaseOrder: formData.purchaseOrder.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create stock entry"
        );
      }

      setFormData({
        itemName: "",
        category: "Stationery",
        quantity: 1,
        unitPrice: "",
        storageLocation: "Central Store",
        entryDate: new Date().toISOString().split("T")[0],
        invoiceNumber: "",
        purchaseOrder: "",
      });

      setShowForm(false);
      fetchStock();
    } catch (error) {
      console.error("Create stock error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create stock entry"
      );
    }
  };

  const handleDelete = async (item: Stock) => {
    if (!item.id) {
      alert("Stock ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.itemName}" from stock?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${item.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete stock"
        );
      }

      fetchStock();
    } catch (error) {
      console.error("Delete stock error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete stock"
      );
    }
  };

  const totalQuantity = stock.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalValue = stock.reduce(
    (sum, item) =>
      sum +
      Number(
        item.totalPrice ||
          Number(item.quantity) * Number(item.unitPrice)
      ),
    0
  );

  const lowStockCount = stock.filter(
    (item) => Number(item.quantity) <= 10
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Warehouse size={16} />
              <span>Inventory</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Stock Entry
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Stock Entry
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Record and manage incoming inventory stock.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchStock}
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
              Add Stock
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalQuantity}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Package size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inventory Value
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalValue)}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <IndianRupee size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Stock Items
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {lowStockCount}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Warehouse size={22} />
              </div>

            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Stock Register
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                All inventory stock entries
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {stock.length} Records
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Loading stock...
              </div>
            </div>
          ) : stock.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Warehouse size={32} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No stock entries
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add your first stock entry to begin tracking inventory.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Add Stock
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px] text-left">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Item
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Unit Price
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Storage
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Entry Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Reference
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {stock.map((item) => {
                    const total =
                      Number(
                        item.totalPrice || 0
                      ) ||
                      Number(item.quantity) *
                        Number(item.unitPrice);

                    const isLowStock =
                      Number(item.quantity) <= 10;

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50/80"
                      >

                        {/* Item */}
                        <td className="px-5 py-5">

                          <div className="flex items-start gap-3">

                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                              <Package size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.itemName}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID #{item.id}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Category */}
                        <td className="px-5 py-5">

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {item.category || "-"}
                          </span>

                        </td>

                        {/* Quantity */}
                        <td className="px-5 py-5">

                          <span
                            className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                              isLowStock
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {item.quantity}
                          </span>

                        </td>

                        {/* Unit price */}
                        <td className="px-5 py-5 text-sm font-medium text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        {/* Total */}
                        <td className="px-5 py-5 text-sm font-bold text-slate-900">
                          {formatCurrency(total)}
                        </td>

                        {/* Storage */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Warehouse
                              size={15}
                              className="text-slate-400"
                            />
                            {item.storageLocation}
                          </div>

                        </td>

                        {/* Date */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDate(item.entryDate)}
                          </div>

                        </td>

                        {/* Reference */}
                        <td className="px-5 py-5">

                          <div className="space-y-1 text-xs">

                            {item.invoiceNumber && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <FileText size={13} />
                                {item.invoiceNumber}
                              </div>
                            )}

                            {item.purchaseOrder && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <ShoppingCart size={13} />
                                {item.purchaseOrder}
                              </div>
                            )}

                            {!item.invoiceNumber &&
                              !item.purchaseOrder && (
                                <span className="text-slate-400">
                                  -
                                </span>
                              )}

                          </div>

                        </td>

                        {/* Delete */}
                        <td className="px-5 py-5 text-right">

                          <button
                            onClick={() =>
                              handleDelete(item)
                            }
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete stock"
                          >
                            <Trash2 size={17} />
                          </button>

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
          Stock data synchronized with PostgreSQL
        </div>

      </div>

      {/* Add Stock Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Stock Entry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Record incoming stock into the inventory
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
                    Item Name
                  </label>

                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Example: A4 Size 75gsm Xerox Paper"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="Stationery">
                      Stationery
                    </option>
                    <option value="Computer">
                      Computer
                    </option>
                    <option value="Electronics">
                      Electronics
                    </option>
                    <option value="Laboratory">
                      Laboratory
                    </option>
                    <option value="Furniture">
                      Furniture
                    </option>
                    <option value="Networking">
                      Networking
                    </option>
                    <option value="Other">
                      Other
                    </option>
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Storage Location
                  </label>

                  <input
                    type="text"
                    name="storageLocation"
                    value={formData.storageLocation}
                    onChange={handleChange}
                    placeholder="Central Store"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Entry Date
                  </label>

                  <input
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="INV-001"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Purchase Order
                  </label>

                  <input
                    type="text"
                    name="purchaseOrder"
                    value={formData.purchaseOrder}
                    onChange={handleChange}
                    placeholder="PO-001"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

              </div>

              {/* Preview */}
              {formData.unitPrice !== "" && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium text-blue-600">
                        Calculated Total
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
                  Add Stock
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default StockEntry;