import { createContext } from "react";

type NotificationType = {
  showNotification: (message: string, type?: "success" | "error" | "info") => void;
};

export const ToastNotificationContext = createContext<NotificationType | undefined>(undefined);

