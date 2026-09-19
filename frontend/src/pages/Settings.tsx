import { API_BASE_URL } from "../config/api";
import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";

import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Server,
  LockKeyhole,
  Mail,
  Building2,
  Globe2,
  Clock3,
  Activity,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Info,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type SettingsTab =
  | "general"
  | "notifications"
  | "security"
  | "appearance"
  | "system";

type Theme = "light" | "dark" | "system";

type SettingsData = {
  institutionName: string;
  institutionCode: string;
  adminName: string;
  adminEmail: string;
  timezone: string;
  language: string;

  notifications: boolean;
  lowStockAlerts: boolean;
  approvalAlerts: boolean;
  procurementAlerts: boolean;
  emailNotifications: boolean;

  sessionTimeout: string;
  twoFactor: boolean;

  theme: Theme;
};

type HealthStatus = {
  backend: "checking" | "online" | "offline";
  database: "checking" | "connected" | "offline";
  inventoryApi: "checking" | "online" | "offline";
};

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "collegeInventorySettings";

const DEFAULT_SETTINGS: SettingsData = {
  institutionName: "Global Academy of Technology",
  institutionCode: "GAT",
  adminName: "Inventory Administrator",
  adminEmail: "admin@gat.ac.in",
  timezone: "Asia/Kolkata",
  language: "English",

  notifications: true,
  lowStockAlerts: true,
  approvalAlerts: true,
  procurementAlerts: true,
  emailNotifications: false,

  sessionTimeout: "30",
  twoFactor: false,

  theme: "light",
};


const tabs: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: ElementType;
}[] = [
  {
    id: "general",
    label: "General",
    description: "Institution and administrator",
    icon: SettingsIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and preferences",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    description: "Access and protection",
    icon: Shield,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and interface",
    icon: Palette,
  },
  {
    id: "system",
    label: "System",
    description: "Database and services",
    icon: Server,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getStoredSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Unable to load settings:", error);

    return {
      ...DEFAULT_SETTINGS,
    };
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  /*
   * Keep a separate theme key so the application
   * can restore the theme before/without opening Settings.
   */
  localStorage.setItem("collegeInventoryTheme", theme);

  /*
   * Also update color-scheme for browser controls.
   */
  if (theme === "dark") {
    root.style.colorScheme = "dark";
  } else if (theme === "light") {
    root.style.colorScheme = "light";
  } else {
    root.style.colorScheme = "normal";
  }
}

function saveToStorage(settings: SettingsData) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings)
  );
}

function showBrowserNotification(
  title: string,
  message: string
) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
    });
  }
}

/* =========================================================
   MAIN SETTINGS COMPONENT
========================================================= */

