import type { ReactNode } from "react";

interface ConsentSectionProps {
  /** Resumo curto, em linguagem simples (primeira camada do aviso, art. 9º da LGPD). */
  resumo: ReactNode;
  children: ReactNode;
  tone?: "light" | "dark";
}

/** Agrupa o resumo do aviso de privacidade e as caixas de autorização de um formulário público. */
export function ConsentSection({ resumo, children, tone = "light" }: ConsentSectionProps) {
  const dark = tone === "dark";
  return (
    <fieldset
      className={`flex flex-col gap-4 rounded-lg border p-4 ${dark ? "border-white/30 bg-white/10 text-white" : "border-gray-300 text-black"}`}
    >
      <legend className="px-2 text-sm font-bold uppercase tracking-wider">Autorização para uso dos seus dados</legend>
      <div className="text-sm leading-relaxed">{resumo}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  );
}

/** Link para um documento legal. Abre em outra aba para não perder o que foi digitado. */
export function LegalLink({ to, children, tone = "light" }: { to: string; children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-bold underline underline-offset-2 ${tone === "dark" ? "text-white hover:text-amber" : "text-[#7a3f0a] hover:text-darkgreen"}`}
    >
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
