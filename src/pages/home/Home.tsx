import { Link } from "react-router-dom";

import HeroPhoto from "../../assets/img/hero-dentista-exame.jpg";
import VoluntariosImg from "../../assets/img/voluntarios-atendimento.jpg";
import CriancasImg from "../../assets/img/criancas-escovando-dentes.jpg";
import DentistaDoBemImg from "../../assets/img/dentistaDoBem2.png";
import ApoloniaImg from "../../assets/img/Apolonia2.png";
import MascoteDentinho from "../../assets/svgs/mascote-dentinho.svg";
import Abstract2 from "../../assets/svgs/abstract2.svg";
import Abstract3 from "../../assets/svgs/abstract3.svg";
import TdbLogo from "../../assets/svgs/TDB_logo.svg";

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

const impact_stats = [
  { value: "12", label: "Países sendo atendidos" },
  { value: "85 mil", label: "Jovens com sorrisos restaurados" },
  { value: "1,2 mil", label: "Mulheres vítimas de agressão atendidas" },
  { value: "18,5 mil", label: "Dentistas voluntários engajados" },
];

const stories = [
  "Uma criança que aprende a sorrir sem vergonha, um atendimento por vez.",
  "Uma mulher que recupera a própria voz, um cuidado por vez.",
  "Um dentista voluntário que multiplica esperança, um gesto por vez.",
];

