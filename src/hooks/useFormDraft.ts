import { useCallback, useEffect, useRef } from "react";
import type { FieldValues, UseFormWatch } from "react-hook-form";

const DEBOUNCE_MS = 1000;

function semCampos<T extends FieldValues>(valores: T, omitir: readonly string[]): Partial<T> {
  const copia: Record<string, unknown> = { ...valores };
  for (const campo of omitir) delete copia[campo];
  return copia as Partial<T>;
}

/**
 * Lê o rascunho salvo por `useFormDraft`; `null` se não há ou o storage falha.
 * Também apaga rascunhos antigos que versões anteriores gravavam em `localStorage` (podiam conter CPF e relato de saúde).
 */
export function loadFormDraft<T extends FieldValues>(
  key: string,
  omitir: readonly string[] = [],
): Partial<T> | null {
  try {
    localStorage.removeItem(key);
  } catch {
    /* sem acesso ao localStorage: nada a limpar */
  }
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? semCampos(JSON.parse(raw) as Partial<T>, omitir) : null;
  } catch {
    return null;
  }
}

/**
 * Salva rascunho no `sessionStorage` (some ao fechar a aba) com debounce de 1 s e avisa ao sair com alterações.
 * `omitir` lista campos que nunca são gravados: CPF, relato de saúde e as autorizações de consentimento.
 * Chame `clearDraft` após enviar.
 */
export function useFormDraft<T extends FieldValues>(
  key: string,
  watch: UseFormWatch<T>,
  isDirty: boolean,
  omitir: readonly string[] = [],
): { clearDraft: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const omitirRef = useRef(omitir);

  useEffect(() => {
    const subscription = watch((values) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          sessionStorage.setItem(key, JSON.stringify(semCampos(values as T, omitirRef.current)));
        } catch {
          /* storage indisponível ou cheio: o rascunho não persiste */
        }
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
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* storage indisponível: nada a limpar */
    }
  }, [key]);

  return { clearDraft };
}
