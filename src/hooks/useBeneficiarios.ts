import { getBeneficiariosCompletos, getBeneficiarioCompleto, type BeneficiarioCompleto } from "../services/Beneficiarioservice";
import { queryKeys } from "./queryKeys";
import { useDomainQuery } from "./useDomainQuery";

// Lista completa — usada na página de gerenciamento, no dashboard e na busca de contatos do chat
export const useBeneficiarios = () =>
  useDomainQuery<BeneficiarioCompleto[]>({
    queryKey: queryKeys.beneficiarios,
    queryFn: getBeneficiariosCompletos,
  });

// beneficiário por cpf
export const useBeneficiario = (cpf: string) =>
  useDomainQuery<BeneficiarioCompleto | null>({
    queryKey: queryKeys.beneficiario(cpf),
    queryFn: () => getBeneficiarioCompleto(cpf),
  });
