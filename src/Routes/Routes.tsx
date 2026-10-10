import { lazy, type ReactNode } from "react";

const Home = lazy(() => import("../pages/home/Home"));
const About = lazy(() => import("../pages/about/About"));
const Team = lazy(() => import("../pages/Team/Team"));
const Faq = lazy(() => import("../pages/faq/Faq"));
const Contact = lazy(() => import("../pages/contact/Contact"));
const Voluntary = lazy(() => import("../pages/voluntary/Voluntary"));

export interface AppRoute {
  path: string;
  element: ReactNode;
  title: string;
  /** Texto do `<meta name="description">` da rota (120 a 160 caracteres). */
  description?: string;
}

export const routes: AppRoute[] = [
  {
    path: "/",
    element: <Home />,
    title: "Home | Raiz do Bem",
    description: "Raiz do Bem conecta dentistas voluntários da Turma do Bem a crianças, jovens e mulheres em vulnerabilidade social que precisam de tratamento odontológico gratuito.",
  },
  {
    path: "/sobre",
    element: <About />,
    title: "Sobre | Raiz do Bem",
    description: "Conheça a origem, a jornada e os princípios da plataforma Raiz do Bem, criada para apoiar o trabalho voluntário da Turma do Bem em todo o Brasil.",
  },
  {
    path: "/integrantes",
    element: <Team />,
    title: "Integrantes | Raiz do Bem",
    description: "Conheça as pessoas que desenvolveram a plataforma Raiz do Bem para a Turma do Bem, com foco em acesso a tratamento odontológico gratuito.",
  },
  {
    path: "/faq",
    element: <Faq />,
    title: "FAQ | Raiz do Bem",
    description: "Tire dúvidas sobre como pedir ajuda, ser dentista voluntário e como funciona o atendimento odontológico gratuito da Turma do Bem pela plataforma Raiz do Bem.",
  },
  {
    path: "/contato",
    element: <Contact />,
    title: "Contato | Raiz do Bem",
    description: "Fale com a Turma do Bem: envie uma mensagem, veja o endereço da sede e saiba como pedir ajuda odontológica pela plataforma Raiz do Bem.",
  },
  {
    path: "/voluntario",
    element: <Voluntary />,
    title: "Seja Voluntário | Raiz do Bem",
    description: "Cadastre-se como dentista voluntário na plataforma Raiz do Bem e ajude a Turma do Bem a devolver sorrisos a quem mais precisa em todo o Brasil.",
  },
];
