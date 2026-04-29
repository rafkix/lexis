// lib/api/notifications.ts
import { api } from "./client";
import type {
  Notification,
  PaginatedNotifications,
  NotificationSettings,
} from "@/lib/types/notifications";

export const notificationsApi = {
  // GET /notifications
  getAll(params?: {
    page?: number;
    size?: number;
    unread_only?: boolean;
    type?: string;
  }): Promise<PaginatedNotifications> {
    return api
      .get<PaginatedNotifications>("/notifications", { params })
      .then((r) => r.data);
  },

  // GET /notifications/unread-count
  getUnreadCount(): Promise<{ count: number }> {
    return api
      .get<{ count: number }>("/notifications/unread-count")
      .then((r) => r.data);
  },

  // PATCH /notifications/{id}/read
  markAsRead(id: string): Promise<Notification> {
    return api
      .patch<Notification>(`/notifications/${id}/read`)
      .then((r) => r.data);
  },

  // POST /notifications/read-all
  markAllAsRead(): Promise<{ marked: number; message: string }> {
    return api
      .post<{ marked: number; message: string }>("/notifications/read-all")
      .then((r) => r.data);
  },

  // DELETE /notifications/{id}
  deleteNotification(id: string): Promise<void> {
    return api.delete(`/notifications/${id}`).then(() => undefined);
  },

  // DELETE /notifications/read
  deleteAllRead(): Promise<{ deleted: number; message: string }> {
    return api
      .delete<{ deleted: number; message: string }>("/notifications/read")
      .then((r) => r.data);
  },

  // GET /notifications/settings
  getSettings(): Promise<NotificationSettings> {
    return api
      .get<NotificationSettings>("/notifications/settings")
      .then((r) => r.data);
  },

  // PATCH /notifications/settings
  updateSettings(
    payload: Partial<NotificationSettings>,
  ): Promise<NotificationSettings> {
    return api
      .patch<NotificationSettings>("/notifications/settings", payload)
      .then((r) => r.data);
  },
};
