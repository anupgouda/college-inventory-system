import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

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

        {/* =================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            AUTHENTICATED APPLICATION
        ================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            {/* =================================================
                ROOT
            ================================================== */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/inventory/dashboard"
                  replace
                />
              }
            />


            {/* =================================================
                DASHBOARD
                ALL AUTHENTICATED USERS
            ================================================== */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "IT",
                    "Principal",
                    "Faculty",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/dashboard"
                element={<Dashboard />}
              />
            </Route>


            {/* =================================================
                INVENTORY
            ================================================== */}

            {/* Indent Master */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "Faculty",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/indent-master"
                element={<IndentMaster />}
              />
            </Route>


            {/* Indent Approval */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "Principal",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/indent-approval"
                element={<IndentApproval />}
              />
            </Route>


            {/* Asset Master */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "IT",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/asset-master"
                element={<AssetMaster />}
              />
            </Route>


            {/* Stock Entry */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "IT",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/stock-entry"
                element={<StockEntry />}
              />
            </Route>


            {/* Material Checkout */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "IT",
                    "Faculty",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/material-checkout"
                element={<MaterialCheckout />}
              />
            </Route>


            {/* =================================================
                PROCUREMENT
            ================================================== */}

            {/* Vendor Master */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/vendor-master"
                element={<VendorMaster />}
              />
            </Route>


            {/* Purchase Order */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/purchase-order"
                element={<PurchaseOrder />}
              />
            </Route>


            {/* Quotation */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/quotation"
                element={<Quotation />}
              />
            </Route>


            {/* Bill Master */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/bill-master"
                element={<BillMaster />}
              />
            </Route>


            {/* =================================================
                ANALYTICS
                ALL AUTHENTICATED USERS
            ================================================== */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "IT",
                    "Principal",
                    "Faculty",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/inventory/reports"
                element={<Reports />}
              />
            </Route>


            {/* =================================================
                SETTINGS
                ALL AUTHENTICATED USERS
            ================================================== */}

            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "HOD",
                    "IT",
                    "Principal",
                    "Faculty",
                    "Store Manager",
                  ]}
                />
              }
            >
              <Route
                path="/settings"
                element={<Settings />}
              />
            </Route>

          </Route>

        </Route>


        {/* =================================================
            UNKNOWN ROUTES
        ================================================== */}

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