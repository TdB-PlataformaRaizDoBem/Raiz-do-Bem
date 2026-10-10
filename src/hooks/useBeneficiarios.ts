import { getBeneficiariosCompletos, getBeneficiarioCompleto, type BeneficiarioCompleto } from "../services/Beneficiarioservice";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

/** Beneficiários (GET /beneficiario), em cache compartilhado. */
export const useBeneficiarios = () =>
  useDomainQuery<BeneficiarioCompleto[]>({
    queryKey: queryKeys.beneficiarios,
    queryFn: getBeneficiariosCompletos,
  });

/** Beneficiário por CPF. */
export const useBeneficiario = (cpf: string) =>
  useDomainQuery<BeneficiarioCompleto | null>({
    queryKey: queryKeys.beneficiario(cpf),
    queryFn: () => getBeneficiarioCompleto(cpf),
  });
