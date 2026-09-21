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

/*
========================================================
ROLE DEFINITIONS
========================================================
*/

const ALL_ROLES: UserRole[] = [
  "Admin",
  "HOD",
  "IT",
  "Principal",
  "Faculty",
  "Store Manager",
];

/*
========================================================
MENU GROUPS
========================================================
*/

const menuGroups: MenuGroup[] = [
  {
    title: "OVERVIEW",

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
    title: "INVENTORY",

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

        roles: [
          "Admin",
          "Store Manager",
        ],
      },

      {
        name: "Purchase Order",
        path: "/inventory/purchase-order",
        icon: ShoppingCart,

        roles: [
          "Admin",
          "Store Manager",
        ],
      },

      {
        name: "Quotation",
        path: "/inventory/quotation",
        icon: FileCheck2,

        roles: [
          "Admin",
          "Store Manager",
        ],
      },

      {
        name: "Bill Master",
        path: "/inventory/bill-master",
        icon: Receipt,

        roles: [
          "Admin",
          "Store Manager",
        ],
      },
    ],
  },

  {
    title: "ANALYTICS",

    items: [
      {
        name: "Reports",
        path: "/inventory/reports",
        icon: BarChart3,

        roles: [
          "Admin",
          "HOD",
          "IT",
          "Principal",
          "Faculty",
          "Store Manager",
        ],
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

/*
========================================================
SAFE USER READER
========================================================
*/

function getStoredUser(): StoredUser | null {
  try {
    const storedUser =
      localStorage.getItem("user");

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

/*
========================================================
INITIALS
========================================================
*/

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

/*
========================================================
SIDEBAR
========================================================
*/

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

  /*
  ======================================================
  LOAD USER
  ======================================================
  */

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

  /*
  ======================================================
  ROLE
  ======================================================
  */

  const currentRole =
    currentUser?.role || "Faculty";

  /*
  ======================================================
  FILTER MENU BY ROLE
  ======================================================
  */

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

  /*
  ======================================================
  TOGGLE GROUP
  ======================================================
  */

  const toggleGroup = (
    title: string
  ) => {
    setCollapsedGroups(
      (previous) => ({
        ...previous,

        [title]:
          !previous[title],
      })
    );
  };

  /*
  ======================================================
  USER INFORMATION
  ======================================================
  */

  const userName =
    currentUser?.full_name ||
    "User";

  const userRole =
    currentUser?.role ||
    "Faculty";

  const userDepartment =
    currentUser?.department ||
    "—";

  const initials =
    getInitials(userName);

  /*
  ======================================================
  RETURN
  ======================================================
  */

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
          ================================================= */}

      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[270px]
          flex-col overflow-hidden
          border-r border-slate-800/80
          bg-[#0b1220]
          text-white
          shadow-2xl
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

        <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-white/10 px-5">

          <div className="flex items-center gap-3">

            {/* Logo */}

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Boxes
                size={22}
                strokeWidth={2.2}
              />
            </div>

            <div>

              <h1 className="text-[15px] font-bold tracking-wide">
                College Inventory
              </h1>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Management System
              </p>

            </div>

          </div>

          {/* Mobile close */}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}

        </div>

        {/* =================================================
            USER ROLE / SYSTEM STATUS
            ================================================= */}

        <div className="mx-4 mt-5 rounded-xl border border-white/5 bg-white/[0.035] px-3 py-3">

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />

            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold text-slate-300">
                System Online
              </p>

              <p className="truncate text-[10px] text-slate-500">
                {currentRole} Access
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="sidebar-scroll mt-5 flex-1 overflow-y-auto px-3 pb-5">

          {visibleMenuGroups.map(
            (group) => {

              const isCollapsed =
                collapsedGroups[
                  group.title
                ];

              return (
                <div
                  key={group.title}
                  className="mb-5"
                >

                  {/* GROUP HEADER */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(
                        group.title
                      )
                    }
                    className="mb-2 flex w-full items-center justify-between px-3"
                  >

                    <span className="text-[10px] font-bold tracking-[0.18em] text-slate-500">
                      {group.title}
                    </span>

                    {isCollapsed ? (
                      <ChevronRight
                        size={13}
                        className="text-slate-600"
                      />
                    ) : (
                      <ChevronDown
                        size={13}
                        className="text-slate-600"
                      />
                    )}

                  </button>

                  {/* MENU ITEMS */}

                  {!isCollapsed && (
                    <div className="space-y-1">

                      {group.items.map(
                        (item) => {

                          const Icon =
                            item.icon;

                          return (
                            <NavLink
                              key={
                                item.path
                              }
                              to={
                                item.path
                              }
                              onClick={
                                onClose
                              }
                              className={({
                                isActive,
                              }) =>
                                `
                                group relative flex items-center gap-3
                                rounded-xl px-3 py-2.5
                                text-[13px] font-medium
                                transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-sm"
                                    : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100"
                                }
                                `
                              }
                            >

                              {({
                                isActive,
                              }) => (
                                <>
                                  {/* Active indicator */}

                                  {isActive && (
                                    <span className="absolute left-0 h-6 w-[3px] rounded-r-full bg-blue-500" />
                                  )}

                                  {/* Icon */}

                                  <div
                                    className={`
                                      flex h-8 w-8 shrink-0 items-center justify-center
                                      rounded-lg transition
                                      ${
                                        isActive
                                          ? "bg-blue-500/15 text-blue-400"
                                          : "bg-white/[0.035] text-slate-500 group-hover:bg-white/[0.07] group-hover:text-slate-300"
                                      }
                                    `}
                                  >

                                    <Icon
                                      size={17}
                                      strokeWidth={
                                        1.9
                                      }
                                    />

                                  </div>

                                  {/* Name */}

                                  <span className="flex-1">
                                    {item.name}
                                  </span>

                                  {/* Active arrow */}

                                  {isActive && (
                                    <ChevronRight
                                      size={
                                        15
                                      }
                                      className="text-blue-400"
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
            BOTTOM
            ================================================= */}

        <div className="shrink-0 border-t border-white/10 p-3">

          {/* Settings */}

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `
              mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5
              text-[13px] font-medium transition
              ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
              }
              `
            }
          >

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035]">
              <Settings size={17} />
            </div>

            <span>
              Settings
            </span>

          </NavLink>

          {/* User */}

          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-3">

            {/* Avatar */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold">
              {initials}
            </div>

            {/* User details */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-semibold text-slate-200">
                {userName}
              </p>

              <p className="truncate text-[10px] text-slate-500">
                {userRole}
                {userDepartment !==
                  "—" &&
                  ` • ${userDepartment}`}
              </p>

            </div>

            {/* Online */}

            <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

          </div>

        </div>

      </aside>

      {/* =================================================
          SCROLLBAR STYLE
          ================================================= */}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
      `}</style>
    </>
  );
}

export default Sidebar;