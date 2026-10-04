import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBeneficiariosCompletos } from "../services/Beneficiarioservice";
import { getDentistasCompletos } from "../services/DentistaService";
import { queryKeys } from "./queryKeys";

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
 * Dado um número de telefone do chat (+5511...), procura nas listas de Beneficiários
 * e Dentistas (já em cache quando o usuário passou por essas telas) e retorna
 * nome + perfil se encontrar.
 */
export function useContactLookup(telefone: string): {
  contact: ContactInfo | null;
  loadingContact: boolean;
} {
  const enabled = !!telefone;
  const beneficiarios = useQuery({ queryKey: queryKeys.beneficiarios, queryFn: getBeneficiariosCompletos, enabled });
  const dentistas = useQuery({ queryKey: queryKeys.dentistas, queryFn: getDentistasCompletos, enabled });

  const contact = useMemo<ContactInfo | null>(() => {
    if (!enabled || !beneficiarios.data || !dentistas.data) return null;
    const needle = normalizeDigits(telefone);

    const b = beneficiarios.data.find((x) => normalizeDigits(x.telefone) === needle);
    if (b) return { nome: b.nomeCompleto, tipo: "beneficiario" };

    const d = dentistas.data.find((x) => normalizeDigits(x.telefone) === needle);
    return d ? { nome: d.nomeCompleto, tipo: "dentista" } : null;
  }, [enabled, telefone, beneficiarios.data, dentistas.data]);

  const carregando = (q: { isPending: boolean; fetchStatus: string }) => q.isPending && q.fetchStatus !== "idle";

  return { contact, loadingContact: enabled && (carregando(beneficiarios) || carregando(dentistas)) };
}
