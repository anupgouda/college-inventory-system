import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  Package,
  CalendarDays,
  Building2,
  Hash,
  X,
} from "lucide-react";

type Indent = {
  id?: number;
  _id?: number;
  date: string;
  branch: string;
  description: string;
  qty: number;
  status: "Pending" | "Approved" | "Rejected";
};

const API_URL = `${API_BASE_URL}/api/indents`;

const getIndentId = (indent: Indent) => {
  return indent.id ?? indent._id;
};

const formatDate = (date: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function IndentMaster() {
  const [indents, setIndents] = useState<Indent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    branch: "AIML",
    description: "",
    qty: 1,
  });

  const fetchIndents = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch indents");
      }

      const data = await response.json();

      setIndents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch indents error:", error);
      alert("Failed to load indents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndents();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "qty" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert("Please enter an item description");
      return;
    }

    if (formData.qty <= 0) {
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
          date: formData.date,
          branch: formData.branch,
          description: formData.description.trim(),
          qty: formData.qty,
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create indent");
      }

      setFormData({
        date: new Date().toISOString().split("T")[0],
        branch: "AIML",
        description: "",
        qty: 1,
      });

      setShowForm(false);
      fetchIndents();
    } catch (error) {
      console.error("Create indent error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create indent"
      );
    }
  };

  const handleDelete = async (indent: Indent) => {
    const id = getIndentId(indent);

    if (id === undefined || id === null) {
      alert("Indent ID is missing");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this indent?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete indent");
      }

      fetchIndents();
    } catch (error) {
      console.error("Delete indent error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete indent"
      );
    }
  };

  const pendingCount = indents.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = indents.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = indents.filter(
    (item) => item.status === "Rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page intro */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <FileText size={16} />
              <span>Inventory</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Indent Master
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Indent Master
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage department material requests.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchIndents}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
              New Indent
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pendingCount}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <FileText size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Approved
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {approvedCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Package size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Rejected
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {rejectedCount}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <X size={22} />
              </div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Indent Requests
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                All department indent requests
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {indents.length} Records
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading indents...
              </div>
            </div>
          ) : indents.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <FileText size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No indents found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create your first department indent request to get started.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Create Indent
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {indents.map((indent) => {
                    const id = getIndentId(indent);

                    return (
                      <tr
                        key={id}
                        className="transition hover:bg-slate-50/80"
                      >

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Hash
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="font-semibold text-slate-700">
                              {id}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDate(indent.date)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                            <Building2 size={15} />
                            {indent.branch}
                          </div>
                        </td>

                        <td className="max-w-xs px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Package
                              size={16}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate text-sm font-medium text-slate-800">
                              {indent.description}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                            {indent.qty}
                          </span>
                        </td>

                        <td className="px-5 py-4">

                          {indent.status === "Pending" && (
                            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                              Pending
                            </span>
                          )}

                          {indent.status === "Approved" && (
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                              Approved
                            </span>
                          )}

                          {indent.status === "Rejected" && (
                            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                              Rejected
                            </span>
                          )}

                        </td>

                        <td className="px-5 py-4 text-right">

                          <button
                            onClick={() => handleDelete(indent)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete indent"
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
          Data synchronized with PostgreSQL
        </div>

      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Indent
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Submit a new department material request
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

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Request Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department
                </label>

                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                  Item / Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Example: A4 Size 75gsm Xerox Paper"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Quantity
                </label>

                <input
                  type="number"
                  name="qty"
                  min="1"
                  value={formData.qty}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
                  Create Indent
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default IndentMaster;