function Settings() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("general");

  const [settings, setSettings] =
    useState<SettingsData>(() => getStoredSettings());

  const [saved, setSaved] = useState(false);

  const [health, setHealth] = useState<HealthStatus>({
    backend: "checking",
    database: "checking",
    inventoryApi: "checking",
  });

  const [testingConnection, setTestingConnection] =
    useState(false);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const loadedSettings = getStoredSettings();

    setSettings(loadedSettings);

    applyTheme(loadedSettings.theme);
  }, []);

  /* =======================================================
     THEME
  ======================================================= */

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  /* =======================================================
     SETTINGS UPDATE
  ======================================================= */

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    setSettings((previous) => {
      const updated = {
        ...previous,
        [key]: value,
      };

      /*
       * Theme applies immediately.
       */
      if (key === "theme") {
        applyTheme(value as Theme);
      }

      return updated;
    });

    setSaved(false);
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const saveSettings = () => {
    saveToStorage(settings);

    applyTheme(settings.theme);

    window.dispatchEvent(
      new CustomEvent("inventory-settings-updated", {
        detail: settings,
      })
    );

    setSaved(true);

    /*
     * Optional browser notification.
     */
    if (
      settings.notifications &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      showBrowserNotification(
        "Settings Saved",
        "Your inventory system settings have been updated."
      );
    }

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all settings to their default values?"
    );

    if (!confirmed) {
      return;
    }

    const resetSettings = {
      ...DEFAULT_SETTINGS,
    };

    setSettings(resetSettings);

    saveToStorage(resetSettings);

    applyTheme(resetSettings.theme);

    window.dispatchEvent(
      new CustomEvent("inventory-settings-updated", {
        detail: resetSettings,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* =======================================================
     REQUEST NOTIFICATION PERMISSION
  ======================================================= */

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert(
        "Browser notifications are not supported by this browser."
      );
      return;
    }

    if (Notification.permission === "granted") {
      alert("Browser notifications are already enabled.");
      return;
    }

    if (Notification.permission === "denied") {
      alert(
        "Notifications are blocked by your browser. Please allow notifications from your browser settings."
      );
      return;
    }

    const permission =
      await Notification.requestPermission();

    if (permission === "granted") {
      showBrowserNotification(
        "Notifications Enabled",
        "College Inventory notifications are now enabled."
      );
    }
  };

  /* =======================================================
     HEALTH CHECK
  ======================================================= */

  const testSystemConnection = async () => {
    setTestingConnection(true);

    setHealth({
      backend: "checking",
      database: "checking",
      inventoryApi: "checking",
    });

    let backendStatus:
      | "online"
      | "offline" = "offline";

    let databaseStatus:
      | "connected"
      | "offline" = "offline";

    let inventoryStatus:
      | "online"
      | "offline" = "offline";

    /*
     * Backend health
     */
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/health`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        backendStatus = "online";
      }
    } catch (error) {
      console.error(
        "Backend health check failed:",
        error
      );
    }

    setHealth((previous) => ({
      ...previous,
      backend: backendStatus,
    }));

    /*
     * Database
     */
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/db-test`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (
          data?.success === true ||
          data?.database ||
          data?.message
        ) {
          databaseStatus = "connected";
        }
      }
    } catch (error) {
      console.error(
        "Database health check failed:",
        error
      );
    }

    setHealth((previous) => ({
      ...previous,
      database: databaseStatus,
    }));

    /*
     * Inventory API
     */
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stock`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        inventoryStatus = "online";
      }
    } catch (error) {
      console.error(
        "Inventory API check failed:",
        error
      );
    }

    setHealth((previous) => ({
      ...previous,
      inventoryApi: inventoryStatus,
    }));

    setTestingConnection(false);
  };

  /*
   * Automatically check system when System tab opens.
   */
  useEffect(() => {
    if (activeTab === "system") {
      testSystemConnection();
    }
  }, [activeTab]);

  /* =======================================================
     REQUEST BROWSER NOTIFICATIONS WHEN ENABLED
  ======================================================= */

  useEffect(() => {
    if (
      settings.notifications &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      /*
       * We don't automatically request permission.
       * Browser permission should come from a user action.
       */
    }
  }, [settings.notifications]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-[calc(100vh-82px)] bg-slate-50 px-4 py-6 transition-colors sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              System Configuration
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Manage application preferences,
                notifications, security, appearance,
                and system configuration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              {saved && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={16} />
                  Changes saved
                </div>
              )}

              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                type="button"
                onClick={saveSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Save size={17} />
                Save Changes
              </button>

            </div>
          </div>
        </div>

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_1fr]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

            <div className="px-3 pb-3 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Configuration
              </p>
            </div>

            <div className="space-y-1">

              {tabs.map((tab) => {
                const Icon = tab.icon;

                const active =
                  activeTab === tab.id;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >

                    <div
                      className={`rounded-lg p-2 ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-white"
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p
                        className={`text-sm font-semibold ${
                          active
                            ? "text-white"
                            : "text-slate-700"
                        }`}
                      >
                        {tab.label}
                      </p>

                      <p
                        className={`mt-0.5 truncate text-[11px] ${
                          active
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {tab.description}
                      </p>

                    </div>

                    <ChevronRight
                      size={15}
                      className="text-slate-300"
                    />

                  </button>
                );
              })}

            </div>

            {/* ACCOUNT */}

            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="rounded-xl bg-slate-50 p-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    IA
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-xs font-bold text-slate-800">
                      {settings.adminName ||
                        "Inventory Admin"}
                    </p>

                    <p className="truncate text-[10px] text-slate-400">
                      Administrator
                    </p>

                  </div>

                </div>

              </div>
            </div>

          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main>

            {activeTab === "general" && (
              <GeneralSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationSettings
                settings={settings}
                updateSetting={updateSetting}
                requestNotificationPermission={
                  requestNotificationPermission
                }
              />
            )}

            {activeTab === "security" && (
              <SecuritySettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}

            {activeTab === "appearance" && (
              <AppearanceSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}

            {activeTab === "system" && (
              <SystemSettings
                health={health}
                testingConnection={
                  testingConnection
                }
                testConnection={
                  testSystemConnection
                }
              />
            )}

          </main>
        </div>

        {/* FOOTER */}

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">

          <span>
            College Inventory Management System
          </span>

          <span>
            Settings are saved locally
          </span>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   GENERAL SETTINGS
========================================================= */

function GeneralSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsData;

  updateSetting: <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => void;
}) {
  return (
    <SettingsCard
      icon={Building2}
      iconClass="bg-blue-50 text-blue-600"
      title="General Settings"
      description="Configure institution and administrator information."
    >

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <InputField
          label="Institution Name"
          value={settings.institutionName}
          onChange={(value) =>
            updateSetting(
              "institutionName",
              value
            )
          }
          icon={Building2}
        />

        <InputField
          label="Institution Code"
          value={settings.institutionCode}
          onChange={(value) =>
            updateSetting(
              "institutionCode",
              value
            )
          }
          icon={Globe2}
        />

        <InputField
          label="Administrator Name"
          value={settings.adminName}
          onChange={(value) =>
            updateSetting(
              "adminName",
              value
            )
          }
          icon={User}
        />

        <InputField
          label="Administrator Email"
          value={settings.adminEmail}
          onChange={(value) =>
            updateSetting(
              "adminEmail",
              value
            )
          }
          icon={Mail}
          type="email"
        />

        <SelectField
          label="Timezone"
          value={settings.timezone}
          onChange={(value) =>
            updateSetting(
              "timezone",
              value
            )
          }
          options={[
            {
              value: "Asia/Kolkata",
              label: "India Standard Time (IST)",
            },
            {
              value: "UTC",
              label: "Coordinated Universal Time (UTC)",
            },
            {
              value: "Asia/Dubai",
              label: "Gulf Standard Time (GST)",
            },
            {
              value: "Asia/Singapore",
              label: "Singapore Time (SGT)",
            },
          ]}
        />

        <SelectField
          label="Language"
          value={settings.language}
          onChange={(value) =>
            updateSetting(
              "language",
              value
            )
          }
          options={[
            {
              value: "English",
              label: "English",
            },
            {
              value: "Kannada",
              label: "Kannada",
            },
            {
              value: "Hindi",
              label: "Hindi",
            },
          ]}
        />

      </div>

      <InfoBox
        icon={Info}
        title="About your institution"
        text="These details are stored with the application settings and can be used throughout the inventory interface and reports."
      />

    </SettingsCard>
  );
}

/* =========================================================
   NOTIFICATION SETTINGS
========================================================= */

function NotificationSettings({
  settings,
  updateSetting,
  requestNotificationPermission,
}: {
  settings: SettingsData;

  updateSetting: <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => void;

  requestNotificationPermission: () => void;
}) {
  const browserSupported =
    "Notification" in window;

  const permission =
    browserSupported
      ? Notification.permission
      : "unsupported";

  return (
    <SettingsCard
      icon={Bell}
      iconClass="bg-amber-50 text-amber-600"
      title="Notification Preferences"
      description="Choose which events should generate system alerts."
    >

      <div className="divide-y divide-slate-100">

        <ToggleRow
          icon={Bell}
          title="System Notifications"
          description="Enable notifications throughout the application."
          enabled={settings.notifications}
          onChange={(value) =>
            updateSetting(
              "notifications",
              value
            )
          }
        />

        <ToggleRow
          icon={Database}
          title="Low Stock Alerts"
          description="Enable alerts when inventory reaches the low-stock threshold."
          enabled={settings.lowStockAlerts}
          onChange={(value) =>
            updateSetting(
              "lowStockAlerts",
              value
            )
          }
        />

        <ToggleRow
          icon={CheckCircle2}
          title="Approval Alerts"
          description="Enable alerts when indents or approvals require action."
          enabled={settings.approvalAlerts}
          onChange={(value) =>
            updateSetting(
              "approvalAlerts",
              value
            )
          }
        />

        <ToggleRow
          icon={Activity}
          title="Procurement Alerts"
          description="Enable alerts for purchase orders, quotations, and bills."
          enabled={settings.procurementAlerts}
          onChange={(value) =>
            updateSetting(
              "procurementAlerts",
              value
            )
          }
        />

        <ToggleRow
          icon={Mail}
          title="Email Notifications"
          description="Enable the preference for sending notifications by email."
          enabled={settings.emailNotifications}
          onChange={(value) =>
            updateSetting(
              "emailNotifications",
              value
            )
          }
        />

      </div>

      {/* Browser notification */}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
              <Bell size={17} />
            </div>

            <div>

              <p className="text-sm font-bold text-blue-900">
                Browser Notifications
              </p>

              <p className="mt-1 text-xs text-blue-700">
                Permission status:{" "}
                <strong>
                  {permission ===
                  "granted"
                    ? "Enabled"
                    : permission ===
                      "denied"
                    ? "Blocked"
                    : permission ===
                      "default"
                    ? "Not requested"
                    : "Unsupported"}
                </strong>
              </p>

            </div>

          </div>

          {browserSupported &&
            permission !== "granted" && (
              <button
                type="button"
                onClick={
                  requestNotificationPermission
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                Enable Browser Alerts
              </button>
            )}

        </div>

      </div>

      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
        <strong>Note:</strong> These switches
        control application preferences. Actual
        email delivery requires the backend email
        service to be configured.
      </div>

    </SettingsCard>
  );
}

/* =========================================================
   SECURITY SETTINGS
========================================================= */

function SecuritySettings({
  settings,
  updateSetting,
}: {
  settings: SettingsData;

  updateSetting: <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => void;
}) {
  return (
    <SettingsCard
      icon={Shield}
      iconClass="bg-emerald-50 text-emerald-600"
      title="Security"
      description="Manage session security and administrator access."
    >

      <div className="space-y-5">

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

          <div className="flex items-start gap-3">

            <div className="rounded-lg bg-white p-2 text-emerald-600 shadow-sm">
              <LockKeyhole size={18} />
            </div>

            <div>

              <p className="text-sm font-bold text-emerald-800">
                Administrator Account
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Security preferences are stored
                locally until authentication is
                connected to the backend.
              </p>

            </div>

          </div>

        </div>

        <SelectField
          label="Session Timeout"
          value={settings.sessionTimeout}
          onChange={(value) =>
            updateSetting(
              "sessionTimeout",
              value
            )
          }
          options={[
            {
              value: "15",
              label: "15 minutes",
            },
            {
              value: "30",
              label: "30 minutes",
            },
            {
              value: "60",
              label: "1 hour",
            },
            {
              value: "120",
              label: "2 hours",
            },
          ]}
        />

        <ToggleRow
          icon={Shield}
          title="Two-Factor Authentication"
          description="Store your preference for additional authentication protection."
          enabled={settings.twoFactor}
          onChange={(value) =>
            updateSetting(
              "twoFactor",
              value
            )
          }
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-sm font-bold text-slate-800">
            Security Status
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

            <StatusMiniCard
              title="Session Timeout"
              value={`${settings.sessionTimeout} minutes`}
            />

            <StatusMiniCard
              title="2FA Preference"
              value={
                settings.twoFactor
                  ? "Enabled"
                  : "Disabled"
              }
            />

          </div>

        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <strong>Important:</strong> Real 2FA
          and server-enforced session expiration
          require the authentication system to be
          implemented on the backend.
        </div>

      </div>

    </SettingsCard>
  );
}

/* =========================================================
   APPEARANCE SETTINGS
========================================================= */

function AppearanceSettings({
  settings,
  updateSetting,
}: {
  settings: SettingsData;

  updateSetting: <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => void;
}) {
  const themes: {
    value: Theme;
    label: string;
    description: string;
    icon: ElementType;
  }[] = [
    {
      value: "light",
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Low-light interface",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follow device preference",
      icon: Monitor,
    },
  ];

  return (
    <SettingsCard
      icon={Palette}
      iconClass="bg-violet-50 text-violet-600"
      title="Appearance"
      description="Customize how the inventory system looks."
    >

      <div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          Interface Theme
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {themes.map((theme) => {
            const Icon = theme.icon;

            const active =
              settings.theme === theme.value;

            return (
              <button
                type="button"
                key={theme.value}
                onClick={() =>
                  updateSetting(
                    "theme",
                    theme.value
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >

                <div
                  className={`mb-4 flex h-28 items-center justify-center rounded-lg ${
                    theme.value === "dark"
                      ? "bg-slate-900"
                      : theme.value === "light"
                      ? "bg-slate-100"
                      : "bg-gradient-to-br from-slate-100 to-slate-800"
                  }`}
                >
                  <Icon
                    size={28}
                    className={
                      theme.value === "dark"
                        ? "text-white"
                        : "text-slate-600"
                    }
                  />
                </div>

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-bold text-slate-800">
                      {theme.label}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      {theme.description}
                    </p>

                  </div>

                  <span
                    className={`h-4 w-4 rounded-full border-2 ${
                      active
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  />

                </div>

              </button>
            );
          })}

        </div>

        <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50 p-4">

          <div className="flex items-start gap-3">

            <div className="rounded-lg bg-white p-2 text-violet-600 shadow-sm">
              <Palette size={17} />
            </div>

            <div>

              <p className="text-sm font-bold text-violet-900">
                Theme applied immediately
              </p>

              <p className="mt-1 text-xs leading-5 text-violet-700">
                Choose Light, Dark, or System.
                The selection is applied immediately
                and remains active after refreshing
                the browser.
              </p>

            </div>

          </div>

        </div>

      </div>

    </SettingsCard>
  );
}

