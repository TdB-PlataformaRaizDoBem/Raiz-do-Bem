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

function SectionLabel({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4"
    >
      {children}
    </h2>
  );
}

const Dashboard = () => {
  const { orders, impact, pros } = useDashboardData();

  return (
    <div className="flex flex-col gap-12">

      <section aria-labelledby="heading-resumo">
        <SectionLabel id="heading-resumo">Resumo de Impacto</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaticCard
            color="green"
            icon={register}
            label="Total Beneficiários"
            value={impact.total}
            description="Sorrisos restaurados"
          />
          <StaticCard
            color="orange"
            icon={reports}
            label="Pedidos de Ajuda"
            value={orders.pendentes}
            description="Esperando triagem"
          />
          <StaticCard
            color="lightgreen"
            icon={voluntary}
            label="Voluntários"
            value={pros.dentistasDisponiveis}
            description="Dentistas disponíveis"
          />
          <StaticCard
            color="amber"
            icon={time}
            label="Horas de Voluntariado"
            value={`${impact.totalHoras}h`}
            description="Horas estimadas de serviço"
          />
        </div>
      </section>

      <section aria-labelledby="heading-graficos">
        <SectionLabel id="heading-graficos">Gráficos de Desempenho</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImpactChart />
          <OrdersStatusBarChart />
          <StateRanking rankingEstado={impact.rankingEstado} />
        </div>
      </section>

      <section aria-labelledby="heading-pedidos-criticos">
        <SectionLabel id="heading-pedidos-criticos">Pedidos Críticos</SectionLabel>
        <CriticalOrdersList />
      </section>

    </div>
  );
};

export default Dashboard;
