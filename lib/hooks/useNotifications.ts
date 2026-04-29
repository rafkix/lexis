import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import toast from "react-hot-toast";
import { NotificationSettingsUpdate } from "../types/notifications";

export const NOTIF_KEYS = {
  list    : (p?: object) => ["notifications", "list", p] as const,
  unread  : ["notifications", "unread"] as const,
  settings: ["notifications", "settings"] as const,
};

export function useNotifications(params?: {
  page?: number;
  size?: number;
  unread_only?: boolean;
  type?: string;
}) {
  return useQuery({
    queryKey: NOTIF_KEYS.list(params),
    queryFn : () => notificationsApi.getNotifications(params),
    refetchInterval: 30_000, // 30 soniyada bir yangilansin
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIF_KEYS.unread,
    queryFn : notificationsApi.getUnreadCount,
    refetchInterval: 15_000, // 15 soniyada yangilansin
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`${data.marked} ta notification o'qildi deb belgilandi`);
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.deleteAllRead,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`${data.deleted} ta notification o'chirildi`);
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: NOTIF_KEYS.settings,
    queryFn : notificationsApi.getSettings,
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationSettingsUpdate) =>
      notificationsApi.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.settings });
      toast.success("Sozlamalar saqlandi");
    },
  });
}