import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * `no-preference` só é verdadeiro quando o usuário não pediu para reduzir
 * movimento — todo efeito de scroll/parallax da Home fica dentro deste
 * matchMedia para que prefers-reduced-motion desligue tudo de uma vez.
 */
export const motionQuery = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText };
