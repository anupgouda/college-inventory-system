export const NOTIFICATION_REFRESH_EVENT =
  "college-inventory-notification-refresh";

export function refreshNotifications() {
  window.dispatchEvent(
    new CustomEvent(
      NOTIFICATION_REFRESH_EVENT
    )
  );
}