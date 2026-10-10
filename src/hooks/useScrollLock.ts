import React from "react";

/** Trava o scroll do `body` com painel aberto em telas < 1280 px (ou sempre, com `forceLock`). */
export function useScrollLock(isOpen: boolean, forceLock: boolean = false) {
  React.useEffect(() => {
    const handleScrollLock = () => {
      const isModalMode = window.innerWidth < 1280;

      if (isOpen && (isModalMode || forceLock)) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    };

    handleScrollLock();
    window.addEventListener("resize", handleScrollLock);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("resize", handleScrollLock);
    };
  }, [isOpen]);
}