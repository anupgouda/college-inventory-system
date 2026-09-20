import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  LogOut,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getInventoryNotifications,
  isNotificationRead,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type InventoryNotification,
} from "../utils/notifications";

import {
  NOTIFICATION_REFRESH_EVENT,
} from "../utils/notificationEvents";

type HeaderProps = {
  title?: string;
  description?: string;
  section?: string;
};

type StoredUser = {
  id?: number;
  full_name?: string;
  email?: string;
  role?: string;
  department?: string;
  is_demo?: boolean;
};

function formatNotificationTime(
  dateString: string
) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  const hours = Math.floor(
    difference / 3600000
  );

  const days = Math.floor(
    difference / 86400000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNotificationIcon(
  type: InventoryNotification["type"]
) {
  switch (type) {
    case "stock":
      return <Package size={17} />;

    case "approval":
      return <ClipboardCheck size={17} />;

    case "procurement":
      return <ShoppingCart size={17} />;

    default:
      return <Bell size={17} />;
  }
}

function getNotificationIconClass(
  type: InventoryNotification["type"]
) {
  switch (type) {
    case "stock":
      return "bg-amber-100 text-amber-700";

    case "approval":
      return "bg-blue-100 text-blue-700";

    case "procurement":
      return "bg-violet-100 text-violet-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getNotificationLabel(
  type: InventoryNotification["type"]
) {
  switch (type) {
    case "stock":
      return "Stock";

    case "approval":
      return "Approval";

    case "procurement":
      return "Procurement";

    default:
      return "Notification";
  }
}

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
      "Failed to read stored user:",
      error
    );

    return null;
  }
}

