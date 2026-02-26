import type { ReactNode } from "react";
import Home from "../pages/home/Home";
import About from "../pages/about/About";
import Team from "../pages/Team/Team";
import Faq from "../pages/faq/Faq";
import Contact from "../pages/contact/Contact";

export interface AppRoute {
  path: string;
  element: ReactNode;
  title: string;
}

export const routes : AppRoute[] = [
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
];