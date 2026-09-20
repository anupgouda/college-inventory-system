import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
};

type CurrentUser = {
  id?: number;
  full_name?: string;
  email?: string;
  role?: string;
};

const roles = [
  "Admin",
  "HOD",
  "IT",
  "Principal",
  "Faculty",
  "Store Manager",
];

const departments = [
  "AIML",
  "CSE",
  "ISE",
  "AIDS",
  "ECE",
  "EEE",
  "ME",
  "CS",
  "IT",
  "Administration",
  "Stores",
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [message, setMessage] = useState("");

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Faculty",
    department: "",
  });

  // ====================================================
  // LOAD USERS
  // ====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/api/users");

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message || "Failed to fetch users"
        );
      }

      const data = await response.json();

      setUsers(data.data || []);
    } catch (error) {
      console.error("Fetch users error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOAD CURRENT USER
  // ====================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Failed to read current user:",
        error
      );
    }

    fetchUsers();
  }, []);

  // ====================================================
  // FORM CHANGE
  // ====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ====================================================
  // CREATE USER
  // ====================================================

  const handleCreateUser = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setCreating(true);
      setMessage("");

      const response = await apiFetch(
        "/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create user"
        );
      }

      setMessage(
        "User created successfully"
      );

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "Faculty",
        department: "",
      });

      await fetchUsers();
    } catch (error) {
      console.error(
        "Create user error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create user"
      );
    } finally {
      setCreating(false);
    }
  };

  // ====================================================
  // ACTIVATE / DEACTIVATE USER
  // ====================================================

  const handleToggleStatus = async (
    user: User
  ) => {
    const action = user.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.full_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(user.id);
      setMessage("");

      const response = await apiFetch(
        `/api/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !user.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action} user`
        );
      }

      setMessage(data.message);

      await fetchUsers();
    } catch (error) {
      console.error(
        `${action} user error:`,
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : `Failed to ${action} user`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // DELETE USER
  // ====================================================

  const handleDeleteUser = async (
    user: User
  ) => {
    const confirmed = window.confirm(
      `Delete ${user.full_name} (${user.email}) permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(user.id);
      setMessage("");

      const response = await apiFetch(
        `/api/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user"
        );
      }

      setMessage(data.message);

      await fetchUsers();
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          User Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage system users, roles and departments
        </p>
      </div>

      {/* =================================================
          CREATE USER + USERS TABLE
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* =================================================
            CREATE USER
        ================================================== */}

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <h2 className="text-xl font-semibold text-slate-900">
            Create User
          </h2>

          <p className="mt-1 mb-5 text-sm text-slate-500">
            Only administrators can create users.
          </p>

          <form
            onSubmit={handleCreateUser}
            className="space-y-4"
          >

            {/* Full Name */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@college.com"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Temporary Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Role
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {roles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Department
              </label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Message */}

            {message && (
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {message}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating
                ? "Creating User..."
                : "Create User"}
            </button>

          </form>
        </div>

        {/* =================================================
            USERS TABLE
        ================================================== */}

        <div className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          {/* Table Header */}

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                System Users
              </h2>

              <p className="text-sm text-slate-500">
                {users.length} registered users
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

          </div>

          {/* Loading */}

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      User
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Role
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Department
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Type
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => {

                    const isProcessing =
                      actionLoading === user.id;

                    const isCurrentUser =
                      currentUser?.id === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        {/* USER */}

                        <td className="px-4 py-4">

                          <div className="font-medium text-slate-900">
                            {user.full_name}
                          </div>

                          <div className="text-sm text-slate-500">
                            {user.email}
                          </div>

                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-4">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {user.role}
                          </span>

                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {user.department || "—"}
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* TYPE */}

                        <td className="px-4 py-4">

                          {user.is_demo ? (
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              Demo
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">
                              Regular
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            {isCurrentUser ? (

                              <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                                Current Account
                              </span>

                            ) : (

                              <>

                                {/* ACTIVATE / DEACTIVATE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(
                                      user
                                    )
                                  }
                                  disabled={isProcessing}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    user.is_active
                                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                      : "bg-green-50 text-green-700 hover:bg-green-100"
                                  }`}
                                >
                                  {isProcessing
                                    ? "Processing..."
                                    : user.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user
                                    )
                                  }
                                  disabled={isProcessing}
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Delete
                                </button>

                              </>

                            )}

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

      </div>
    </div>
  );
}