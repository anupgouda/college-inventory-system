import { API_BASE_URL } from "../../config/api";
import { useState } from "react";
import {
  FileBarChart,
  RefreshCw,
  Printer,
  Download,
  CalendarDays,
  Database,
  IndianRupee,
  X,
} from "lucide-react";

const REPORT_API = `${API_BASE_URL}/api/reports`;

type ReportType =
  | "indentMaster"
  | "indentApproval"
  | "stockEntry"
  | "materialCheckout"
  | "assets"
  | "vendors"
  | "purchaseOrders"
  | "quotations"
  | "bills";

type ReportRow = Record<string, unknown>;

type ReportResponse = {
  success: boolean;
  count?: number;
  data?: ReportRow[];
  message?: string;
};

const reportOptions: {
  value: ReportType;
  label: string;
  description: string;
}[] = [
  {
    value: "indentMaster",
    label: "Indent Master",
    description: "Department indent requests",
  },
  {
    value: "indentApproval",
    label: "Indent Approval",
    description: "Approved and rejected indents",
  },
  {
    value: "stockEntry",
    label: "Stock Entry",
    description: "Incoming stock records",
  },
  {
    value: "materialCheckout",
    label: "Material Checkout",
    description: "Issued material records",
  },
  {
    value: "assets",
    label: "Asset Master",
    description: "College asset records",
  },
  {
    value: "vendors",
    label: "Vendor Master",
    description: "Registered vendors",
  },
  {
    value: "purchaseOrders",
    label: "Purchase Orders",
    description: "Purchase order records",
  },
  {
    value: "quotations",
    label: "Quotations",
    description: "Vendor quotation records",
  },
  {
    value: "bills",
    label: "Bills",
    description: "Vendor bill records",
  },
];

function Reports() {
  const today = new Date().toISOString().split("T")[0];

  const [reportType, setReportType] =
    useState<ReportType>("stockEntry");

  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(today);

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [reportCount, setReportCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  const [showReportSelector, setShowReportSelector] =
    useState(false);

  const selectedReport = reportOptions.find(
    (report) => report.value === reportType
  );

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        type: reportType,
        startDate,
        endDate,
      });

      const response = await fetch(`${REPORT_API}?${params}`);

      const result: ReportResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to generate report"
        );
      }

      const data = Array.isArray(result.data)
        ? result.data
        : [];

      setRows(data);
      setReportCount(
        typeof result.count === "number"
          ? result.count
          : data.length
      );

      setGenerated(true);
    } catch (err) {
      console.error(err);

      setRows([]);
      setReportCount(0);
      setGenerated(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate report."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: unknown) => {
    if (!value) return "—";

    const parsed = new Date(String(value));

    if (Number.isNaN(parsed.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(parsed);
  };

  const formatCurrency = (value: unknown) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value ?? "—");
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatCell = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("date") ||
      lowerKey.includes("_at")
    ) {
      return formatDate(value);
    }

    if (
      lowerKey.includes("price") ||
      lowerKey.includes("amount") ||
      lowerKey.includes("value") ||
      lowerKey.includes("total")
    ) {
      if (!Number.isNaN(Number(value))) {
        return formatCurrency(value);
      }
    }

    return String(value);
  };

  const getColumns = () => {
    if (rows.length === 0) return [];

    return Object.keys(rows[0]);
  };

  const getTotalAmount = () => {
    let total = 0;

    rows.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();

        if (
          lowerKey === "total_amount" ||
          lowerKey === "totalamount" ||
          lowerKey === "total_price" ||
          lowerKey === "totalprice"
        ) {
          const number = Number(value);

          if (!Number.isNaN(number)) {
            total += number;
          }
        }
      });
    });

    return total;
  };

  const totalAmount = getTotalAmount();

  const printReport = () => {
    window.print();
  };

  const exportCSV = () => {
    if (rows.length === 0) return;

    const columns = getColumns();

    const escapeCSV = (value: unknown) => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(escapeCSV).join(","),
      ...rows.map((row) =>
        columns
          .map((column) => escapeCSV(row[column]))
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${reportType}-report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-82px)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Analytics
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reports
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Generate inventory, procurement, asset, vendor, and
              transaction reports.
            </p>
          </div>

          <div className="flex gap-3">

            {generated && (
              <>
                <button
                  onClick={printReport}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Printer size={17} />
                  Print
                </button>

                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Download size={17} />
                  Export CSV
                </button>
              </>
            )}

            <button
              onClick={generateReport}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              {loading ? "Generating..." : "Generate Report"}
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileBarChart size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Report Configuration
              </h2>

              <p className="text-xs text-slate-500">
                Select a report and date range.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* Report Type */}
            <div className="lg:col-span-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Report Type
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowReportSelector(true)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedReport?.label}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {selectedReport?.description}
                    </p>
                  </div>

                  <FileBarChart
                    size={18}
                    className="text-slate-400"
                  />

                </div>
              </button>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Start Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                End Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Records
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {reportCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Records in report
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Database size={21} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Report
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {selectedReport?.label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Selected report type
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FileBarChart size={21} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Amount
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Where applicable
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <IndianRupee size={21} />
              </div>

            </div>
          </div>

        </div>

        {/* Report Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="font-bold text-slate-900">
                {selectedReport?.label}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {generated
                  ? `${reportCount} record${
                      reportCount === 1 ? "" : "s"
                    } • ${formatDate(startDate)} to ${formatDate(
                      endDate
                    )}`
                  : "Generate a report to view records"}
              </p>
            </div>

            {generated && (
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Report Generated
              </span>
            )}

          </div>

          {!generated ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <FileBarChart size={32} />
              </div>

              <h3 className="font-bold text-slate-800">
                Ready to generate
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Choose the report type and date range, then click
                Generate Report.
              </p>

              <button
                onClick={generateReport}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FileBarChart size={17} />
                Generate Report
              </button>

            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Database size={30} />
              </div>

              <h3 className="font-bold text-slate-800">
                No records found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                There are no records for this report within the
                selected date range.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-left">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    {getColumns().map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {column
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                      </th>
                    ))}

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="transition hover:bg-slate-50/80"
                    >

                      {getColumns().map((column) => (
                        <td
                          key={column}
                          className="whitespace-nowrap px-5 py-4 text-sm text-slate-600"
                        >
                          {formatCell(column, row[column])}
                        </td>
                      ))}

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
            Reports • College Inventory Management System
          </span>

          <span>
            Data generated from PostgreSQL
          </span>
        </div>

      </div>

      {/* Report Selector Modal */}
      {showReportSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

              <div>
                <h2 className="font-bold text-slate-900">
                  Select Report
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose the report you want to generate.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowReportSelector(false)
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">

              {reportOptions.map((report) => {
                const active =
                  report.value === reportType;

                return (
                  <button
                    key={report.value}
                    onClick={() => {
                      setReportType(report.value);
                      setShowReportSelector(false);
                      setGenerated(false);
                      setRows([]);
                      setReportCount(0);
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`rounded-lg p-2 ${
                          active
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <FileBarChart size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {report.label}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {report.description}
                        </p>
                      </div>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          button,
          nav,
          header {
            display: none !important;
          }

          .print\\\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}

export default Reports;