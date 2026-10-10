import type { ReactNode } from "react";

export type LegalBlock =
  | { tipo: "p"; texto: ReactNode }
  | { tipo: "ul"; itens: ReactNode[] }
  | { tipo: "tabela"; legenda: string; colunas: string[]; linhas: ReactNode[][] };

export interface LegalSection {
  /** Âncora da seção (`/privacidade#cookies`). */
  id: string;
  titulo: string;
  blocos: LegalBlock[];
}

export interface LegalDocument {
  titulo: string;
  /** Uma frase em linguagem simples, mostrada abaixo do título. */
  resumo: string;
  secoes: LegalSection[];
}
