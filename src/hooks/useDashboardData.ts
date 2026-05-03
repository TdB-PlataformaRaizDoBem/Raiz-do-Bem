import { useImpactStats } from "./useImpactStats";
import { useOrderStats } from "./useOrderState";
import { useProfessionalStats } from "./useProfessionalStats";

export const useDashboardData = () => {
  const orders = useOrderStats();
  const impact = useImpactStats();
  const pros = useProfessionalStats();

  return { orders, impact, pros };
};
