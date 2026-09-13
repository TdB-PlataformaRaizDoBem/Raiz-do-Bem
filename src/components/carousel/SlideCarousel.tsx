import { useEffect, useRef, useState } from "react";
import type { StoryPanel } from "../animation/StoryScroller";

interface SlideCarouselProps {
  panels: StoryPanel[];
}

/**
 * Carrossel convencional: cada slide é um cartão com foto + texto, o slide
 * ativo fica em destaque (escala e opacidade cheias) enquanto os vizinhos
 * ficam menores e discretos ao lado — arraste, toque, use as setas ou os
 * pontos. Sem prender o scroll da página: o carrossel é 100% independente
 * do scroll do site, então rolar a página nunca "trava".
 */
export function SlideCarousel({ panels }: SlideCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Descobre o slide ativo pela geometria real (centro do slide mais perto
  // do centro da trilha) a cada scroll — mais direto e confiável do que
  // esperar callbacks assíncronos de IntersectionObserver.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const updateActive = () => {
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      setActive((prev) => (prev === closestIdx ? prev : closestIdx));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };

    updateActive();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [panels.length]);

  // Arraste com o mouse no desktop (toque já rola nativamente).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("[scroll-snap-type:none]", "cursor-grabbing");
      track.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    };
    const endDrag = () => {
      dragging = false;
      track.classList.remove("[scroll-snap-type:none]", "cursor-grabbing");
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointerleave", endDrag);
    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", endDrag);
      track.removeEventListener("pointerleave", endDrag);
    };
  }, []);

  const goTo = (index: number) => {
    const target = slideRefs.current[index];
    if (!target) return;
    // Atualiza o estado já no clique (feedback imediato nas setas/pontos) —
    // o listener de scroll também corrige sozinho se o usuário arrastar.
    setActive(index);
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const prev = () => goTo(Math.max(0, active - 1));
  const next = () => goTo(Math.min(panels.length - 1, active + 1));

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab py-4 px-[8vw] md:px-[calc(50%-350px)]"
        role="region"
        aria-label="Histórias em destaque"
      >
        {panels.map((panel, i) => (
          <div
            key={panel.eyebrow}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={`snap-center shrink-0 w-[84vw] max-w-[700px] transition-all duration-500 ease-out ${
              i === active ? "opacity-100 scale-100" : "opacity-55 scale-[0.88]"
            }`}
            aria-hidden={i !== active}
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-xl">
              <img
                src={panel.image}
                alt={panel.imageAlt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darkgreen/95 via-darkgreen/45 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 md:p-10">
                <p className="inline-block w-fit uppercase tracking-[0.25em] text-xs font-bold text-lightgreen mb-3 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {panel.eyebrow}
                </p>
                <h3 className="font-fredoka font-bold text-white text-2xl sm:text-3xl md:text-4xl leading-[1.1] mb-3 text-balance">
                  {panel.lines.join(" ")}
                </h3>
                <p className="text-white/80 text-sm md:text-base max-w-lg">{panel.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Setas */}
      <button
        type="button"
        onClick={prev}
        disabled={active === 0}
        aria-label="Slide anterior"
        className="hidden sm:flex items-center justify-center absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg text-darkgreen disabled:opacity-30 disabled:cursor-not-allowed motion-safe:hover:scale-105 motion-safe:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        disabled={active === panels.length - 1}
        aria-label="Próximo slide"
        className="hidden sm:flex items-center justify-center absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg text-darkgreen disabled:opacity-30 disabled:cursor-not-allowed motion-safe:hover:scale-105 motion-safe:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Pontos */}
      <div className="flex justify-center gap-3 mt-8">
        {panels.map((panel, i) => (
          <button
            key={panel.eyebrow}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir para o slide ${i + 1}: ${panel.eyebrow}`}
            aria-current={i === active}
            className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/60 ${
              i === active ? "w-8 h-2.5 bg-orange" : "w-2.5 h-2.5 bg-darkgreen/20 hover:bg-darkgreen/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
