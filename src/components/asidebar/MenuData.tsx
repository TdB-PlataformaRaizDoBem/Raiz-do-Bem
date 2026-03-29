import painelGeral from "../../assets/svgs/painelGeral.svg";
import coordenadores from "../../assets/svgs/Coordenadores.svg";
import dentista from "../../assets/svgs/dentista.svg";
import beneficiario from "../../assets/svgs/beneficiario.svg";
import solicitacoes from "../../assets/svgs/pedidosAjuda.svg";

export interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

export const Menu_Data: Record<"admin" | "coordenador", MenuItem[]> = {
  admin: [
    { label: "Painel Geral", icon: painelGeral, path: "/admin/dashboard" },
    { label: "Colaboradores", icon: coordenadores, path: "/admin/colaboradores" },
    { label: "Dentistas", icon: dentista, path: "/admin/dentistas" },
    { label: "Beneficiários", icon: beneficiario, path: "/admin/beneficiarios" },
    { label: "Pedidos de Ajuda", icon: solicitacoes, path: "/admin/solicitacoes" },
  ],
  coordenador: [
    { label: "Painel Geral", icon: painelGeral, path: "/coord/dashboard" },
    { label: "Pedidos de Ajuda", icon: solicitacoes, path: "/coord/solicitacoes" },
    { label: "Beneficiários", icon: beneficiario, path: "/coord/beneficiarios" },
    { label: "Dentistas", icon: dentista, path: "/coord/dentistas" },
  ],
};