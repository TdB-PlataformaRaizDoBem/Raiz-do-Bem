import { useRef } from "react";
import { Link } from "react-router-dom";

import HeroPhoto from "../../assets/img/hero-dentista-exame.jpg";
import VoluntariosImg from "../../assets/img/voluntarios-atendimento.jpg";
import CriancasImg from "../../assets/img/criancas-escovando-dentes.jpg";
import DentistasRedeImg from "../../assets/img/dentistas-tdb.png";
import DentistaDoBemImg from "../../assets/img/dentistaDoBem2.png";
import ApoloniaImg from "../../assets/img/Apolonia2.png";
import ApoloniaAtendimentoImg from "../../assets/img/apolonia-atendimento-odontologico.jpg";
import MascoteDentinho from "../../assets/img/dentinhoIntegrantes.png";
import Abstract2 from "../../assets/svgs/abstract2.svg";
import Abstract3 from "../../assets/svgs/abstract3.svg";
import TdbLogo from "../../assets/svgs/TDB_logo.svg";

import { useGSAP } from "@gsap/react";
import { gsap, SplitText, motionQuery } from "./lib/gsap";
import { useLenis } from "./hooks/useLenis";
import { Reveal } from "./components/Reveal";
import { Counter } from "./components/Counter";
import { StoryScroller, type StoryPanel } from "./components/StoryScroller";

const sectionLabel =
  "text-[10px] uppercase tracking-[0.2em] text-darkgreen/60 font-bold mb-2 block text-center";
const sectionTitle =
  "text-center font-fredoka text-3xl md:text-5xl lg:text-[4rem] font-bold text-balance";
const containerMax = "max-w-[1240px] mx-auto";

const btnBase =
  "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
const btnPrimaryOnDark = `${btnBase} bg-orange text-white shadow-lg hover:bg-[#e07c1c] motion-safe:hover:-translate-y-1 focus-visible:ring-orange/70 focus-visible:ring-offset-darkgreen`;
const btnSecondaryOnDark = `${btnBase} bg-white/10 text-white border-2 border-white/40 backdrop-blur-sm hover:bg-white/20 hover:border-white motion-safe:hover:-translate-y-1 focus-visible:ring-white/70 focus-visible:ring-offset-darkgreen`;
const btnPrimaryOnLight = `${btnBase} bg-orange text-white shadow-lg hover:bg-[#e07c1c] motion-safe:hover:-translate-y-1 focus-visible:ring-orange/60 focus-visible:ring-offset-white`;
const btnOutlineOnLight = `${btnBase} border-2 border-darkgreen text-darkgreen hover:bg-darkgreen/5 motion-safe:hover:-translate-y-1 focus-visible:ring-darkgreen/40 focus-visible:ring-offset-white`;

// Números oficiais divulgados pela Turma do Bem (turmadobem.org.br), 2026.
const impact_stats = [
  { value: 90000, suffix: "+", label: "Jovens com sorrisos restaurados" },
  {
    value: 1200,
    suffix: "+",
    label: "Mulheres atendidas pelo Apolônias do Bem",
  },
  { value: 18000, suffix: "+", label: "Dentistas voluntários engajados" },
  { value: 12, suffix: "", label: "Países atendidos — do Brasil a Portugal" },
];

const story_panels: StoryPanel[] = [
  {
    eyebrow: "Dentista do Bem",
    lines: ["Uma criança que aprende", "a sorrir sem vergonha"],
    text: "Jovens de 11 a 17 anos em vulnerabilidade social recebem tratamento odontológico completo e gratuito até completarem 18 anos, um atendimento por vez.",
    image: CriancasImg,
    imageAlt:
      "Duas crianças escovando os dentes juntas, aprendendo hábitos de higiene bucal",
  },
  {
    eyebrow: "Apolônias do Bem",
    lines: ["Uma mulher que reconstrói", "sua história, dente por dente"],
    text: "Mulheres cis e trans que tiveram a dentição afetada por violência recebem tratamento integral gratuito — e, desde 2025, esse cuidado também vira política pública no SUS.",
    image: ApoloniaAtendimentoImg,
    imageAlt:
      "Dentista realiza atendimento odontológico em paciente mulher, em consultório iluminado",
  },
  {
    eyebrow: "Rede de Voluntários",
    lines: ["Um dentista que multiplica", "esperança, um gesto por vez"],
    text: "Mais de 18 mil cirurgiões-dentistas voluntários, em 1.500 municípios brasileiros e outros 11 países, doam tempo e profissão sem custo algum para quem mais precisa.",
    image: DentistasRedeImg,
    imageAlt:
      "Centenas de dentistas voluntários da Turma do Bem reunidos em mutirão de atendimento",
  },
];

