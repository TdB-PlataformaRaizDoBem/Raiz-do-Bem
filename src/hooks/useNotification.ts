import React from "react";
import { ToastNotificationContext } from "../components/context/NotificationContext";

/** Dispara toasts (e os fala, se a leitura de voz estiver ativa). Exige `<NotificationProvider>`. */
export const useNotification = () => {
  const context = React.useContext(ToastNotificationContext);
  if (!context) {
    throw new Error(
      "useNotification deve ser usado dentro de um NotificationProvider",
    );
  }
  return context;
};
