import { apiFetch } from "./api";

const SETTINGS_KEY = "collegeInventorySettings";
const READ_KEY = "collegeInventoryReadNotifications";

export type NotificationType =
  | "stock"
  | "approval"
  | "procurement";

export type InventoryNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  link?: string;
};

function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return {
        notifications: true,
        lowStockAlerts: true,
        approvalAlerts: true,
        procurementAlerts: true,
      };
    }

    const parsed = JSON.parse(stored);

    return {
      notifications: parsed.notifications ?? true,
      lowStockAlerts: parsed.lowStockAlerts ?? true,
      approvalAlerts: parsed.approvalAlerts ?? true,
      procurementAlerts: parsed.procurementAlerts ?? true,
    };
  } catch {
    return {
      notifications: true,
      lowStockAlerts: true,
      approvalAlerts: true,
      procurementAlerts: true,
    };
  }
}

function getReadNotifications(): string[] {
  try {
    const stored = localStorage.getItem(READ_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(
  notificationId: string
) {
  const readNotifications = getReadNotifications();

  if (!readNotifications.includes(notificationId)) {
    readNotifications.push(notificationId);
  }

  localStorage.setItem(
    READ_KEY,
    JSON.stringify(readNotifications)
  );
}

export function markAllNotificationsAsRead(
  notifications: InventoryNotification[]
) {
  const existing = getReadNotifications();

  const allIds = notifications.map(
    (notification) => notification.id
  );

  const merged = Array.from(
    new Set([...existing, ...allIds])
  );

  localStorage.setItem(
    READ_KEY,
    JSON.stringify(merged)
  );
}

export function isNotificationRead(
  notificationId: string
) {
  return getReadNotifications().includes(
    notificationId
  );
}

export function clearReadNotifications() {
  localStorage.removeItem(READ_KEY);
}

async function getApiData(
  endpoint: string
): Promise<any[]> {
  try {
    const response = await apiFetch(endpoint);

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    if (Array.isArray(result)) {
      return result;
    }

    return result.data ?? [];
  } catch (error) {
    console.error(
      `Unable to load ${endpoint}:`,
      error
    );

    return [];
  }
}

export async function getInventoryNotifications(): Promise<
  InventoryNotification[]
> {
  const settings = getSettings();

  if (!settings.notifications) {
    return [];
  }

  const notifications: InventoryNotification[] = [];

  // -----------------------------------------
  // LOW STOCK
  // -----------------------------------------

  if (settings.lowStockAlerts) {
    const stockItems =
      await getApiData("/api/stock");

    stockItems
      .filter(
        (item: any) =>
          Number(item.quantity) <= 10
      )
      .forEach((item: any) => {
        const itemName =
          item.itemName ??
          item.item_name ??
          "Inventory item";

        notifications.push({
          id: `stock-${item.id}`,
          type: "stock",
          title: "Low Stock Alert",
          message: `${itemName} has only ${item.quantity} units remaining.`,
          createdAt:
            item.entryDate ??
            item.entry_date ??
            new Date().toISOString(),
          link: "/inventory/stock-entry",
        });
      });
  }

  // -----------------------------------------
  // INDENT APPROVAL
  // -----------------------------------------

  if (settings.approvalAlerts) {
    const indents =
      await getApiData("/api/indents");

    indents
      .filter(
        (indent: any) =>
          String(indent.status).toLowerCase() ===
          "pending"
      )
      .forEach((indent: any) => {
        const indentId =
          indent.id ?? indent._id;

        notifications.push({
          id: `indent-${indentId}`,
          type: "approval",
          title: "Approval Required",
          message: `${indent.description} requires approval for ${indent.branch}.`,
          createdAt:
            indent.date ??
            new Date().toISOString(),
          link: "/inventory/indent-approval",
        });
      });
  }

  // -----------------------------------------
  // PROCUREMENT
  // -----------------------------------------

  if (settings.procurementAlerts) {
    // Purchase Orders
    const purchaseOrders =
      await getApiData(
        "/api/purchase-orders"
      );

    purchaseOrders
      .filter(
        (po: any) =>
          String(po.status).toLowerCase() ===
          "open"
      )
      .forEach((po: any) => {
        notifications.push({
          id: `po-${po.id}`,
          type: "procurement",
          title: "Open Purchase Order",
          message: `${
            po.poNumber ??
            po.po_number ??
            "Purchase Order"
          } for ${
            po.itemName ??
            po.item_name ??
            "item"
          } is still open.`,
          createdAt:
            po.orderDate ??
            po.order_date ??
            new Date().toISOString(),
          link: "/inventory/purchase-order",
        });
      });

    // Quotations
    const quotations =
      await getApiData(
        "/api/quotations"
      );

    quotations
      .filter(
        (quotation: any) =>
          String(
            quotation.status
          ).toLowerCase() === "pending"
      )
      .forEach((quotation: any) => {
        notifications.push({
          id: `quotation-${quotation.id}`,
          type: "procurement",
          title: "Quotation Pending",
          message: `${
            quotation.quotationNumber ??
            quotation.quotation_number ??
            "Quotation"
          } is waiting for approval.`,
          createdAt:
            quotation.quotationDate ??
            quotation.quotation_date ??
            new Date().toISOString(),
          link: "/inventory/quotation",
        });
      });

    // Bills
    const bills =
      await getApiData("/api/bills");

    bills
      .filter(
        (bill: any) =>
          String(bill.status).toLowerCase() ===
          "pending"
      )
      .forEach((bill: any) => {
        notifications.push({
          id: `bill-${bill.id}`,
          type: "procurement",
          title: "Bill Pending",
          message: `${
            bill.billNumber ??
            bill.bill_number ??
            "Bill"
          } is waiting for approval/payment.`,
          createdAt:
            bill.billDate ??
            bill.bill_date ??
            new Date().toISOString(),
          link: "/inventory/bill-master",
        });
      });
  }

  // -----------------------------------------
  // SORT NEWEST FIRST
  // -----------------------------------------

  return notifications.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}