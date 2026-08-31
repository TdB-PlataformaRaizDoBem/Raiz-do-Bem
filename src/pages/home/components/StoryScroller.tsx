import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, motionQuery } from "../lib/gsap";
import { Reveal } from "./Reveal";

export interface StoryPanel {
  eyebrow: string;
  /** Cada string é renderizada como uma linha independente, revelada em cascata. */
  lines: string[];
  text: string;
  image: string;
  imageAlt: string;
}

interface StoryScrollerProps {
  panels: StoryPanel[];
}

/**
 * Sequência com pin + scrub, como o painel "A CHILD DISCOVERING..." da
 * referência: a seção fica presa na tela enquanto o scroll avança por
 * `panels.length` telas, alternando imagem de fundo (com parallax leve) e
 * título revelado linha a linha. Em telas pequenas ou com
 * prefers-reduced-motion, cai para uma lista empilhada estática — pin em
 * viewport curta é ruim de usar, então nem tentamos.
 */
export function StoryScroller({ panels }: StoryScrollerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<HTMLSpanElement[][]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const pin = pinRef.current;
      if (!wrapper || !pin) return;

      const mm = gsap.matchMedia();

      mm.add(`${motionQuery} and (min-width: 768px)`, () => {
        panelRefs.current.forEach((panel, i) => {
          if (!panel) return;
          gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0 });
        });

        const revealLines = (idx: number) => {
          const lines = lineRefs.current[idx];
          if (!lines?.length) return;
          gsap.fromTo(
            lines,
            { yPercent: 110, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.08 }
          );
        };

        revealLines(0);

        const trigger = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          // Curto de propósito: perto de 1 tela por painel. Mais que isso e o
          // pin passa a sensação de "scroll travado" em vez de transição.
          end: () => `+=${panels.length * window.innerHeight * 0.62}`,
          pin,
          anticipatePin: 1,
          // scrub:true (não um número) — o Lenis já suaviza o scroll físico;
          // somar um scrub numérico em cima disso dobra o atraso e é o que
          // fazia a seção parecer travada ao rolar.
          scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));

            if (idx !== activeIndexRef.current) {
              const prevEl = panelRefs.current[activeIndexRef.current];
              const nextEl = panelRefs.current[idx];
              activeIndexRef.current = idx;
              setActiveIndex(idx);

              if (prevEl) gsap.to(prevEl, { autoAlpha: 0, duration: 0.3, ease: "power1.out" });
              if (nextEl) {
                gsap.to(nextEl, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
                revealLines(idx);
              }
            }

            const localProgress = self.progress * panels.length - idx;
            const activeImage = imageRefs.current[idx];
            if (activeImage) gsap.set(activeImage, { yPercent: (localProgress - 0.5) * 10 });
          },
        });

        return () => trigger.kill();
      });
    },
    { scope: wrapperRef, dependencies: [panels.length] }
  );

  return (
    <>
      {/* Versão desktop com pin — escondida em telas < md ou com motion reduzido */}
      <div ref={wrapperRef} className="hidden md:motion-safe:block relative">
        <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-darkgreen">
          {panels.map((panel, i) => (
            <div
              key={panel.eyebrow}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="absolute inset-0"
              aria-hidden={i !== activeIndex}
            >
              <img
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                src={panel.image}
                alt={panel.imageAlt}
                className="absolute inset-0 h-[120%] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darkgreen/95 via-darkgreen/55 to-transparent" />

              <div className="relative z-10 h-full container mx-auto px-6 lg:px-10 flex flex-col justify-end pb-20 md:pb-28">
                <p className="inline-block w-fit uppercase tracking-[0.25em] text-xs font-bold text-lightgreen mb-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {panel.eyebrow}
                </p>
                <h3 className="font-fredoka font-bold text-white text-3xl md:text-5xl lg:text-6xl leading-[1.05] max-w-3xl mb-6">
                  {panel.lines.map((line, li) => (
                    <span key={li} className="block overflow-hidden">
                      <span
                        ref={(el) => {
                          if (!el) return;
                          lineRefs.current[i] = lineRefs.current[i] ?? [];
                          lineRefs.current[i][li] = el;
                        }}
                        className="block"
                      >
                        {line}
                      </span>
                    </span>
                  ))}
                </h3>
                <p className="text-white/80 text-base md:text-lg max-w-xl">{panel.text}</p>
              </div>
            </div>
          ))}

          {/* Indicador de progresso */}
          <div className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            {panels.map((panel, i) => (
              <span
                key={panel.eyebrow}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "bg-orange scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fallback mobile / motion reduzido — lista empilhada, sem pin */}
      <div className="block md:motion-safe:hidden">
        {panels.map((panel) => (
          <Reveal key={panel.eyebrow} className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
            <img src={panel.image} alt={panel.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-darkgreen/95 via-darkgreen/55 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-14">
              <p className="inline-block w-fit uppercase tracking-[0.25em] text-xs font-bold text-lightgreen mb-3 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {panel.eyebrow}
              </p>
              <h3 className="font-fredoka font-bold text-white text-3xl leading-[1.05] mb-4 text-balance">
                {panel.lines.join(" ")}
              </h3>
              <p className="text-white/80">{panel.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
