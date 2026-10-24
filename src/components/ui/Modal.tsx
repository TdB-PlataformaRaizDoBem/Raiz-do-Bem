import React from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks/useScrollLock";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = ({ open, onClose, children }: ModalProps) => {
  useScrollLock(open, true);
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-[999] p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-5 sm:p-8 w-full max-w-[450px] xl:max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};