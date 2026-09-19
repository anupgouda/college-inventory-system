import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Inventory/Dashboard";
import IndentMaster from "./pages/Inventory/IndentMaster";
import IndentApproval from "./pages/Inventory/IndentApproval";
import AssetMaster from "./pages/Inventory/AssetMaster";
import StockEntry from "./pages/Inventory/StockEntry";
import MaterialCheckout from "./pages/Inventory/MaterialCheckout";
import VendorMaster from "./pages/Inventory/VendorMaster";
import PurchaseOrder from "./pages/Inventory/PurchaseOrder";
import Quotation from "./pages/Inventory/Quotation";
import BillMaster from "./pages/Inventory/BillMaster";
import Reports from "./pages/Inventory/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            MAIN APPLICATION LAYOUT
            Sidebar + Header + Page Content
        ================================================= */}

        <Route element={<MainLayout />}>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/inventory/dashboard"
            element={<Dashboard />}
          />

          {/* Inventory */}
          <Route
            path="/inventory/indent-master"
            element={<IndentMaster />}
          />

          <Route
            path="/inventory/indent-approval"
            element={<IndentApproval />}
          />

          <Route
            path="/inventory/asset-master"
            element={<AssetMaster />}
          />

          <Route
            path="/inventory/stock-entry"
            element={<StockEntry />}
          />

          <Route
            path="/inventory/material-checkout"
            element={<MaterialCheckout />}
          />

          <Route
            path="/inventory/vendor-master"
            element={<VendorMaster />}
          />

          <Route
            path="/inventory/purchase-order"
            element={<PurchaseOrder />}
          />

          <Route
            path="/inventory/quotation"
            element={<Quotation />}
          />

          <Route
            path="/inventory/bill-master"
            element={<BillMaster />}
          />

          <Route
            path="/inventory/reports"
            element={<Reports />}
          />

          {/* =================================================
              SETTINGS
              IMPORTANT:
              Must be INSIDE MainLayout
          ================================================= */}

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/inventory/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;