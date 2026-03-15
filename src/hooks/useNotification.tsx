import React from "react";
import { ToastNotificationContext } from "../components/context/NotificationContext";

export const useNotification = () => {
  const context = React.useContext(ToastNotificationContext);
  if (!context) {
    throw new Error(
      "useNotification deve ser usado dentro de um NotificationProvider",
    );
  }
  return context;
};
