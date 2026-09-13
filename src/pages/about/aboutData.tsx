import OnePeopleIcon from "../../assets/svgs/one-people.svg";
import DoctorIcon from "../../assets/svgs/doctor.svg";
import BuildingIcon from "../../assets/svgs/bxs_building.svg";
import GroupPeoplesIcon from "../../assets/svgs/group-peoples.svg";

export interface StatItem {
  value: string;
  /** Valor numérico usado para animar a contagem até `value`. */
  numericValue: number;
  /** Casas decimais do valor (ex.: 1 para "1,2"). */
  decimals?: number;
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

export interface TimelineItem {
  year: string;
  title: string;
  text: string;
}

export const stats : StatItem[] = [
  { value: "12", numericValue: 12, label: "Países sendo atendidos pela Turma do Bem" },
  { value: "85", numericValue: 85, label: "Mil jovens tiveram seus sorrisos restaurados" },
  { value: "1,2", numericValue: 1.2, decimals: 1, label: "Mil mulheres vítimas de agressão atendidas" },
  { value: "18,5", numericValue: 18.5, decimals: 1, label: "Mil dentistas voluntários" },
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

// Marcos reais da história da Turma do Bem (turmadobem.org.br).
export const timeline: TimelineItem[] = [
  { year: "1995", title: "15 mãos, um propósito", text: "O dentista Fábio Bibancos passa a tratar de graça quem não podia pagar, ao lado de 15 colegas de profissão." },
  { year: "2002", title: "Vira organização", text: "A Turma do Bem é formalizada como OSCIP — Organização da Sociedade Civil de Interesse Público." },
  { year: "2006", title: "Empreendedor Social", text: "O fundador é reconhecido pela Schwab Foundation como Empreendedor Social do ano." },
  { year: "2007", title: "Ashoka Fellow", text: "Fábio Bibancos passa a integrar a rede global Ashoka de empreendedores sociais." },
  { year: "2011", title: "Prêmio em Portugal", text: "A ONG recebe o Prêmio Saúde Bucal, categoria Solidariedade Social." },
  { year: "2015", title: "Epic Foundation", text: "Selecionada entre 1.400 organizações sociais de todo o mundo." },
  { year: "2018", title: "Fundación Mapfre", text: "Reconhecida na Espanha como a melhor ação social do ano." },
  { year: "2025", title: "Vira política pública", text: "O projeto Apolônias do Bem inspira o PL 15.116/25 e passa a integrar o SUS." },
];

export const proposal : ProposalItem[] = [
  { icon: OnePeopleIcon, span: "Para os beneficiários:", text: "facilitar o acesso a triagens e acompanhamento odontológico." },
  { icon: DoctorIcon, span: "Para os dentistas voluntários:", text: "tornar o processo de adesão e atendimento mais simples." },
  { icon: BuildingIcon, span: "Para a gestão da TdB:", text: "integrar dados e garantir mais eficiência." },
  { icon: GroupPeoplesIcon, span: "Para a sociedade:", text: "mostrar com clareza o impacto e inspirar novas transformações." }
];