import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

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

        {/* ================================
            PUBLIC ROUTES
        ================================= */}

        <Route path="/login" element={<Login />} />


        {/* ================================
            PROTECTED APPLICATION
        ================================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            {/* Dashboard */}
            <Route
  path="/"
  element={<Navigate to="/login" replace />}
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


            {/* Procurement */}

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


            {/* Analytics */}

            <Route
              path="/inventory/reports"
              element={<Reports />}
            />


            {/* Settings */}

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>

        </Route>


        {/* ================================
            UNKNOWN ROUTES
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;