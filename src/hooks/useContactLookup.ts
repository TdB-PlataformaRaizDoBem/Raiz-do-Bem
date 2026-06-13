import { useEffect, useState } from "react";
import { getBeneficiariosCompletos } from "../services/Beneficiarioservice";
import { getDentistasCompletos } from "../services/DentistaService";

export interface ContactInfo {
  nome: string;
  tipo: "beneficiario" | "dentista";
}

/** Normaliza para só dígitos sem DDI 55, para comparação robusta */
function normalizeDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("55") && d.length >= 12 ? d.slice(2) : d;
}

/**
 * Dado um número de telefone do chat (+5511...), busca em paralelo nas
 * listas de Beneficiários e Dentistas e retorna nome + perfil se encontrar.
 */
export function useContactLookup(telefone: string): {
  contact: ContactInfo | null;
  loadingContact: boolean;
} {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  useEffect(() => {
    if (!telefone) {
      setLoadingContact(false);
      return;
    }

    let cancelled = false;
    const needle = normalizeDigits(telefone);

    async function lookup() {
      try {
        const [beneficiarios, dentistas] = await Promise.all([
          getBeneficiariosCompletos(),
          getDentistasCompletos(),
        ]);
        if (cancelled) return;

        const b = beneficiarios.find(
          (x) => normalizeDigits(x.telefone) === needle
        );
        if (b) { setContact({ nome: b.nomeCompleto, tipo: "beneficiario" }); return; }

        const d = dentistas.find(
          (x) => normalizeDigits(x.telefone) === needle
        );
        setContact(d ? { nome: d.nomeCompleto, tipo: "dentista" } : null);
      } catch {
        if (!cancelled) setContact(null);
      } finally {
        if (!cancelled) setLoadingContact(false);
      }
    }

    lookup();
    return () => { cancelled = true; };
  }, [telefone]);

  return { contact, loadingContact };
}