const programs_content = [
  {
    img: DentistaDoBemImg,
    title: "Dentistas do Bem",
    abstract: Abstract2,
    text: "Cirurgiões-dentistas voluntários oferecem tratamento odontológico gratuito a crianças e jovens em situação de vulnerabilidade social, do diagnóstico até os 18 anos.",
    badge: null as string | null,
  },
  {
    img: ApoloniaImg,
    title: "Apolônia do Bem",
    abstract: Abstract3,
    text: "Tratamento odontológico integral e gratuito para mulheres cis e trans que tiveram a dentição afetada por situações de violência. Já são mais de 1.200 histórias reconstruídas.",
    badge: "Agora é política pública",
  },
];

const news_content = [
  {
    tag: "Política Pública",
    date: "2025",
    title: "Apolônias do Bem vira política pública nacional",
    text: '"Reconstruir um dente é também reconstruir uma história." Com a sanção do PL 15.116/25, o SUS passa a oferecer o Programa de Reconstrução Dentária para Mulheres Vítimas de Violência Doméstica — inspirado diretamente no projeto da Turma do Bem.',
    href: "https://turmadobem.org.br/da-turma-do-bem-para-o-sus-projeto-apolonias-do-bem-vira-politica-publica/",
  },
  {
    tag: "Mobilização Nacional",
    date: "28 de abril",
    title: "Megatriagem 2026 passou por 156 municípios",
    text: "Voluntários avaliaram jovens de 11 a 17 anos em todo o país em um único dia, com a expectativa de encaminhar mais de 5 mil novos pacientes para tratamento gratuito completo.",
    href: "https://megatriagem.tdb.org.br/",
  },
  {
    tag: "Nossa História",
    date: "Desde 2002",
    title: "Mais de duas décadas transformando sorrisos",
    text: "Fundada pelo cirurgião-dentista Fábio Bibancos, a Turma do Bem já rendeu ao fundador o título de Ashoka Fellow e de Empreendedor Social pela Schwab Foundation, além de prêmios em Portugal e na Espanha.",
    href: "https://turmadobem.org.br/",
  },
];

const help_cards = [
  {
    number: "01",
    title: "Doe Agora",
    text: "Sua doação financia tratamentos odontológicos completos para quem mais precisa.",
    href: "#",
    cta: "Doar",
  },
  {
    number: "02",
    title: "Seja Voluntário",
    text: "Ofereça seu tempo e conhecimento como dentista para transformar sorrisos.",
    to: "/voluntario",
    cta: "Quero ajudar",
  },
  {
    number: "03",
    title: "Peça Ajuda",
    text: "Precisa de atendimento odontológico gratuito? Fale com a gente.",
    to: "/contato",
    cta: "Entrar em contato",
  },
  {
    number: "04",
    title: "Compartilhe",
    text: "Espalhe a mensagem e ajude a Turma do Bem a alcançar mais pessoas.",
    to: "/sobre",
    cta: "Conheça a causa",
  },
];

