import { apiFetch } from "../../utils/api";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  Building2,
  CalendarDays,
  Package,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock3,
  X,
} from "lucide-react";


type Vendor = {
  id: number;
  vendorCode: string;
  vendorName: string;
};

type Quotation = {
  id: number;
  quotationNumber: string;
  vendorId: number;
  vendorCode?: string;
  vendorName?: string;
  quotationDate: string;
  itemName: string;
  quantity: number;
  unitPrice: string | number;
  totalAmount: string | number;
  validUntil?: string;
  status: "Pending" | "Approved" | "Rejected" | "Expired";
  notes?: string;
};

type QuotationForm = {
  quotationNumber: string;
  vendorId: string;
  quotationDate: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  validUntil: string;
  notes: string;
};

const initialForm: QuotationForm = {
  quotationNumber: "",
  vendorId: "",
  quotationDate: new Date().toISOString().split("T")[0],
  itemName: "",
  quantity: "",
  unitPrice: "",
  validUntil: "",
  notes: "",
};

function Quotation() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [form, setForm] = useState<QuotationForm>(initialForm);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState("");

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/quotations");

      if (!response.ok) {
        throw new Error("Failed to load quotations");
      }

      const data = await response.json();

      setQuotations(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load quotations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await apiFetch("/api/vendors");

      if (!response.ok) {
        throw new Error("Failed to load vendors");
      }

      const data = await response.json();

      setVendors(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchVendors();
  }, []);

  const totalQuotationValue = useMemo(() => {
    return quotations.reduce(
      (sum, quotation) => sum + Number(quotation.totalAmount || 0),
      0
    );
  }, [quotations]);

  const pendingCount = quotations.filter(
    (quotation) => quotation.status === "Pending"
  ).length;

  const approvedCount = quotations.filter(
    (quotation) => quotation.status === "Approved"
  ).length;

  const rejectedCount = quotations.filter(
    (quotation) => quotation.status === "Rejected"
  ).length;

  const calculatedTotal =
    Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(parsed);
  };

  const getStatusClasses = (status: Quotation["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "Expired":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.quotationNumber.trim()) {
      setError("Quotation number is required.");
      return;
    }

    if (!form.vendorId) {
      setError("Please select a vendor.");
      return;
    }

    if (!form.itemName.trim()) {
      setError("Item name is required.");
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (Number(form.unitPrice) < 0) {
      setError("Unit price cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await apiFetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotationNumber: form.quotationNumber.trim(),
          vendorId: Number(form.vendorId),
          quotationDate: form.quotationDate || null,
          itemName: form.itemName.trim(),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          validUntil: form.validUntil || null,
          notes: form.notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create quotation");
      }

      await fetchQuotations();

      closeModal();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create quotation."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      const response = await apiFetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      await fetchQuotations();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update quotation status."
      );
    }
  };

  const deleteQuotation = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quotation?"
    );

    if (!confirmed) return;

    try {
      const response = await apiFetch(`/api/quotations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete quotation");
      }

      await fetchQuotations();
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete quotation."
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-82px)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">

        {/* Page Intro */}
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Procurement
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Quotation Master
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Manage vendor quotations, compare pricing, and control quotation
              approvals.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchQuotations}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              New Quotation
            </button>
          </div>
        </div>

        {/* Error */}
        {error && !showModal && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pendingCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Awaiting approval
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Approved
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {approvedCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Approved quotations
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Rejected
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {rejectedCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Rejected quotations
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Value
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalQuotationValue)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  All quotations
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <IndianRupee size={21} />
              </div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Quotation Register
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {quotations.length} quotation
                {quotations.length === 1 ? "" : "s"} registered
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileText size={15} />
              Vendor quotation records
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading quotations...
              </div>
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <FileText size={30} />
              </div>

              <h3 className="font-bold text-slate-800">
                No quotations found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create your first vendor quotation to start managing
                procurement quotations.
              </p>

              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Create Quotation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quotation
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Vendor
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Item
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Qty
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Unit Price
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Valid Until
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {quotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="transition hover:bg-slate-50/80"
                    >

                      {/* Quotation */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <FileText size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {quotation.quotationNumber}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatDate(quotation.quotationDate)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={16}
                            className="text-slate-400"
                          />

                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {quotation.vendorName || "—"}
                            </p>

                            {quotation.vendorCode && (
                              <p className="text-xs text-slate-400">
                                {quotation.vendorCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Item */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Package
                            size={16}
                            className="text-slate-400"
                          />

                          <span className="text-sm font-medium text-slate-700">
                            {quotation.itemName}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {quotation.quantity}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {formatCurrency(quotation.unitPrice)}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          {formatCurrency(quotation.totalAmount)}
                        </span>
                      </td>

                      {/* Valid Until */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {formatDate(quotation.validUntil)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                            quotation.status
                          )}`}
                        >
                          {quotation.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          {quotation.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(
                                    quotation.id,
                                    "Approved"
                                  )
                                }
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  updateStatus(
                                    quotation.id,
                                    "Rejected"
                                  )
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              deleteQuotation(quotation.id)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete quotation"
                          >
                            <Trash2 size={15} />
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
        <div className="mt-5 flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <span>
            Quotation Master • College Inventory Management System
          </span>

          <span>
            {quotations.length} quotation
            {quotations.length === 1 ? "" : "s"} in register
          </span>
        </div>

      </div>

      {/* Create Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <FileText size={18} />
                  </div>

                  <h2 className="font-bold text-slate-900">
                    New Quotation
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Add a vendor quotation to the procurement register.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-6">

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Quotation Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Quotation Number *
                  </label>

                  <input
                    type="text"
                    value={form.quotationNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quotationNumber: e.target.value,
                      })
                    }
                    placeholder="QUO002"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Vendor *
                  </label>

                  <select
                    value={form.vendorId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        vendorId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Select vendor</option>

                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.vendorCode} — {vendor.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quotation Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Quotation Date
                  </label>

                  <input
                    type="date"
                    value={form.quotationDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quotationDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Valid Until
                  </label>

                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        validUntil: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Item */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Item Name *
                  </label>

                  <input
                    type="text"
                    value={form.itemName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        itemName: e.target.value,
                      })
                    }
                    placeholder="A4 Size 75gsm Xerox Paper"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="100"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Unit Price *
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          unitPrice: e.target.value,
                        })
                      }
                      placeholder="5.25"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Calculated Total */}
                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                          Calculated Total
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {formatCurrency(calculatedTotal)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                        <IndianRupee size={21} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Additional quotation details..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Quotation
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default Quotation;