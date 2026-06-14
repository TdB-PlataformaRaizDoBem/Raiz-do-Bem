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
}

export const routes: AppRoute[] = [
  {
    path: "/",
    element: <Home />,
    title: "Home | Raiz do Bem",
  },
  {
    path: "/sobre",
    element: <About />,
    title: "Sobre | Raiz do Bem",
  },
  {
    path: "/integrantes",
    element: <Team />,
    title: "Integrantes | Raiz do Bem",
  },
  {
    path: "/faq",
    element: <Faq />,
    title: "FAQ | Raiz do Bem",
  },
  {
    path: "/contato",
    element: <Contact />,
    title: "Contato | Raiz do Bem",
  },
  {
    path: "/voluntario",
    element: <Voluntary />,
    title: "Seja Voluntário | Raiz do Bem",
  },
];
