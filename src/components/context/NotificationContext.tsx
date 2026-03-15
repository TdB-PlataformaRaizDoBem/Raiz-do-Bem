import { createContext } from "react";

type NotificationType = {
  showNotification: (message: string) => void;
};

export const ToastNotificationContext = createContext<NotificationType | undefined>(undefined);

