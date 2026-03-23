type ToastProps = {
  message: string;
  show: boolean;
  type?: "success" | "error" | "info";
};

const Toast = ({ message, show, type = "info" }: ToastProps) => {
  if (!show) return null;

  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-darkgreen",
  }[type];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className={`${bgColor} text-white px-6 py-3 rounded-md shadow-lg`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;