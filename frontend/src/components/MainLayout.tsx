import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/":
      case "/inventory/dashboard":
        return {
          title: "Dashboard",
          description:
            "Overview of your college inventory management system",
          section: "Overview",
        };

      case "/inventory/indent-master":
        return {
          title: "Indent Master",
          description:
            "Create and manage department indent requests",
          section: "Inventory",
        };

      case "/inventory/indent-approval":
        return {
          title: "Indent Approval",
          description:
            "Review and approve department indent requests",
          section: "Inventory",
        };

      case "/inventory/asset-master":
        return {
          title: "Asset Master",
          description:
            "Manage and track college assets",
          section: "Inventory",
        };

      case "/inventory/stock-entry":
        return {
          title: "Stock Entry",
          description:
            "Manage incoming stock and inventory quantities",
          section: "Inventory",
        };

      case "/inventory/material-checkout":
        return {
          title: "Material Checkout",
          description:
            "Track materials issued to departments",
          section: "Inventory",
        };

      case "/inventory/vendor-master":
        return {
          title: "Vendor Master",
          description:
            "Manage registered suppliers and vendors",
          section: "Procurement",
        };

      case "/inventory/purchase-order":
        return {
          title: "Purchase Orders",
          description:
            "Create and manage purchase orders",
          section: "Procurement",
        };

      case "/inventory/quotation":
        return {
          title: "Quotations",
          description:
            "Manage vendor quotations and approvals",
          section: "Procurement",
        };

      case "/inventory/bill-master":
        return {
          title: "Bill Master",
          description:
            "Manage vendor bills and payments",
          section: "Procurement",
        };

      case "/inventory/reports":
        return {
          title: "Reports",
          description:
            "Generate inventory and procurement reports",
          section: "Analytics",
        };

      default:
        return {
          title: "College Inventory",
          description:
            "Inventory management system",
          section: "System",
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="min-h-screen lg:ml-[270px]">

        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="ml-3">

            <p className="text-sm font-bold text-slate-800">
              College Inventory
            </p>

            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Management System
            </p>

          </div>

        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header
            title={pageInfo.title}
            description={pageInfo.description}
            section={pageInfo.section}
          />
        </div>

        {/* Page */}
        <div className="min-h-[calc(100vh-82px)]">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default MainLayout;