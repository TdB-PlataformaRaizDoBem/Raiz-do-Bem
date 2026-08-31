import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, motionQuery } from "../lib/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso em segundos antes do início da animação (para stagger manual). */
  delay?: number;
  /** Distância inicial em px que o elemento percorre ao revelar. */
  y?: number;
}

/**
 * Faz o conteúdo entrar (opacity + translateY) quando cruza o viewport.
 * Réplica em React do padrão de "scroll reveal" da referência: cada bloco
 * some/aparece uma vez, sem reversão, para não distrair ao rolar de volta.
 */
export function Reveal({ children, className = "", delay = 0, y = 32 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.matchMedia().add(motionQuery, () => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
