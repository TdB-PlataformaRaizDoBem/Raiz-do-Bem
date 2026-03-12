import React from "react";

export function useScrollLock(isOpen: boolean) {
  React.useEffect(() => {
    const handleScrollLock = () => {
      const isModalMode = window.innerWidth < 1280;

      if (isOpen && isModalMode) {
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