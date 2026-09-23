import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Package,
  Warehouse,
  ArrowLeftRight,
  Building2,
  ShoppingCart,
  FileCheck2,
  Receipt,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  Boxes,
  Settings,
  Users,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type UserRole =
  | "Admin"
  | "HOD"
  | "IT"
  | "Principal"
  | "Faculty"
  | "Store Manager";

type StoredUser = {
  id?: number;
  full_name?: string;
  email?: string;
  role?: UserRole | string;
  department?: string;
  is_demo?: boolean;
};

type MenuItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

/* ========================================================
   ROLES
======================================================== */

const ALL_ROLES: UserRole[] = [
  "Admin",
  "HOD",
  "IT",
  "Principal",
  "Faculty",
  "Store Manager",
];

/* ========================================================
   MENU
======================================================== */

const menuGroups: MenuGroup[] = [
  {
    title: "HOME",
    items: [
      {
        name: "Dashboard",
        path: "/inventory/dashboard",
        icon: LayoutDashboard,
        roles: ALL_ROLES,
      },
    ],
  },

  {
    title: "OPERATIONS",
    items: [
      {
        name: "Indent Master",
        path: "/inventory/indent-master",
        icon: FileText,
        roles: [
          "Admin",
          "HOD",
          "Faculty",
          "Store Manager",
        ],
      },

      {
        name: "Indent Approval",
        path: "/inventory/indent-approval",
        icon: ClipboardCheck,
        roles: [
          "Admin",
          "HOD",
          "Principal",
          "Store Manager",
        ],
      },

      {
        name: "Asset Master",
        path: "/inventory/asset-master",
        icon: Package,
        roles: [
          "Admin",
          "HOD",
          "IT",
          "Store Manager",
        ],
      },

      {
        name: "Stock Entry",
        path: "/inventory/stock-entry",
        icon: Warehouse,
        roles: [
          "Admin",
          "IT",
          "Store Manager",
        ],
      },

      {
        name: "Material Checkout",
        path: "/inventory/material-checkout",
        icon: ArrowLeftRight,
        roles: [
          "Admin",
          "HOD",
          "IT",
          "Faculty",
          "Store Manager",
        ],
      },
    ],
  },

  {
    title: "PROCUREMENT",
    items: [
      {
        name: "Vendor Master",
        path: "/inventory/vendor-master",
        icon: Building2,
        roles: ["Admin", "Store Manager"],
      },

      {
        name: "Purchase Order",
        path: "/inventory/purchase-order",
        icon: ShoppingCart,
        roles: ["Admin", "Store Manager"],
      },

      {
        name: "Quotation",
        path: "/inventory/quotation",
        icon: FileCheck2,
        roles: ["Admin", "Store Manager"],
      },

      {
        name: "Bill Master",
        path: "/inventory/bill-master",
        icon: Receipt,
        roles: ["Admin", "Store Manager"],
      },
    ],
  },

  {
    title: "INSIGHTS",
    items: [
      {
        name: "Reports",
        path: "/inventory/reports",
        icon: BarChart3,
        roles: ALL_ROLES,
      },
    ],
  },

  {
    title: "ADMINISTRATION",
    items: [
      {
        name: "User Management",
        path: "/inventory/users",
        icon: Users,
        roles: ["Admin"],
      },
    ],
  },
];

/* ========================================================
   USER
======================================================== */

function getStoredUser(): StoredUser | null {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read user from localStorage:",
      error
    );

    return null;
  }
}

/* ========================================================
   INITIALS
======================================================== */

