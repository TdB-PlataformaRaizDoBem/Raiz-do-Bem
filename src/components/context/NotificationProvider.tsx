import React from "react";
import { ToastNotificationContext } from "./NotificationContext";
import Toast from "../ui/Toast";

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = React.useState<string>("");
  const [show, setShow] = React.useState(false);
  const [type, setType] = React.useState<"success" | "error" | "info">("info");

  const showNotification = (msg: string, t: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setType(t);
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  return (
    <ToastNotificationContext.Provider value={{ showNotification }}>
      {children}
      <Toast show={show} message={message} type={type} />
    </ToastNotificationContext.Provider>
  );
};