function getInitials(
  name?: string
) {
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

export default function Header({
  title,
  description,
  section,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  const profileRef =
    useRef<HTMLDivElement | null>(null);

  const [notifications, setNotifications] =
    useState<InventoryNotification[]>([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [
    loadingNotifications,
    setLoadingNotifications,
  ] = useState(false);

  const [currentUser, setCurrentUser] =
    useState<StoredUser | null>(
      getStoredUser()
    );

  /*
   * ============================================
   * LOAD USER
   * ============================================
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
   * ============================================
   * LOAD NOTIFICATIONS
   * ============================================
   */

  async function loadNotifications() {
    setLoadingNotifications(true);

    try {
      const data =
        await getInventoryNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  /*
   * ============================================
   * INITIAL LOAD
   * ============================================
   */

  useEffect(() => {
    loadNotifications();

    const interval =
      window.setInterval(() => {
        loadNotifications();
      }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * ============================================
   * INSTANT NOTIFICATION REFRESH
   * ============================================
   */

  useEffect(() => {
    function handleNotificationRefresh() {
      loadNotifications();
    }

    window.addEventListener(
      NOTIFICATION_REFRESH_EVENT,
      handleNotificationRefresh
    );

    return () => {
      window.removeEventListener(
        NOTIFICATION_REFRESH_EVENT,
        handleNotificationRefresh
      );
    };
  }, []);

  /*
   * ============================================
   * CLOSE MENUS ON ROUTE CHANGE
   * ============================================
   */

  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /*
   * ============================================
   * CLOSE WHEN CLICKING OUTSIDE
   * ============================================
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ============================================
   * UNREAD COUNT
   * ============================================
   */

  const unreadNotifications = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !isNotificationRead(
          notification.id
        )
    );
  }, [notifications]);

  const unreadCount =
    unreadNotifications.length;

  /*
   * ============================================
   * GROUP NOTIFICATIONS
   * ============================================
   */

  const stockNotifications =
    notifications.filter(
      (notification) =>
        notification.type === "stock"
    );

  const approvalNotifications =
    notifications.filter(
      (notification) =>
        notification.type === "approval"
    );

  const procurementNotifications =
    notifications.filter(
      (notification) =>
        notification.type === "procurement"
    );

  /*
   * ============================================
   * CLICK NOTIFICATION
   * ============================================
   */

  function handleNotificationClick(
    notification: InventoryNotification
  ) {
    markNotificationAsRead(
      notification.id
    );

    if (notification.link) {
      navigate(notification.link);
    }

    setNotificationOpen(false);

    setNotifications((current) => [
      ...current,
    ]);
  }

  /*
   * ============================================
   * MARK ALL AS READ
   * ============================================
   */

  function handleMarkAllAsRead() {
    markAllNotificationsAsRead(
      notifications
    );

    setNotifications((current) => [
      ...current,
    ]);
  }

  /*
   * ============================================
   * LOGOUT
   * ============================================
   */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setProfileOpen(false);
    setNotificationOpen(false);

    navigate("/login", {
      replace: true,
    });
  }

  /*
   * ============================================
   * NOTIFICATION ITEM
   * ============================================
   */

  function renderNotification(
    notification: InventoryNotification
  ) {
    const read = isNotificationRead(
      notification.id
    );

    return (
      <button
        key={notification.id}
        type="button"
        onClick={() =>
          handleNotificationClick(
            notification
          )
        }
        className={`group flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition ${
          read
            ? "bg-white hover:bg-slate-50"
            : "bg-blue-50/60 hover:bg-blue-50"
        }`}
      >
        {/* Notification icon */}

        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClass(
            notification.type
          )}`}
        >
          {getNotificationIcon(
            notification.type
          )}
        </div>

        {/* Notification content */}

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <p
              className={`text-sm ${
                read
                  ? "font-medium text-slate-700"
                  : "font-bold text-slate-900"
              }`}
            >
              {notification.title}
            </p>

            {!read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            )}

          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {notification.message}
          </p>

          <div className="mt-2 flex items-center justify-between">

            <span className="text-[11px] font-medium text-slate-400">
              {formatNotificationTime(
                notification.createdAt
              )}
            </span>

            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 opacity-0 transition group-hover:opacity-100">

              {getNotificationLabel(
                notification.type
              )}

              <ChevronRight size={12} />

            </span>

          </div>

        </div>
      </button>
    );
  }

  /*
   * ============================================
   * NOTIFICATION SECTION
   * ============================================
   */

  function renderSection(
    sectionTitle: string,
    items: InventoryNotification[]
  ) {
    if (items.length === 0) {
      return null;
    }

    return (
      <div>

        <div className="sticky top-0 z-10 border-y border-slate-100 bg-slate-50 px-4 py-2">

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {sectionTitle}
          </p>

        </div>

        {items.map(renderNotification)}

      </div>
    );
  }

  /*
   * ============================================
   * USER DISPLAY
   * ============================================
   */

  const userName =
    currentUser?.full_name ||
    "User";

  const userEmail =
    currentUser?.email ||
    "";

  const userRole =
    currentUser?.role ||
    "User";

  const userDepartment =
    currentUser?.department ||
    "—";

  const userInitials =
    getInitials(userName);

  /*
   * ============================================
   * HEADER
   * ============================================
   */

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">

        {/* =====================================
            PAGE INFORMATION
            ===================================== */}

        <div className="min-w-0">

          <div className="flex items-center gap-2 text-xs text-slate-400">

            <span>
              {section ||
                "College Inventory"}
            </span>

            <ChevronRight size={13} />

            <span className="font-medium text-slate-600">
              Administration
            </span>

          </div>

          {title && (
            <h1 className="mt-1 truncate text-lg font-bold text-slate-900">
              {title}
            </h1>
          )}

          {description && (
            <p className="hidden truncate text-xs text-slate-400 sm:block">
              {description}
            </p>
          )}

        </div>

        {/* =====================================
            HEADER ACTIONS
            ===================================== */}

        <div className="flex shrink-0 items-center gap-2">

          {/* SEARCH */}

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:flex"
            title="Search"
          >
            <Search size={19} />
          </button>

          {/* =================================
              NOTIFICATION
              ================================= */}

          <div
            ref={notificationRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (current) => !current
                )
              }
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                notificationOpen
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              title="Notifications"
            >

              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">

                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}

                </span>
              )}

            </button>

            {/* =================================
                NOTIFICATION DROPDOWN
                ================================= */}

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                {/* PANEL HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                  <div>

                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount === 1
                              ? ""
                              : "s"
                          }`
                        : "You're all caught up"}
                    </p>

                  </div>

                  <div className="flex items-center gap-1">

                    {/* REFRESH */}

                    <button
                      type="button"
                      onClick={
                        loadNotifications
                      }
                      disabled={
                        loadingNotifications
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                      title="Refresh notifications"
                    >

                      <RefreshCw
                        size={15}
                        className={
                          loadingNotifications
                            ? "animate-spin"
                            : ""
                        }
                      />

                    </button>

                    {/* MARK ALL */}

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        title="Mark all notifications as read"
                      >

                        <CheckCheck size={14} />

                        <span>
                          Mark all read
                        </span>

                      </button>
                    )}

                  </div>

                </div>

                {/* =================================
                    NOTIFICATION LIST
                    ================================= */}

                <div className="max-h-[480px] overflow-y-auto">

                  {notifications.length ===
                  0 ? (
                    <div className="px-6 py-12 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Check size={22} />
                      </div>

                      <h4 className="mt-4 text-sm font-bold text-slate-700">
                        No notifications
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Everything looks good
                        right now.
                      </p>

                    </div>
                  ) : (
                    <>
                      {renderSection(
                        "Stock",
                        stockNotifications
                      )}

                      {renderSection(
                        "Approvals",
                        approvalNotifications
                      )}

                      {renderSection(
                        "Procurement",
                        procurementNotifications
                      )}
                    </>
                  )}

                </div>

                {/* FOOTER */}

                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">

                  <p className="text-center text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Live inventory monitoring
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* =================================
              PROFILE
              ================================= */}

          <div
            ref={profileRef}
            className="relative ml-1"
          >

            {/* Profile button */}

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (current) => !current
                )
              }
              className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition ${
                profileOpen
                  ? "bg-slate-100"
                  : "hover:bg-slate-100"
              }`}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >

              {/* Avatar */}

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">
                {userInitials}
              </div>

              {/* User information */}

              <div className="hidden max-w-[150px] text-left md:block">

                <p className="truncate text-xs font-bold text-slate-800">
                  {userName}
                </p>

                <p className="truncate text-[10px] text-slate-400">
                  {userRole}
                </p>

              </div>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform md:block ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

            {/* =================================
                PROFILE DROPDOWN
                ================================= */}

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                {/* USER HEADER */}

                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                      {userInitials}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-900">
                        {userName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {userEmail}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACCOUNT DETAILS */}

                <div className="px-4 py-3">

                  <div className="flex items-center justify-between gap-4 py-2">

                    <span className="text-xs text-slate-500">
                      Role
                    </span>

                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                      {userRole}
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-4 py-2">

                    <span className="text-xs text-slate-500">
                      Department
                    </span>

                    <span className="max-w-[150px] truncate text-xs font-medium text-slate-700">
                      {userDepartment}
                    </span>

                  </div>

                  {currentUser?.is_demo && (
                    <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        Demo Environment
                      </p>

                      <p className="mt-0.5 text-[11px] text-indigo-600">
                        Sample data is isolated from
                        the main system.
                      </p>

                    </div>
                  )}

                </div>

                {/* ACTIONS */}

                <div className="border-t border-slate-100 p-2">

                  {/* PROFILE & SETTINGS */}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <User size={16} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-700">
                        Profile & Settings
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Manage your account
                      </p>

                    </div>

                  </button>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-red-50"
                  >

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <LogOut size={16} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-red-600">
                        Logout
                      </p>

                      <p className="text-[10px] text-red-400">
                        Sign out of your account
                      </p>

                    </div>

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
}