function getInitials(name?: string) {
  if (!name) {
    return "U";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

/* ========================================================
   SIDEBAR
======================================================== */

function Sidebar({
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] =
    useState<Record<string, boolean>>({});

  const [currentUser, setCurrentUser] =
    useState<StoredUser | null>(
      getStoredUser()
    );

  /* ======================================================
     LOAD USER
  ====================================================== */

  useEffect(() => {
    const loadUser = () => {
      setCurrentUser(getStoredUser());
    };

    loadUser();

    window.addEventListener(
      "storage",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadUser
      );
    };
  }, []);

  /* ======================================================
     ROLE
  ====================================================== */

  const currentRole =
    currentUser?.role || "Faculty";

  /* ======================================================
     FILTER MENU
  ====================================================== */

  const visibleMenuGroups = useMemo(() => {
    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.roles.includes(
              currentRole as UserRole
            )
        ),
      }))
      .filter(
        (group) => group.items.length > 0
      );
  }, [currentRole]);

  /* ======================================================
     TOGGLE
  ====================================================== */

  const toggleGroup = (title: string) => {
    setCollapsedGroups((previous) => ({
      ...previous,
      [title]: !previous[title],
    }));
  };

  /* ======================================================
     USER INFO
  ====================================================== */

  const userName =
    currentUser?.full_name || "User";

  const userRole =
    currentUser?.role || "Faculty";

  const userDepartment =
    currentUser?.department || "—";

  const initials =
    getInitials(userName);

  const isDemoUser =
    currentUser?.is_demo === true;

  /* ======================================================
     RETURN
  ====================================================== */

  return (
    <>
      {/* MOBILE OVERLAY */}

      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[272px]
          flex-col
          overflow-hidden
          border-r border-slate-200
          bg-white
          text-slate-900
          shadow-[8px_0_30px_rgba(15,23,42,0.04)]
          transition-transform duration-300
          lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-slate-100 px-5">

          <div className="flex items-center gap-3">

            {/* LOGO */}

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
              <Boxes
                size={21}
                strokeWidth={2.2}
                className="text-white"
              />
            </div>

            {/* BRAND */}

            <div>
              <h1 className="text-[15px] font-extrabold tracking-[-0.02em] text-slate-950">
                College Inventory
              </h1>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Management System
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE */}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={19} />
            </button>
          )}
        </div>

        {/* =================================================
            USER / SYSTEM STATUS
        ================================================= */}

        <div className="px-4 pt-5">

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">

            <div className="flex items-center gap-3">

              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">

                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-30" />
              </div>

              <div className="min-w-0">

                <p className="text-[11px] font-bold text-slate-800">
                  System Online
                </p>

                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                  {currentRole} Access
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-scroll mt-6 flex-1 overflow-y-auto px-4 pb-5">

          {visibleMenuGroups.map(
            (group) => {

              const isCollapsed =
                collapsedGroups[
                  group.title
                ];

              return (
                <div
                  key={group.title}
                  className="mb-6"
                >

                  {/* GROUP TITLE */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(
                        group.title
                      )
                    }
                    className="mb-2 flex w-full items-center justify-between px-2"
                  >

                    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      {group.title}
                    </span>

                    {isCollapsed ? (
                      <ChevronRight
                        size={13}
                        className="text-slate-300"
                      />
                    ) : (
                      <ChevronDown
                        size={13}
                        className="text-slate-300"
                      />
                    )}

                  </button>

                  {/* ITEMS */}

                  {!isCollapsed && (
                    <div className="space-y-1">

                      {group.items.map(
                        (item) => {

                          const Icon =
                            item.icon;

                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={
                                onClose
                              }
                              className={({
                                isActive,
                              }) =>
                                `
                                group relative flex items-center gap-3
                                rounded-2xl px-3 py-2.5
                                text-[13px] font-semibold
                                transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                                }
                                `
                              }
                            >
                              {({
                                isActive,
                              }) => (
                                <>
                                  {/* ICON */}

                                  <div
                                    className={`
                                      flex h-9 w-9 shrink-0
                                      items-center justify-center
                                      rounded-xl
                                      transition-all duration-200
                                      ${
                                        isActive
                                          ? "bg-white/10 text-white"
                                          : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-700"
                                      }
                                    `}
                                  >
                                    <Icon
                                      size={17}
                                      strokeWidth={
                                        2
                                      }
                                    />
                                  </div>

                                  {/* NAME */}

                                  <span className="flex-1">
                                    {item.name}
                                  </span>

                                  {/* ACTIVE INDICATOR */}

                                  {isActive && (
                                    <ChevronRight
                                      size={15}
                                      className="text-white/60"
                                    />
                                  )}
                                </>
                              )}
                            </NavLink>
                          );
                        }
                      )}

                    </div>
                  )}
                </div>
              );
            }
          )}
        </nav>

        {/* =================================================
            BOTTOM AREA
        ================================================= */}

        <div className="shrink-0 border-t border-slate-100 bg-white p-4">

          {/* SETTINGS */}

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `
              mb-3 flex items-center gap-3
              rounded-2xl px-3 py-2.5
              text-[13px] font-semibold
              transition
              ${
                isActive
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }
              `
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Settings
                size={17}
                strokeWidth={2}
              />
            </div>

            <span>Settings</span>
          </NavLink>

          {/* USER CARD */}

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">

            <div className="flex items-center gap-3">

              {/* AVATAR */}

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-extrabold text-white shadow-md shadow-blue-600/15">

                {initials}

                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              {/* DETAILS */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-1.5">

                  <p className="truncate text-xs font-bold text-slate-900">
                    {userName}
                  </p>

                  {isDemoUser && (
                    <Sparkles
                      size={12}
                      className="shrink-0 text-violet-500"
                    />
                  )}
                </div>

                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                  {userRole}
                  {userDepartment !==
                    "—" &&
                    ` • ${userDepartment}`}
                </p>

              </div>

            </div>

          </div>

        </div>
      </aside>

      {/* =================================================
          SCROLLBAR
      ================================================= */}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.18);
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.30);
        }
      `}</style>
    </>
  );
}

export default Sidebar;