import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import { Beneficiarios } from "../gerenciaBeneficiarios/Beneficiarios";
import { Dentistas } from "../gerenciaDentistas/Dentistas";
import { PedidosAjuda } from "../pedidosAjuda/pedidosAjuda";
import { Designacao } from "../designacao/Designacao";
import ChatScreen from "../chat/ChatScreen";
import ConversasScreen from "../conversas/ConversasScreen";

const Ajuda = lazy(() => import("../ajuda/Ajuda"));
const PaginaNaoEncontrada = lazy(() =>
  import("../naoEncontrada/NaoEncontrada").then((m) => ({ default: m.PaginaInternaNaoEncontrada })),
);

const Coord = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="beneficiarios" element={<Beneficiarios />} />
      <Route path="dentistas" element={<Dentistas />} />
      <Route path="solicitacoes" element={<PedidosAjuda />} />
      <Route path="atendimento" element={<Designacao />} />
      <Route path="ajuda" element={<Ajuda />} />
      <Route path="chat" element={<ConversasScreen />} />
      <Route path="chat/:telefone" element={<ChatScreen />} />
      <Route path="*" element={<PaginaNaoEncontrada voltarPara="/coord/dashboard" />} />
    </Routes>
  );
};

export default Coord;
