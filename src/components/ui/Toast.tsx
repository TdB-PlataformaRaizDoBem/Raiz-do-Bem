type ToastProps = {
  message: string;
  show: boolean;
}

const Toast = ({message, show} : ToastProps) => {
  if (!show) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div  className="bg-darkgreen text-white px-6 py-3 rounded-md shadow-lg">
        {message}
      </div>
    </div>
  )
}

export default Toast