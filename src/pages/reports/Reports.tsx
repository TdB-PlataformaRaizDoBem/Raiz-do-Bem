import { StaticCard } from "../../components/staticCard/staticCard";
import { useStats } from "../../hooks/useStats";

import reports from "../../assets/svgs/reports-stats.svg";
import register from "../../assets/svgs/register-stats.svg";
import voluntary from "../../assets/svgs/voluntary-stats.svg";
import time from "../../assets/svgs/time-stats.svg";
import ImpactChart from "../../components/impactChart/ImpactChart";
import { OrdersStatusBarChart } from "../../components/orderStatusBarChart/OrderStatusBarChart";

const Reports = () => {
  const stats = useStats();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center place-content-center gap-14">
        <section
          aria-label="quick-stats"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 xl:col-span-full gap-5"
        >
          <StaticCard
            icon={register}
            label="Total Beneficiários"
            value={`${stats.beneficiarios}`}
            description="Sorrisos Restaurados"
          />
          <StaticCard
            icon={reports}
            label="Pedidos de Ajuda"
            value={`${stats.pedidosPendentes}`}
            description="Esperando Triagem"
          />
          <StaticCard
            icon={voluntary}
            label="Voluntários"
            value={`${stats.dentistasDisponiveis}`}
            description="Dentistas Disponíveis"
          />
          <StaticCard
            icon={time}
            label="Horas de Voluntariado"
            value={`${stats.totalHorasImpactadas}h`}
            description="Horas estimadas de serviço voluntário."
          />
        </section>
        <ImpactChart />
        <OrdersStatusBarChart />
      </div>
    </>
  );
};

export default Reports;
