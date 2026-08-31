import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, motionQuery } from "../lib/gsap";

interface CounterProps {
  /** Valor final exibido. */
  value: number;
  /** Texto fixo antes do número, ex.: "+". */
  prefix?: string;
  /** Texto fixo depois do número, ex.: " mil". */
  suffix?: string;
  className?: string;
}

const formatter = new Intl.NumberFormat("pt-BR");

/**
 * Número que conta de 0 até `value` quando entra na tela — a mesma leitura
 * de "prova de impacto" da seção de estatísticas da referência, só que
 * calculada em tempo real em vez de texto estático.
 */
export function Counter({ value, prefix = "", suffix = "", className = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(motionQuery, () => {
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
            el.textContent = `${prefix}${formatter.format(Math.round(counter.n))}${suffix}`;
          },
        });
      });

      mm.add(`(prefers-reduced-motion: reduce)`, () => {
        el.textContent = `${prefix}${formatter.format(value)}${suffix}`;
      });
    },
    { scope: ref, dependencies: [value, prefix, suffix] }
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter.format(0)}
      {suffix}
    </span>
  );
}
