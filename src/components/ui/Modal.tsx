import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = ({ open, onClose, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center xl:-mr-14 justify-center bg-black/50 backdrop-blur-sm z-[100]" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 w-[90%] max-w-[450px] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {children}
      </div>
    </div>
  );
};