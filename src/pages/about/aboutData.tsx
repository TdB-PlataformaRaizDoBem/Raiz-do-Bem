import OnePeopleIcon from "../../assets/svgs/one-people.svg";
import DoctorIcon from "../../assets/svgs/doctor.svg";
import BuildingIcon from "../../assets/svgs/bxs_building.svg";
import GroupPeoplesIcon from "../../assets/svgs/group-peoples.svg";

export interface StatItem {
  value: string;
  label: string;
}

export interface CultureItem {
  title: string;
  text?: string;
  list?: string[];
}

export interface ProposalItem {
  icon: string;
  span: string;
  text: string;
}

export const stats : StatItem[] = [
  { value: "12", label: "Países sendo atendidos pela Turma do Bem" },
  { value: "85", label: "Mil jovens tiveram seus sorrisos restaurados" },
  { value: "1,2", label: "Mil mulheres vítimas de agressão atendidas" },
  { value: "18,5", label: "Mil dentistas voluntários" },
];

export const culture_values : CultureItem[] = [
  {
    title: "Missão",
    text: "Usar a tecnologia como raiz para espalhar cuidado, esperança e dignidade, aproximando quem precisa de quem pode ajudar."
  },
  {
    title: "Visão",
    text: "Ser a principal plataforma digital de impacto social em saúde bucal, conectando milhões de pessoas em vulnerabilidade a dentistas voluntários no Brasil e no mundo."
  },
  {
    title: "Valores",
    list: ["Empatia", "Inovação com propósito", "Transparência", "Colaboração"]
  }
];

export const proposal : ProposalItem[] = [
  { icon: OnePeopleIcon, span: "Para os beneficiários:", text: "facilitar o acesso a triagens e acompanhamento odontológico." },
  { icon: DoctorIcon, span: "Para os dentistas voluntários:", text: "tornar o processo de adesão e atendimento mais simples." },
  { icon: BuildingIcon, span: "Para a gestão da TdB:", text: "integrar dados e garantir mais eficiência." },
  { icon: GroupPeoplesIcon, span: "Para a sociedade:", text: "mostrar com clareza o impacto e inspirar novas transformações." }
];