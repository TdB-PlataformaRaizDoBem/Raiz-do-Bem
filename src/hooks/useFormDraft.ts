import { useCallback, useEffect, useRef } from "react";
import type { FieldValues, UseFormWatch } from "react-hook-form";

const DEBOUNCE_MS = 1000;

export function loadFormDraft<T extends FieldValues>(
  key: string,
): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

export function useFormDraft<T extends FieldValues>(
  key: string,
  watch: UseFormWatch<T>,
  isDirty: boolean,
): { clearDraft: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const subscription = watch((values) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(values));
      }, DEBOUNCE_MS);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, [key, watch]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const clearDraft = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
    localStorage.removeItem(key);
  }, [key]);

  return { clearDraft };
}
