import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Package,
  Building2,
  MapPin,
  CalendarDays,
  UserRound,
  Tag,
  X,
} from "lucide-react";

type Asset = {
  id?: number;
  assetCode: string;
  assetName: string;
  category: string;
  department: string;
  location?: string;
  quantity: number;
  assignedTo?: string;
  purchaseDate?: string;
  purchasePrice?: number | string;
  condition: "New" | "Good" | "Fair" | "Damaged";
  status:
    | "Available"
    | "Assigned"
    | "Under Maintenance"
    | "Disposed";
  description?: string;
};

const API_URL = `${API_BASE_URL}/api/assets`;

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value?: number | string) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

function AssetMaster() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    assetCode: "",
    assetName: "",
    category: "Computer",
    department: "AIML",
    location: "",
    quantity: 1,
    assignedTo: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: "",
    condition: "New",
    status: "Available",
    description: "",
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      const data = await response.json();

      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch assets error:", error);
      alert("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
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

    if (!formData.assetCode.trim()) {
      alert("Please enter an asset code");
      return;
    }

    if (!formData.assetName.trim()) {
      alert("Please enter an asset name");
      return;
    }

    if (!formData.category.trim()) {
      alert("Please enter a category");
      return;
    }

    if (!formData.department.trim()) {
      alert("Please select a department");
      return;
    }

    if (formData.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetCode: formData.assetCode.trim(),
          assetName: formData.assetName.trim(),
          category: formData.category,
          department: formData.department,
          location: formData.location.trim(),
          quantity: formData.quantity,
          assignedTo: formData.assignedTo.trim(),
          purchaseDate: formData.purchaseDate || null,
          purchasePrice:
            formData.purchasePrice === ""
              ? null
              : Number(formData.purchasePrice),
          condition: formData.condition,
          status: formData.status,
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create asset"
        );
      }

      setFormData({
        assetCode: "",
        assetName: "",
        category: "Computer",
        department: "AIML",
        location: "",
        quantity: 1,
        assignedTo: "",
        purchaseDate: new Date()
          .toISOString()
          .split("T")[0],
        purchasePrice: "",
        condition: "New",
        status: "Available",
        description: "",
      });

      setShowForm(false);
      fetchAssets();
    } catch (error) {
      console.error("Create asset error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create asset"
      );
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!asset.id) {
      alert("Asset ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Delete asset ${asset.assetCode}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${asset.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete asset"
        );
      }

      fetchAssets();
    } catch (error) {
      console.error("Delete asset error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete asset"
      );
    }
  };

  const updateStatus = async (
    asset: Asset,
    status: Asset["status"]
  ) => {
    if (!asset.id) {
      alert("Asset ID is missing");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${asset.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assetCode: asset.assetCode,
            assetName: asset.assetName,
            category: asset.category,
            department: asset.department,
            location: asset.location || "",
            quantity: asset.quantity,
            assignedTo: asset.assignedTo || "",
            purchaseDate: asset.purchaseDate || null,
            purchasePrice:
              asset.purchasePrice === undefined
                ? null
                : Number(asset.purchasePrice),
            condition: asset.condition,
            status,
            description: asset.description || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update asset"
        );
      }

      fetchAssets();
    } catch (error) {
      console.error("Update asset error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update asset"
      );
    }
  };

  const totalQuantity = assets.reduce(
    (sum, asset) => sum + Number(asset.quantity || 0),
    0
  );

  const availableQuantity = assets
    .filter((asset) => asset.status === "Available")
    .reduce(
      (sum, asset) => sum + Number(asset.quantity || 0),
      0
    );

  const assignedQuantity = assets
    .filter((asset) => asset.status === "Assigned")
    .reduce(
      (sum, asset) => sum + Number(asset.quantity || 0),
      0
    );

  const maintenanceQuantity = assets
    .filter(
      (asset) => asset.status === "Under Maintenance"
    )
    .reduce(
      (sum, asset) => sum + Number(asset.quantity || 0),
      0
    );

  const getStatusClass = (status: Asset["status"]) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-emerald-700";

      case "Assigned":
        return "bg-blue-50 text-blue-700";

      case "Under Maintenance":
        return "bg-amber-50 text-amber-700";

      case "Disposed":
        return "bg-rose-50 text-rose-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getConditionClass = (
    condition: Asset["condition"]
  ) => {
    switch (condition) {
      case "New":
        return "bg-emerald-50 text-emerald-700";

      case "Good":
        return "bg-blue-50 text-blue-700";

      case "Fair":
        return "bg-amber-50 text-amber-700";

      case "Damaged":
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
              <Package size={16} />
              <span>Inventory</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Asset Master
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Asset Master
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage, assign and track college assets.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchAssets}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Asset
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Assets
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
                  Available
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {availableQuantity}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Package size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Assigned
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {assignedQuantity}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <UserRound size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Maintenance
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {maintenanceQuantity}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <RefreshCw size={22} />
              </div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Asset Register
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Complete list of registered college assets
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {assets.length} Records
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Loading assets...
              </div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Package size={32} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No assets found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add your first asset to start managing the
                college asset register.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Add Asset
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px] text-left">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Asset
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Condition
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Purchase
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="transition hover:bg-slate-50/80"
                    >

                      {/* Asset */}
                      <td className="px-5 py-5">

                        <div className="flex items-start gap-3">

                          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <Package size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {asset.assetName}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <Tag size={12} />
                              {asset.assetCode}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {asset.category}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Department */}
                      <td className="px-5 py-5">

                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                          <Building2 size={14} />
                          {asset.department}
                        </span>

                      </td>

                      {/* Location */}
                      <td className="px-5 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin
                            size={15}
                            className="text-slate-400"
                          />
                          {asset.location || "-"}
                        </div>

                      </td>

                      {/* Quantity */}
                      <td className="px-5 py-5">

                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                          {asset.quantity}
                        </span>

                      </td>

                      {/* Condition */}
                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getConditionClass(
                            asset.condition
                          )}`}
                        >
                          {asset.condition}
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                            asset.status
                          )}`}
                        >
                          {asset.status}
                        </span>

                      </td>

                      {/* Purchase */}
                      <td className="px-5 py-5">

                        <div className="text-sm text-slate-700">

                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />

                            {formatDate(
                              asset.purchaseDate
                            )}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {formatCurrency(
                              asset.purchasePrice
                            )}
                          </p>

                        </div>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-5">

                        <div className="flex justify-end gap-2">

                          {asset.status === "Available" && (
                            <button
                              onClick={() =>
                                updateStatus(
                                  asset,
                                  "Assigned"
                                )
                              }
                              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                            >
                              Assign
                            </button>
                          )}

                          {asset.status === "Assigned" && (
                            <button
                              onClick={() =>
                                updateStatus(
                                  asset,
                                  "Available"
                                )
                              }
                              className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50"
                            >
                              Available
                            </button>
                          )}

                          {asset.status !== "Disposed" &&
                            asset.status !==
                              "Under Maintenance" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    asset,
                                    "Under Maintenance"
                                  )
                                }
                                className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-600 transition hover:bg-amber-50"
                              >
                                Maintenance
                              </button>
                            )}

                          <button
                            onClick={() =>
                              handleDelete(asset)
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete asset"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          Asset data synchronized with PostgreSQL
        </div>

      </div>

      {/* Add Asset Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add New Asset
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Register a new asset in the college inventory
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
                    Asset Code
                  </label>

                  <input
                    type="text"
                    name="assetCode"
                    value={formData.assetCode}
                    onChange={handleChange}
                    placeholder="Example: AST003"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Asset Name
                  </label>

                  <input
                    type="text"
                    name="assetName"
                    value={formData.assetName}
                    onChange={handleChange}
                    placeholder="Example: HP Desktop Computer"
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
                    <option value="Computer">
                      Computer
                    </option>
                    <option value="Laptop">
                      Laptop
                    </option>
                    <option value="Printer">
                      Printer
                    </option>
                    <option value="Furniture">
                      Furniture
                    </option>
                    <option value="Laboratory Equipment">
                      Laboratory Equipment
                    </option>
                    <option value="Networking">
                      Networking
                    </option>
                    <option value="Electronics">
                      Electronics
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
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
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Example: AIML Lab 1"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                    Assigned To
                  </label>

                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Department / Faculty"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Purchase Date
                  </label>

                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    name="purchasePrice"
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="55000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">
                      Damaged
                    </option>
                  </select>
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter asset description..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

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
                  Add Asset
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AssetMaster;