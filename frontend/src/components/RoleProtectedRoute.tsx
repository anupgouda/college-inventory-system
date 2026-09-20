import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

type UserRole =
  | "Admin"
  | "HOD"
  | "IT"
  | "Principal"
  | "Faculty"
  | "Store Manager";

type StoredUser = {
  role?: UserRole | string;
  is_demo?: boolean;
};

type RoleProtectedRouteProps = {
  allowedRoles: UserRole[];
  children?: ReactNode;
};

function getStoredUser(): StoredUser | null {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read authenticated user:",
      error
    );

    return null;
  }
}

function RoleProtectedRoute({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = getStoredUser();

  /*
   * No authentication
   */
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  const userRole = user.role;

  /*
   * Invalid/missing role
   */
  if (!userRole) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * Role is not allowed
   */
  if (
    !allowedRoles.includes(
      userRole as UserRole
    )
  ) {
    return (
      <Navigate
        to="/inventory/dashboard"
        replace
      />
    );
  }

  /*
   * Allow nested routes
   */
  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;