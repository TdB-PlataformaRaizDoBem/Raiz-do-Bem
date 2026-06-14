import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("../dashboard/Dashboard"));
const Colaborador = lazy(() => import("./Colaborador"));
const Beneficiarios = lazy(() => import("../gerenciaBeneficiarios/Beneficiarios").then((m) => ({ default: m.Beneficiarios })));
const Dentistas = lazy(() => import("../gerenciaDentistas/Dentistas").then((m) => ({ default: m.Dentistas })));
const PedidosAjuda = lazy(() => import("../pedidosAjuda/pedidosAjuda").then((m) => ({ default: m.PedidosAjuda })));
const Designacao = lazy(() => import("../designacao/Designacao").then((m) => ({ default: m.Designacao })));
const ConversasScreen = lazy(() => import("../conversas/ConversasScreen"));
const ChatScreen = lazy(() => import("../chat/ChatScreen"));

const Admin = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="colaboradores" element={<Colaborador />} />
      <Route path="beneficiarios" element={<Beneficiarios />} />
      <Route path="dentistas" element={<Dentistas />} />
      <Route path="solicitacoes" element={<PedidosAjuda />} />
      <Route path="atendimento" element={<Designacao />} />
      <Route path="chat" element={<ConversasScreen />} />
      <Route path="chat/:telefone" element={<ChatScreen />} />
    </Routes>
  );
};

export default Admin;
