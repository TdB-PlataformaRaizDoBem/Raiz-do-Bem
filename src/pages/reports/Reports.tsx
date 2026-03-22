import { StaticCard } from "../../components/staticCard/staticCard";
import ImpactChart from "../../components/impactChart/ImpactChart";
import { OrdersStatusBarChart } from "../../components/orderStatusBarChart/OrderStatusBarChart";

// Usando o Hook unificado que separa 'orders' e 'impact'
import { useDashboardData } from "../../hooks/useDashboardData"; 

// Ícones
import reports from "../../assets/svgs/reports-stats.svg";
import register from "../../assets/svgs/register-stats.svg";
import voluntary from "../../assets/svgs/voluntary-stats.svg";
import time from "../../assets/svgs/time-stats.svg";
import { StateRanking } from "../../components/StateRanking/StateRanking";

const Reports = () => {
  // Agora temos os dados divididos por domínio
  const { orders, impact, pros } = useDashboardData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-center place-content-center gap-14">
      {/* Seção de Flash Cards - Ocupa a largura total (col-span-full) em telas grandes */}
      <section
        aria-label="quick-stats"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:col-span-full gap-5"
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
          description="Horas estimadas de serviço voluntário."
        />
      </section>

      {/* Gráficos de Pizza e Barras Horizontais */}
      <ImpactChart />
      <OrdersStatusBarChart />
      <StateRanking />
    </div>
  );
};

export default Reports;