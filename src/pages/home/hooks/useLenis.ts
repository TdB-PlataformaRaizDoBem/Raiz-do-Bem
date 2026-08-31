import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, motionQuery } from "../lib/gsap";

/**
 * Smooth scroll com inércia (Lenis), sincronizado ao ticker do GSAP para
 * que o ScrollTrigger continue lendo a posição real do scroll.
 *
 * Escopo: só roda enquanto a Home está montada. No unmount, o Lenis é
 * destruído e o ticker removido — as demais páginas (autenticadas ou não)
 * continuam com o scroll nativo do navegador, sem qualquer efeito colateral.
 */
export function useLenis() {
  useEffect(() => {
    if (!window.matchMedia(motionQuery).matches) return;

    const lenis = new Lenis({
      // Curto de propósito: um duration alto some com a resposta ao gesto de
      // scroll e dá sensação de "travado", principalmente dentro da seção
      // com pin. 0.8 ainda suaviza sem atrasar a resposta ao usuário.
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const onFrame = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onFrame);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onFrame);
      lenis.destroy();
    };
  }, []);
}
