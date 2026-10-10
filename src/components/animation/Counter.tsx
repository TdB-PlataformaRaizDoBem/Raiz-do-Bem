import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, motionQuery } from "../../lib/gsap";

interface CounterProps {
  /** Valor final exibido. */
  value: number;
  /** Texto fixo antes do número, ex.: "+". */
  prefix?: string;
  /** Texto fixo depois do número, ex.: " mil". */
  suffix?: string;
  /** Casas decimais fixas, ex.: 1 para exibir "1,2". */
  decimals?: number;
  className?: string;
}

/**
 * Número que conta de 0 até `value` quando entra na tela — a mesma leitura
 * de "prova de impacto" da seção de estatísticas da referência, só que
 * calculada em tempo real em vez de texto estático.
 */
export function Counter({ value, prefix = "", suffix = "", decimals = 0, className = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatter = useMemo(
    () => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [decimals]
  );

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(motionQuery, () => {
        // O HTML nasce com o valor final (leitores de tela e rastreadores leem o número real);
        // a contagem só zera o texto aqui, antes da primeira pintura, para animar de 0 até o valor.
        el.textContent = `${prefix}${formatter.format(0)}${suffix}`;
        const counter = { n: 0 };
        gsap.to(counter, {
          n: value,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = `${prefix}${formatter.format(counter.n)}${suffix}`;
          },
        });
      });

      mm.add(`(prefers-reduced-motion: reduce)`, () => {
        el.textContent = `${prefix}${formatter.format(value)}${suffix}`;
      });
    },
    { scope: ref, dependencies: [value, prefix, suffix, formatter] }
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter.format(value)}
      {suffix}
    </span>
  );
}