const Home = () => {
  useLenis();

  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const heroFadeRefs = useRef<(HTMLElement | null)[]>([]);
  const mascotRef = useRef<HTMLImageElement>(null);
  const mascotSectionRef = useRef<HTMLDivElement>(null);

  // Reveal do título em linhas (GSAP SplitText) + fade dos elementos de apoio ao carregar a Home.
  useGSAP(
    () => {
      const heading = headingRef.current;
      if (!heading) return;

      let cancelled = false;
      const mm = gsap.matchMedia();

      mm.add(motionQuery, () => {
        document.fonts.ready.then(() => {
          if (cancelled) return;
          const split = new SplitText(heading, {
            type: "lines",
            mask: "lines",
          });
          gsap.from(split.lines, {
            yPercent: 110,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.12,
          });
        });

        gsap.from(heroFadeRefs.current.filter(Boolean), {
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
        gsap.set([heading, ...heroFadeRefs.current], { autoAlpha: 1 });
      });
    },
    { scope: heroRef },
  );

  // Parallax sutil do mascote ao rolar a seção "Junte-se a nós".
  useGSAP(
    () => {
      const section = mascotSectionRef.current;
      const mascot = mascotRef.current;
      if (!section || !mascot) return;

      gsap.matchMedia().add(motionQuery, () => {
        gsap.to(mascot, {
          yPercent: -12,
          rotate: -6,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: mascotSectionRef },
  );

  return (
    <div className="w-full overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative w-full">
        <div className="relative w-full h-[62vh] sm:h-[70vh] md:h-[85vh] md:min-h-[640px]">
          <img
            src={HeroPhoto}
            alt="Dentista voluntário da Turma do Bem examina os dentes de uma criança atendida"
            className="absolute inset-0 w-full h-full object-cover object-[38%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkgreen/90 via-darkgreen/10 to-transparent md:hidden" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-darkgreen/90 via-darkgreen/25 to-transparent" />

          <div className="relative z-10 h-full container mx-auto px-6 flex flex-col justify-end md:justify-center pb-10 md:pb-0">
            <p
              ref={(el) => {
                heroFadeRefs.current[0] = el;
              }}
              className="uppercase tracking-[0.25em] text-[11px] md:text-xs font-bold text-lightgreen mb-4"
            >
              Turma do Bem · Raiz do Bem
            </p>
            <h1
              ref={headingRef}
              className="font-fredoka font-bold text-white uppercase leading-[0.92] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] max-w-3xl text-balance"
            >
              Um sorriso <span className="text-amber">que transforma</span>
            </h1>
          </div>

          {/* Card flutuante — somente desktop */}
          <div
            ref={(el) => {
              heroFadeRefs.current[1] = el;
            }}
            className="hidden md:block absolute right-10 lg:right-20 bottom-14 lg:bottom-20 z-20 bg-white rounded-2xl shadow-2xl p-8 max-w-sm"
          >
            <p className="text-gray-700 leading-relaxed">
              Há mais de duas décadas, uma rede de 18 mil dentistas voluntários
              devolve sorrisos e dignidade a quem mais precisa — no Brasil e em
              outros 11 países, até Portugal.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="#ajudar"
                className={`${btnPrimaryOnLight} px-6 py-3 text-sm`}
              >
                Doar Agora
              </a>
              <Link
                to="/sobre"
                className={`${btnOutlineOnLight} px-6 py-3 text-sm`}
              >
                Saiba Mais
              </Link>
            </div>
          </div>
        </div>

        {/* Pitch — somente mobile */}
        <div className="md:hidden bg-darkgreen px-6 py-10">
          <p className="text-white/85 leading-relaxed mb-6">
            Há mais de duas décadas, uma rede de 18 mil dentistas voluntários
            devolve sorrisos e dignidade a quem mais precisa — no Brasil e em
            outros 11 países, até Portugal.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="#ajudar"
              className={`${btnPrimaryOnDark} px-8 py-3.5 text-base`}
            >
              Doar Agora
            </a>
            <Link
              to="/sobre"
              className={`${btnSecondaryOnDark} px-8 py-3.5 text-base`}
            >
              Saiba Mais
            </Link>
          </div>
        </div>
      </section>

      {/* ── HISTÓRIAS EM SCROLL (pin + parallax + text reveal) ──────────── */}
      <section className="bg-white pt-16 md:pt-24 pb-6 px-6">
        <span className={sectionLabel}>Nossa Missão</span>
        <h2 className={`${sectionTitle} max-w-3xl mx-auto text-balance`}>
          Por trás de cada consulta, existe uma história sendo transformada
        </h2>
      </section>
      <StoryScroller panels={story_panels} />

      {/* ── IMPACTO ──────────────────────────────────────────────────── */}
      <section className="bg-cream py-20 md:py-28 px-6">
        <span className={sectionLabel}>Nosso Impacto</span>
        <h2 className={`${sectionTitle} mb-14 md:mb-16 max-w-3xl mx-auto`}>
          Acesso a um Sorriso Saudável pelo Mundo
        </h2>
        <ul
          className={`grid grid-cols-2 lg:grid-cols-4 gap-10 text-center ${containerMax}`}
        >
          {impact_stats.map((item) => (
            <li key={item.label} className="flex flex-col items-center gap-2">
              <Counter
                value={item.value}
                suffix={item.suffix}
                className="font-fredoka text-4xl md:text-6xl font-bold text-darkgreen block tabular-nums"
              />
              <p className="text-sm md:text-base font-semibold text-gray-600 max-w-[180px] leading-snug">
                {item.label}
              </p>
            </li>
          ))}
        </ul>

        <Reveal className={`${containerMax} mt-14 md:mt-16`}>
          <div className="bg-darkgreen rounded-3xl px-8 py-7 md:px-12 md:py-9 flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-between text-center md:text-left">
            <div>
              <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-bold text-lightgreen mb-2">
                Aconteceu em 2026
              </span>
              <p className="text-white font-fredoka text-xl md:text-2xl font-bold text-balance">
                Megatriagem 2026 passou por 156 municípios em um único dia, 28
                de abril.
              </p>
            </div>
            <a
              href="https://megatriagem.tdb.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnPrimaryOnDark} px-6 py-3 text-sm shrink-0`}
            >
              Ver a Megatriagem
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── PROGRAMAS (BENTO) ────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28 px-6">
        <span className={sectionLabel}>Iniciativas</span>
        <h2 className={`${sectionTitle} mb-14 md:mb-16 max-w-2xl mx-auto`}>
          Programas da Turma do Bem
        </h2>

        <div
          className={`flex flex-col lg:flex-row justify-center gap-8 lg:gap-10 ${containerMax}`}
        >
          {programs_content.map((prog, idx) => (
            <Reveal key={prog.title} delay={idx * 0.12} className="w-full">
              <article
                className="bg-orange rounded-3xl w-full flex flex-col relative p-6 pb-20 z-10 shadow-lg overflow-hidden
                           motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-300"
              >
                {prog.badge && (
                  <span className="absolute top-6 right-6 z-20 bg-white/15 backdrop-blur-sm border border-white/40 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {prog.badge}
                  </span>
                )}
                <img
                  src={prog.img}
                  alt={prog.title}
                  className="w-full h-56 rounded-2xl object-cover"
                />
                <h3 className="text-white font-fredoka text-2xl md:text-[2rem] font-bold my-5">
                  {prog.title}
                </h3>
                <p className="text-white text-sm md:text-base leading-relaxed max-w-[522px] relative z-10">
                  {prog.text}
                </p>
                <img
                  src={prog.abstract}
                  className="absolute bottom-0 left-0 w-full pointer-events-none"
                  alt=""
                  aria-hidden="true"
                />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── NOTÍCIAS & CONQUISTAS ────────────────────────────────────── */}
      <section className="bg-darkgreen py-20 md:py-28 px-6">
        <span className="text-[10px] uppercase tracking-[0.2em] text-lightgreen font-bold mb-2 block text-center">
          Notícias &amp; Conquistas
        </span>
        <h2 className="text-center font-fredoka text-3xl md:text-5xl font-bold text-white text-balance mb-14 md:mb-16 max-w-2xl mx-auto">
          O que está acontecendo agora
        </h2>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 ${containerMax}`}
        >
          {news_content.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.1}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/25 motion-safe:transition-all motion-safe:hover:-translate-y-1 duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/60"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-orange bg-orange/10 px-2.5 py-1 rounded-full">
                    {item.tag}
                  </span>
                  <span className="text-xs text-white/50">{item.date}</span>
                </div>
                <h3 className="font-fredoka font-bold text-lg text-white mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed flex-1">
                  {item.text}
                </p>
                <span className="text-sm font-bold text-lightgreen mt-5 group-hover:underline">
                  Leia a matéria completa →
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── COMO AJUDAR ──────────────────────────────────────────────── */}
      <section id="ajudar" className="bg-cream py-20 md:py-28 px-6">
        <span className={sectionLabel}>Como Ajudar</span>
        <h2 className={`${sectionTitle} mb-14 md:mb-16 max-w-2xl mx-auto`}>
          Escolha seu Jeito de Transformar Vidas
        </h2>

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch ${containerMax}`}
        >
          <Reveal className="rounded-3xl overflow-hidden shadow-lg min-h-[280px]">
            <img
              src={VoluntariosImg}
              alt="Equipe de voluntários realizando atendimento odontológico"
              className="w-full h-full object-cover"
            />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {help_cards.map((card, idx) => (
              <Reveal key={card.title} delay={idx * 0.08}>
                <div
                  className="bg-white rounded-2xl p-6 shadow-sm flex flex-col h-full
                             motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-300"
                >
                  <span className="font-fredoka text-3xl font-bold text-orange mb-2">
                    {card.number}
                  </span>
                  <h3 className="font-fredoka font-bold text-lg mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                    {card.text}
                  </p>
                  {card.to ? (
                    <Link
                      to={card.to}
                      className="text-sm font-bold text-darkgreen hover:underline self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/40 rounded"
                    >
                      {card.cta} →
                    </Link>
                  ) : (
                    <a
                      href={card.href}
                      className="text-sm font-bold text-darkgreen hover:underline self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/40 rounded"
                    >
                      {card.cta} →
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* JUNTE-SE A NÓS (MASCOTE) */}
      <section
        ref={mascotSectionRef}
        className="bg-darkgreen py-16 md:py-24 px-6 overflow-hidden"
      >
        <div
          className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${containerMax}`}
        >
          <img
            ref={mascotRef}
            src={MascoteDentinho}
            alt=""
            aria-hidden="true"
            className="w-50 md:w-80 shrink-0"
          />
          <Reveal className="text-center md:text-left md:flex-1 min-w-0">
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Vista a capa de herói do sorriso
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl">
              Seja voluntário, doe ou compartilhe a causa. Cada gesto ajuda a
              Turma do Bem a chegar mais longe.
            </p>
            <Link
              to="/voluntario"
              className={`${btnPrimaryOnDark} px-10 py-4 text-lg`}
            >
              Quero Ajudar
            </Link>
          </Reveal>
        </div>
      </section>

      {/*  DOCUMENTÁRIO  */}
      <section className="bg-white py-20 md:py-28 px-6">
        <span className={sectionLabel}>Veja de Perto</span>
        <h2 className={`${sectionTitle} mb-12 md:mb-16 max-w-2xl mx-auto`}>
          O Impacto em Movimento
        </h2>

        <Reveal className={containerMax} y={48}>
          <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-black/5">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/YtdglTuuOyI"
              title="Documentário sobre o impacto social da Turma do Bem"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </Reveal>
      </section>

      {/* CTA FINAL*/}
      <section id="cta" className=" pt-4 pb-24 px-6">
        <Reveal className={containerMax}>
          <div
            className="min-h-[300px] md:h-[322px] bg-orange flex flex-col md:flex-row
              justify-center md:justify-between items-center rounded-3xl p-10 shadow-xl
              motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-300"
          >
            <div className="bg-white mb-8 md:mb-0 md:mr-10 h-[180px] w-[180px] md:h-[90%] md:w-[30%] rounded-full flex justify-center items-center order-first md:order-last">
              <img
                src={TdbLogo}
                alt="Logo Turma do Bem"
                className="w-[130px] md:w-[250px] object-contain"
              />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="md:ml-10 text-[1.8rem] md:text-[2rem] font-bold text-white leading-tight text-balance">
                Seu sorriso importa. <br /> Peça ajuda agora.
              </h2>
              <Link
                to="/contato"
                className={`${btnBase} md:ml-10 mt-8 py-[10px] px-10 lg:px-[118px] bg-darkgreen text-white w-full md:w-auto motion-safe:hover:-translate-y-1 hover:bg-darkgreen/90 focus-visible:ring-white/70 focus-visible:ring-offset-orange`}
              >
                Pedir Ajuda
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;
