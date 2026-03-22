import reports from "../../assets/svgs/reports-stats.svg";
import register from "../../assets/svgs/register-stats.svg";
import voluntary from "../../assets/svgs/voluntary-stats.svg";
import time from "../../assets/svgs/time-stats.svg";

import { StaticCard } from "../../components/staticCard/staticCard";
import { useDashboardData } from "../../hooks/useDashboardData";
import { OrdersStatusBarChart } from "../../components/orderStatusBarChart/OrderStatusBarChart";
import ImpactChart from "../../components/impactChart/ImpactChart";
import { StateRanking } from "../../components/StateRanking/StateRanking";
import { CriticalOrdersList } from "../../components/pendingOrdersList/PendingOrdersList";

const Dashboard = () => {
  const { orders, impact, pros } = useDashboardData();

  return (
    <div>
      <section
        aria-label="quick-stats"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
      >
        <StaticCard
          icon={register}
          label="Total Beneficiários"
          value={impact.total}
          description="Sorrisos Restaurados"
        />

        <StaticCard
          icon={reports}
          label="Pedidos de Ajuda"
          value={orders.pendentes}
          description="Esperando Triagem"
        />

        <StaticCard
          icon={voluntary}
          label="Voluntários"
          value={pros.dentistasDisponiveis}
          description="Dentistas Disponíveis"
        />

        <StaticCard
          icon={time}
          label="Horas de Voluntariado"
          value={`${impact.totalHoras}h`}
          description="Horas estimadas de serviço."
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <ImpactChart />
        <OrdersStatusBarChart />
        <StateRanking />
      </section>

      <section className="mb-6">
        <CriticalOrdersList />
      </section>
    </div>
  );
};

export default Dashboard;
