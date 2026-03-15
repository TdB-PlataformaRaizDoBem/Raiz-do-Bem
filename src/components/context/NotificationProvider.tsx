import React,  {type ReactNode } from "react";
import { ToastNotificationContext } from "./NotificationContext";
import Toast from "../ui/Toast";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = React.useState<string | undefined>(undefined);
  const [show, setShow] = React.useState(false);

  // Função mostra/apaga em 3s
  const showNotification = (msg: string) => {
    setMessage(msg);
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  return (
    <ToastNotificationContext.Provider value={{ showNotification }}>
      {children}
      <Toast show={show} message={message || ""} />
    </ToastNotificationContext.Provider>
  );
};