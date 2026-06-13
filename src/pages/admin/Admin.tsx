import { Route, Routes } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import Colaborador from "./Colaborador";
import { Beneficiarios } from "../gerenciaBeneficiarios/Beneficiarios";
import { Dentistas } from "../gerenciaDentistas/Dentistas";
import { PedidosAjuda } from "../pedidosAjuda/pedidosAjuda";
import { Designacao } from "../designacao/Designacao";
import ChatScreen from "../chat/ChatScreen";
import ConversasScreen from "../conversas/ConversasScreen";

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
