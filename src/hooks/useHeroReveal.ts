import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, motionQuery } from "../lib/gsap";

interface UseHeroRevealOptions {
  /** Elemento que delimita o contexto GSAP (revertido automaticamente ao desmontar). */
  scope: RefObject<HTMLElement | null>;
  /** Título revelado linha a linha via SplitText quando a Home/página monta. */
  heading: RefObject<HTMLElement | null>;
  /** Demais elementos do hero (eyebrow, card, CTAs...) que entram em fade logo depois do título. */
  fadeEls: RefObject<(HTMLElement | null)[]>;
}

/**
 * Reveal de hero em duas camadas: título em linhas (GSAP SplitText, como o
 * "PLAY TO / THRIVE" da referência) seguido do fade dos elementos de apoio.
 * Usado tanto na Home quanto no Sobre para manter a mesma abertura de página.
 */
export function useHeroReveal({ scope, heading, fadeEls }: UseHeroRevealOptions) {
  useGSAP(
    () => {
      const headingEl = heading.current;
      if (!headingEl) return;

      let cancelled = false;
      const mm = gsap.matchMedia();

      mm.add(motionQuery, () => {
        document.fonts.ready.then(() => {
          if (cancelled) return;
          const split = new SplitText(headingEl, { type: "lines", mask: "lines" });
          gsap.from(split.lines, {
            yPercent: 110,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.12,
          });
        });

        gsap.from(fadeEls.current.filter(Boolean), {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.5,
        });

        return () => {
          cancelled = true;
        };
      });

      mm.add(`(prefers-reduced-motion: reduce)`, () => {
        gsap.set([headingEl, ...fadeEls.current], { autoAlpha: 1 });
      });
    },
    { scope }
  );
}