const programs_content = [
  {
    img: DentistaDoBemImg,
    title: "Dentistas do Bem",
    abstract: Abstract2,
    text: "Cirurgiões-dentistas voluntários oferecem tratamento odontológico gratuito a crianças e jovens em situação de vulnerabilidade social.",
  },
  {
    img: ApoloniaImg,
    title: "Apolônia do Bem",
    abstract: Abstract3,
    text: "Tratamento odontológico integral e gratuito para mulheres cis e trans que tiveram a dentição afetada por situações de violência.",
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
  return (
    <div className="w-full overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative w-full">
        <div className="relative w-full h-[62vh] sm:h-[70vh] md:h-[85vh] md:min-h-[640px]">
          <img
            src={HeroPhoto}
            alt="Dentista voluntário da Turma do Bem examina os dentes de uma criança atendida"
            className="absolute inset-0 w-full h-full object-cover object-[38%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkgreen/90 via-darkgreen/10 to-transparent md:hidden" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-darkgreen/90 via-darkgreen/25 to-transparent" />

          <div className="relative z-10 h-full container mx-auto px-6 flex flex-col justify-end md:justify-center pb-10 md:pb-0">
            <p className="uppercase tracking-[0.25em] text-[11px] md:text-xs font-bold text-lightgreen mb-4">
              Turma do Bem · Raiz do Bem
            </p>
            <h1 className="font-fredoka font-bold text-white uppercase leading-[0.92] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] max-w-3xl text-balance">
              Um sorriso <span className="text-amber">que transforma</span>
            </h1>
          </div>

          {/* Card flutuante — somente desktop */}
          <div className="hidden md:block absolute right-10 lg:right-20 bottom-14 lg:bottom-20 z-20 bg-white rounded-2xl shadow-2xl p-8 max-w-sm">
            <p className="text-gray-700 leading-relaxed">
              Há mais de duas décadas, uma rede de dentistas voluntários devolve
              sorrisos e dignidade a quem mais precisa — no Brasil e em outros
              11 países.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#ajudar" className={`${btnPrimaryOnLight} px-6 py-3 text-sm`}>
                Doar Agora
              </a>
              <Link to="/sobre" className={`${btnOutlineOnLight} px-6 py-3 text-sm`}>
                Saiba Mais
              </Link>
            </div>
          </div>
        </div>

        {/* Pitch — somente mobile */}
        <div className="md:hidden bg-darkgreen px-6 py-10">
          <p className="text-white/85 leading-relaxed mb-6">
            Há mais de duas décadas, uma rede de dentistas voluntários devolve
            sorrisos e dignidade a quem mais precisa — no Brasil e em outros 11
            países.
          </p>
          <div className="flex flex-col gap-3">
            <a href="#ajudar" className={`${btnPrimaryOnDark} px-8 py-3.5 text-base`}>
              Doar Agora
            </a>
            <Link to="/sobre" className={`${btnSecondaryOnDark} px-8 py-3.5 text-base`}>
              Saiba Mais
            </Link>
          </div>
        </div>
      </section>

      {/* ── HISTÓRIAS ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28 px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${containerMax}`}>
          <div>
            <span className={`${sectionLabel} text-left`}>Nossa Missão</span>
            <p className="font-fredoka font-bold text-3xl md:text-4xl lg:text-5xl leading-snug text-balance mb-10">
              Por trás de cada consulta, existe{" "}
              <span className="text-darkgreen">uma história</span> sendo
              transformada.
            </p>
            <div className="space-y-6">
              {stories.map((story, idx) => (
                <p
                  key={idx}
                  className="border-l-4 border-orange pl-5 text-base md:text-lg text-gray-700 leading-relaxed"
                >
                  {story}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg h-72 lg:h-full">
            <img
              src={CriancasImg}
              alt="Duas crianças escovando os dentes juntas, aprendendo hábitos de higiene bucal"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── IMPACTO ──────────────────────────────────────────────────── */}
      <section className="bg-cream py-20 md:py-28 px-6">
        <span className={sectionLabel}>Nosso Impacto</span>
        <h2 className={`${sectionTitle} mb-14 md:mb-16 max-w-3xl mx-auto`}>
          Acesso a um Sorriso Saudável pelo Mundo
        </h2>
        <ul className={`grid grid-cols-2 lg:grid-cols-4 gap-10 text-center ${containerMax}`}>
          {impact_stats.map((item, i) => (
            <li key={i} className="flex flex-col items-center gap-2">
              <span className="font-fredoka text-4xl md:text-6xl font-bold text-darkgreen block">
                {item.value}
              </span>
              <p className="text-sm md:text-base font-semibold text-gray-600 max-w-[180px] leading-snug">
                {item.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── PROGRAMAS (BENTO) ────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28 px-6">
        <span className={sectionLabel}>Iniciativas</span>
        <h2 className={`${sectionTitle} mb-14 md:mb-16 max-w-2xl mx-auto`}>
          Programas da Turma do Bem
        </h2>

        <div className={`flex flex-col lg:flex-row justify-center gap-8 lg:gap-10 ${containerMax}`}>
          {programs_content.map((prog, idx) => (
            <article
              key={idx}
              className="bg-orange rounded-3xl w-full flex flex-col relative p-6 pb-20 z-10 shadow-lg overflow-hidden
                         motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-300"
            >
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
          ))}
        </div>
      </section>

      {/* ── COMO AJUDAR ──────────────────────────────────────────────── */}
      <section id="ajudar" className="bg-cream py-20 md:py-28 px-6">
        <span className={sectionLabel}>Como Ajudar</span>
        <h2 className={`${sectionTitle} mb-14 md:mb-16 max-w-2xl mx-auto`}>
          Escolha seu Jeito de Transformar Vidas
        </h2>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch ${containerMax}`}>
          <div className="rounded-3xl overflow-hidden shadow-lg min-h-[280px]">
            <img
              src={VoluntariosImg}
              alt="Equipe de voluntários realizando atendimento odontológico"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {help_cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm flex flex-col
                           motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-300"
              >
                <span className="font-fredoka text-3xl font-bold text-orange mb-2">
                  {card.number}
                </span>
                <h3 className="font-fredoka font-bold text-lg mb-2">{card.title}</h3>
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
            ))}
          </div>
        </div>
      </section>

      {/* ── JUNTE-SE A NÓS (MASCOTE) ─────────────────────────────────── */}
      <section className="bg-darkgreen py-16 md:py-24 px-6 overflow-hidden">
        <div className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${containerMax}`}>
          <img
            src={MascoteDentinho}
            alt=""
            aria-hidden="true"
            className="w-40 md:w-56 shrink-0 motion-safe:hover:-rotate-3 motion-safe:transition-transform duration-300"
          />
          <div className="text-center md:text-left">
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Vista a capa de herói do sorriso
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl">
              Seja voluntário, doe ou compartilhe a causa. Cada gesto ajuda a
              Turma do Bem a chegar mais longe.
            </p>
            <Link to="/voluntario" className={`${btnPrimaryOnDark} px-10 py-4 text-lg`}>
              Quero Ajudar
            </Link>
          </div>
        </div>
      </section>

      {/* ── DOCUMENTÁRIO ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28 px-6">
        <span className={sectionLabel}>Veja de Perto</span>
        <h2 className={`${sectionTitle} mb-12 md:mb-16 max-w-2xl mx-auto`}>
          O Impacto em Movimento
        </h2>

        <div className={containerMax}>
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
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section id="cta" className="bg-cream pt-4 pb-24 px-6">
        <div
          className={`
            ${containerMax} min-h-[300px] md:h-[322px] bg-orange flex flex-col md:flex-row
            justify-center md:justify-between items-center rounded-3xl p-10 shadow-xl
            motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-300
          `}
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
      </section>
    </div>
  );
};

export default Home;
