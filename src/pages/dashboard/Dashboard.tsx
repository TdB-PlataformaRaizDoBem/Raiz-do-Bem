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
        aria-labelledby="heading-resumo"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
      >
        <h2 id="heading-resumo" className="sr-only">Resumo de Impacto</h2>

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

      <section aria-labelledby="heading-graficos" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <h2 id="heading-graficos" className="sr-only">Gráficos de Desempenho</h2>
        <ImpactChart />
        <OrdersStatusBarChart />
        <StateRanking rankingEstado={impact.rankingEstado} />
      </section>

      <section aria-labelledby="heading-pedidos-criticos" className="mb-6">
        <h2 id="heading-pedidos-criticos" className="sr-only">Pedidos Críticos</h2>
        <CriticalOrdersList />
      </section>
    </div>
  );
};

export default Dashboard;
