import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck2,
  CalendarDays,
  Building2,
  Package,
  Hash,
  Clock3,
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

function IndentApproval() {
  const [indents, setIndents] = useState<Indent[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
      alert("Failed to load indent requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndents();
  }, []);

  const updateStatus = async (
    indent: Indent,
    status: "Approved" | "Rejected"
  ) => {
    const id = getIndentId(indent);

    if (id === undefined || id === null) {
      alert("Indent ID is missing");
      return;
    }

    try {
      setUpdatingId(id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update indent status");
      }

      await fetchIndents();
    } catch (error) {
      console.error("Update status error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update indent status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingIndents = indents.filter(
    (indent) => indent.status === "Pending"
  );

  const approvedCount = indents.filter(
    (indent) => indent.status === "Approved"
  ).length;

  const rejectedCount = indents.filter(
    (indent) => indent.status === "Rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <FileCheck2 size={16} />
              <span>Inventory</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Indent Approval
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Indent Approval
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and approve department material requests.
            </p>
          </div>

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

        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Pending */}
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Approval
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pendingIndents.length}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 size={22} />
              </div>

            </div>
          </div>

          {/* Approved */}
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
                <CheckCircle2 size={22} />
              </div>

            </div>
          </div>

          {/* Rejected */}
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
                <XCircle size={22} />
              </div>

            </div>
          </div>

        </div>

        {/* Approval table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Approval Queue
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Department requests waiting for review
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              {pendingIndents.length} Pending
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading approval requests...
              </div>
            </div>
          ) : pendingIndents.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No pending approvals
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                All current indent requests have been processed.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-left">

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
                      Requested Item
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Decision
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {pendingIndents.map((indent) => {
                    const id = getIndentId(indent);

                    const isUpdating = id === updatingId;

                    return (
                      <tr
                        key={id}
                        className="transition hover:bg-slate-50/80"
                      >

                        {/* ID */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">

                            <Hash
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="font-bold text-slate-700">
                              {id}
                            </span>

                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            {formatDate(indent.date)}

                          </div>

                        </td>

                        {/* Department */}
                        <td className="px-5 py-5">

                          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">

                            <Building2 size={15} />

                            {indent.branch}

                          </span>

                        </td>

                        {/* Item */}
                        <td className="max-w-xs px-5 py-5">

                          <div className="flex items-center gap-2">

                            <Package
                              size={17}
                              className="shrink-0 text-blue-500"
                            />

                            <span className="truncate text-sm font-semibold text-slate-800">
                              {indent.description}
                            </span>

                          </div>

                        </td>

                        {/* Quantity */}
                        <td className="px-5 py-5">

                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                            {indent.qty}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">

                          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                            Pending
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                updateStatus(indent, "Rejected")
                              }
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle size={15} />

                              {isUpdating
                                ? "Processing..."
                                : "Reject"}
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(indent, "Approved")
                              }
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle2 size={15} />

                              {isUpdating
                                ? "Processing..."
                                : "Approve"}
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

        {/* Information box */}
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">

          <div className="flex gap-3">

            <div className="mt-0.5 rounded-lg bg-blue-100 p-2 text-blue-600">
              <FileCheck2 size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Approval workflow
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Review each department request carefully before approving
                or rejecting it. Approved indents can continue through the
                procurement workflow.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default IndentApproval;