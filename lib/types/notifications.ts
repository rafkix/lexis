// types/notifications.ts
// NotificationType values match the backend NotificationType enum (uppercase).
// Note: admin API (adminNotificationsApi) sends these as uppercase strings.
export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "PAYMENT"
  | "SUBSCRIPTION"
  | "SECURITY"
  | "SYSTEM";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  size: number;
  pages: number;
  unread_count: number;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  telegram_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  payment_notifications: boolean;
  subscription_notifications: boolean;
  security_notifications: boolean;
  marketing_notifications: boolean;
  updated_at: string;
}
