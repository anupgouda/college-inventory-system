import { apiFetch } from "../../utils/api";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Building2,
  UserRound,
  Mail,
  Phone,
  MapPin,
  FileText,
  X,
} from "lucide-react";

type Vendor = {
  id?: number;
  vendorCode: string;
  vendorName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
};


function VendorMaster() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    vendorCode: "",
    vendorName: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstNumber: "",
    address: "",
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/api/vendors");

      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await response.json();

      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch vendors error:", error);
      alert("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorCode.trim()) {
      alert("Please enter vendor code");
      return;
    }

    if (!formData.vendorName.trim()) {
      alert("Please enter vendor name");
      return;
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await apiFetch("/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorCode: formData.vendorCode.trim(),
          vendorName: formData.vendorName.trim(),
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          gstNumber: formData.gstNumber.trim(),
          address: formData.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create vendor"
        );
      }

      setFormData({
        vendorCode: "",
        vendorName: "",
        contactPerson: "",
        email: "",
        phone: "",
        gstNumber: "",
        address: "",
      });

      setShowForm(false);
      fetchVendors();
    } catch (error) {
      console.error("Create vendor error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create vendor"
      );
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!vendor.id) {
      alert("Vendor ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Delete vendor "${vendor.vendorName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await apiFetch(
        `/api/vendors/${vendor.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete vendor"
        );
      }

      fetchVendors();
    } catch (error) {
      console.error("Delete vendor error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete vendor"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Building2 size={16} />
              <span>Procurement</span>
              <span>/</span>
              <span className="font-medium text-slate-700">
                Vendor Master
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Vendor Master
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage registered suppliers and vendor information.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchVendors}
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
              Add Vendor
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Vendors
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {vendors.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Building2 size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Contact Records
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    vendors.filter(
                      (vendor) =>
                        vendor.contactPerson ||
                        vendor.phone ||
                        vendor.email
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <UserRound size={22} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  GST Registered
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    vendors.filter(
                      (vendor) =>
                        vendor.gstNumber &&
                        vendor.gstNumber.trim()
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <FileText size={22} />
              </div>

            </div>
          </div>

        </div>

        {/* Vendor table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Vendor Register
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Registered suppliers and their contact details
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {vendors.length} Records
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Loading vendors...
              </div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Building2 size={32} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No vendors found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add your first supplier to start managing vendor information.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Add Vendor
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Vendor
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contact Person
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      GST Number
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Address
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="transition hover:bg-slate-50/80"
                    >

                      {/* Vendor */}
                      <td className="px-5 py-5">

                        <div className="flex items-start gap-3">

                          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <Building2 size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {vendor.vendorName}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-blue-600">
                              {vendor.vendorCode}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Contact person */}
                      <td className="px-5 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <UserRound
                            size={15}
                            className="text-slate-400"
                          />

                          {vendor.contactPerson || "-"}
                        </div>

                      </td>

                      {/* Contact */}
                      <td className="px-5 py-5">

                        <div className="space-y-1.5">

                          {vendor.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail
                                size={14}
                                className="text-slate-400"
                              />
                              {vendor.email}
                            </div>
                          )}

                          {vendor.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone
                                size={14}
                                className="text-slate-400"
                              />
                              {vendor.phone}
                            </div>
                          )}

                          {!vendor.email &&
                            !vendor.phone && (
                              <span className="text-xs text-slate-400">
                                No contact information
                              </span>
                            )}

                        </div>

                      </td>

                      {/* GST */}
                      <td className="px-5 py-5">

                        {vendor.gstNumber ? (
                          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                            {vendor.gstNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not provided
                          </span>
                        )}

                      </td>

                      {/* Address */}
                      <td className="max-w-xs px-5 py-5">

                        <div className="flex items-start gap-2 text-sm text-slate-600">

                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span className="line-clamp-2">
                            {vendor.address || "-"}
                          </span>

                        </div>

                      </td>

                      {/* Action */}
                      <td className="px-5 py-5 text-right">

                        <button
                          onClick={() =>
                            handleDelete(vendor)
                          }
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Delete vendor"
                        >
                          <Trash2 size={17} />
                        </button>

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
          Vendor data synchronized with PostgreSQL
        </div>

      </div>

      {/* Add Vendor Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add New Vendor
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Register a supplier for procurement operations
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
                    Vendor Code
                  </label>

                  <input
                    type="text"
                    name="vendorCode"
                    value={formData.vendorCode}
                    onChange={handleChange}
                    placeholder="VEN003"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Vendor Name
                  </label>

                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    placeholder="ABC Office Supplies"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Contact Person
                  </label>

                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Rahul Kumar"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vendor@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    GST Number
                  </label>

                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Vendor address..."
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
                  Add Vendor
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default VendorMaster;