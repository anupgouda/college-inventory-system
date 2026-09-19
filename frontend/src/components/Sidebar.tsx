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
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/inventory/dashboard",
        icon: LayoutDashboard,
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
      },
      {
        name: "Indent Approval",
        path: "/inventory/indent-approval",
        icon: ClipboardCheck,
      },
      {
        name: "Asset Master",
        path: "/inventory/asset-master",
        icon: Package,
      },
      {
        name: "Stock Entry",
        path: "/inventory/stock-entry",
        icon: Warehouse,
      },
      {
        name: "Material Checkout",
        path: "/inventory/material-checkout",
        icon: ArrowLeftRight,
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
      },
      {
        name: "Purchase Order",
        path: "/inventory/purchase-order",
        icon: ShoppingCart,
      },
      {
        name: "Quotation",
        path: "/inventory/quotation",
        icon: FileCheck2,
      },
      {
        name: "Bill Master",
        path: "/inventory/bill-master",
        icon: Receipt,
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
      },
    ],
  },
];

function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups((previous) => ({
      ...previous,
      [title]: !previous[title],
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
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
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* --------------------------------------------- */}
        {/* BRAND */}
        {/* --------------------------------------------- */}

        <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-white/10 px-5">

          <div className="flex items-center gap-3">

            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Boxes size={22} strokeWidth={2.2} />
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
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          )}

        </div>

        {/* --------------------------------------------- */}
        {/* SYSTEM STATUS */}
        {/* --------------------------------------------- */}

        <div className="mx-4 mt-5 rounded-xl border border-white/5 bg-white/[0.035] px-3 py-3">

          <div className="flex items-center gap-3">

            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300">
                System Online
              </p>

              <p className="text-[10px] text-slate-500">
                PostgreSQL connected
              </p>
            </div>

          </div>

        </div>

        {/* --------------------------------------------- */}
        {/* NAVIGATION */}
        {/* --------------------------------------------- */}

        <nav className="sidebar-scroll mt-5 flex-1 overflow-y-auto px-3 pb-5">

          {menuGroups.map((group) => {

            const isCollapsed = collapsedGroups[group.title];

            return (
              <div key={group.title} className="mb-5">

                {/* GROUP HEADER */}

                <button
                  onClick={() => toggleGroup(group.title)}
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

                    {group.items.map((item) => {

                      const Icon = item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
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

                          {({ isActive }) => (
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
                                <Icon size={17} strokeWidth={1.9} />
                              </div>

                              {/* Name */}

                              <span className="flex-1">
                                {item.name}
                              </span>

                              {/* Active arrow */}

                              {isActive && (
                                <ChevronRight
                                  size={15}
                                  className="text-blue-400"
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}

                  </div>
                )}

              </div>
            );
          })}

        </nav>

        {/* --------------------------------------------- */}
        {/* BOTTOM */}
        {/* --------------------------------------------- */}

        <div className="shrink-0 border-t border-white/10 p-3">

          {/* Settings */}

          <NavLink
            to="/settings"
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

            <span>Settings</span>
          </NavLink>

          {/* User */}

          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold">
              A
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-semibold text-slate-200">
                Administrator
              </p>

              <p className="truncate text-[10px] text-slate-500">
                Inventory Admin
              </p>

            </div>

            <div className="h-2 w-2 rounded-full bg-emerald-400" />

          </div>

        </div>

      </aside>

      {/* --------------------------------------------- */}
      {/* SCROLLBAR STYLE */}
      {/* --------------------------------------------- */}

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