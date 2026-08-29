import MemberMurilo from "../../assets/img/member-murilo.png";
import MemberPaulo  from "../../assets/img/member-paulo-2.png";
import MemberRenan  from "../../assets/img/member-renan.png";
export interface TeamMember {
  name: string;
  rm: string;
  turma: string;
  role: string;
  bio: string;
  skills: string[];
  image: string;
  linkedin: string;
  github: string;
  alt: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Murilo Ayabe",
    rm: "RM567479",
    turma: "TDSPS",
    role: "Data & ML Engineer",
    bio: "Idealizou o modelo preditivo de demanda com dados do IBGE, validando o MVP inicial, realizando os testes de treino/teste (80/20) e estruturando os endpoints com FastAPI e Pandas.",
    skills: ["Python", "Pandas", "FastAPI", "Data Science", "Machine Learning"],
    image: MemberMurilo,
    linkedin: "https://www.linkedin.com/in/muriloayabe/",
    github: "https://github.com/muriloseverino",
    alt: "Foto do Murilo Ayabe",
  },
  {
    name: "Paulo Cavalcante",
    rm: "RM566667",
    turma: "TDSPS",
    role: "Backend Engineer Core",
    bio: "Desenvolveu a API core responsável por autenticação e fluxos centrais da aplicação em Java com Quarkus, além de modelar e implementar o banco de dados principal.",
    skills: ["Java", "Quarkus", "Oracle Database", "Database Modeling", "REST APIs"],
    image: MemberPaulo,
    linkedin: "https://www.linkedin.com/in/paulocavalcantec/",
    github: "https://github.com/cavalcantecpaulo",
    alt: "Foto do Paulo Cavalcante",
  },
  {
    name: "Renan Paulino",
    rm: "RM566610",
    turma: "TDSPS",
    role: "Full Stack Engineer & UI/UX",
    bio: "Liderou o UI/UX e desenvolvimento front-end com React/TS mantendo o Design System. No back-end, criou o microserviço de mensageria em tempo real do WhatsApp via FastAPI/MongoDB e deu continuidade à pipeline preditiva.",
    skills: ["React", "TypeScript", "UI/UX", "FastAPI", "MongoDB", "Python", "Tailwind CSS"],
    image: MemberRenan,
    linkedin: "https://www.linkedin.com/in/renansilvapaulino/",
    github: "https://github.com/devRenanPaulino",
    alt: "Foto do Renan Paulino",
  },
];