/* =========================================================
   SYSTEM SETTINGS
========================================================= */

function SystemSettings({
  health,
  testingConnection,
  testConnection,
}: {
  health: HealthStatus;

  testingConnection: boolean;

  testConnection: () => void;
}) {
  return (
    <div className="space-y-6">

      <SettingsCard
        icon={Server}
        iconClass="bg-blue-50 text-blue-600"
        title="System Information"
        description="Live information about the inventory platform."
      >

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <SystemInfo
            icon={Database}
            label="Database"
            value="college_inventory"
            status={
              health.database ===
              "connected"
                ? "Connected"
                : health.database ===
                  "checking"
                ? "Checking..."
                : "Offline"
            }
            healthy={
              health.database ===
              "connected"
            }
          />

          <SystemInfo
            icon={Server}
            label="Backend"
            value="Node.js / Express"
            status={
              health.backend ===
              "online"
                ? "Running"
                : health.backend ===
                  "checking"
                ? "Checking..."
                : "Offline"
            }
            healthy={
              health.backend ===
              "online"
            }
          />

          <SystemInfo
            icon={Globe2}
            label="API Endpoint"
            value="localhost:5001"
            status={
              health.inventoryApi ===
              "online"
                ? "Online"
                : health.inventoryApi ===
                  "checking"
                ? "Checking..."
                : "Offline"
            }
            healthy={
              health.inventoryApi ===
              "online"
            }
          />

          <SystemInfo
            icon={Activity}
            label="Inventory API"
            value="/api/stock"
            status={
              health.inventoryApi ===
              "online"
                ? "Active"
                : health.inventoryApi ===
                  "checking"
                ? "Checking..."
                : "Offline"
            }
            healthy={
              health.inventoryApi ===
              "online"
            }
          />

        </div>

        <button
          type="button"
          onClick={testConnection}
          disabled={testingConnection}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              testingConnection
                ? "animate-spin"
                : ""
            }
          />

          {testingConnection
            ? "Testing..."
            : "Test Connection"}
        </button>

      </SettingsCard>

      <SettingsCard
        icon={Activity}
        iconClass="bg-emerald-50 text-emerald-600"
        title="System Health"
        description="Live service availability."
      >

        <div className="space-y-3">

          <HealthRow
            title="Application Server"
            description="Node.js / Express API"
            status={
              health.backend ===
              "online"
                ? "Operational"
                : health.backend ===
                  "checking"
                ? "Checking"
                : "Offline"
            }
            online={
              health.backend ===
              "online"
            }
          />

          <HealthRow
            title="PostgreSQL Database"
            description="college_inventory"
            status={
              health.database ===
              "connected"
                ? "Connected"
                : health.database ===
                  "checking"
                ? "Checking"
                : "Offline"
            }
            online={
              health.database ===
              "connected"
            }
          />

          <HealthRow
            title="Inventory API"
            description="REST API /api/stock"
            status={
              health.inventoryApi ===
              "online"
                ? "Operational"
                : health.inventoryApi ===
                  "checking"
                ? "Checking"
                : "Offline"
            }
            online={
              health.inventoryApi ===
              "online"
            }
          />

          <HealthRow
            title="Frontend"
            description="React / Vite application"
            status="Operational"
            online
          />

        </div>

      </SettingsCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
            <Clock3 size={20} />
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              System Timezone
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Asia/Kolkata • Indian Standard Time
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  icon: Icon,
  iconClass,
  title,
  description,
  children,
}: {
  icon: ElementType;
  iconClass: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          <Icon size={20} />
        </div>

        <div>

          <h2 className="font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <div className="p-5">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ElementType;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">

        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

      </div>

    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">

      <div className="flex items-start gap-3">

        <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500">
          <Icon size={17} />
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

      <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
        <Icon size={17} />
      </div>

      <div>

        <p className="text-sm font-bold text-blue-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          {text}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   SYSTEM INFO
========================================================= */

function SystemInfo({
  icon: Icon,
  label,
  value,
  status,
  healthy,
}: {
  icon: ElementType;
  label: string;
  value: string;
  status: string;
  healthy: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
            <Icon size={17} />
          </div>

          <div>

            <p className="text-xs font-medium text-slate-400">
              {label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {value}
            </p>

          </div>

        </div>

        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            healthy
              ? "bg-emerald-50 text-emerald-700"
              : status === "Checking..."
              ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {healthy ? (
            <CheckCircle2 size={11} />
          ) : status === "Checking..." ? (
            <RefreshCw
              size={11}
              className="animate-spin"
            />
          ) : (
            <XCircle size={11} />
          )}

          {status}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   HEALTH ROW
========================================================= */

function HealthRow({
  title,
  description,
  status,
  online,
}: {
  title: string;
  description: string;
  status: string;
  online: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

      <div className="flex items-center gap-3">

        <span
          className={`h-2.5 w-2.5 rounded-full shadow-sm ${
            online
              ? "bg-emerald-500"
              : status === "Checking"
              ? "bg-amber-400"
              : "bg-red-500"
          }`}
        />

        <div>

          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>

        </div>

      </div>

      <span
        className={`flex items-center gap-1 text-xs font-bold ${
          online
            ? "text-emerald-600"
            : status === "Checking"
            ? "text-amber-600"
            : "text-red-600"
        }`}
      >
        {online ? (
          <Wifi size={13} />
        ) : status === "Checking" ? (
          <RefreshCw
            size={13}
            className="animate-spin"
          />
        ) : (
          <WifiOff size={13} />
        )}

        {status}
      </span>

    </div>
  );
}

/* =========================================================
   MINI STATUS CARD
========================================================= */

function StatusMiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

export default Settings;