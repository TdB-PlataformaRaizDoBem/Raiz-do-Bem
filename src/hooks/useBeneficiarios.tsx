import { useAsync } from "./useAsync";
import {
  getBeneficiariosCompletos,
  getBeneficiarioCompleto,
  type BeneficiarioCompleto,
} from "../services/Beneficiarioservice";
 
// Lista completa — usada na página de gerenciamento
export const useBeneficiarios = () =>
  useAsync<BeneficiarioCompleto[]>(getBeneficiariosCompletos);
 
// Detalhe de um beneficiário por id — usado no renderDetails
export const useBeneficiario = (id: number) =>
  useAsync<BeneficiarioCompleto | null>(
    () => getBeneficiarioCompleto(id),
    [id]
  );