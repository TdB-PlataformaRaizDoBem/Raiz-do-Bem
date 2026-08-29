import { Link } from "react-router-dom";

import DentistaDoBemImg from "../../assets/img/dentistaDoBem2.png";
import ApoloniaImg from "../../assets/img/Apolonia2.png";
import CrowdImg from "../../assets/img/Component.png";
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
const btnPrimaryOnLight = `${btnBase} bg-orange text-white shadow-lg hover:bg-[#e07c1c] motion-safe:hover:-translate-y-1 focus-visible:ring-orange/60 focus-visible:ring-offset-white`;

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

const Home = () => {
  return (
    <div className="w-full overflow-x-hidden">
      {/* ── TOP HERO — FOTO ──────────────────────────────────────────── */}
      <section
        role="img"
        aria-label="Equipe de dentistas e voluntários da Turma do Bem reunidos"
        className="relative w-full h-[30vh] md:h-[50vh] lg:h-[70vh] xl:h-[80vh] bg-no-repeat bg-top"
        style={{ backgroundImage: `url(${CrowdImg})`, backgroundSize: "100% auto" }}
      />

      {/* ── HERO — TEXTO ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="container mx-auto px-6 pt-16 pb-16 md:pt-20 md:pb-20 flex flex-col items-center text-center">
          <p className="uppercase tracking-[0.2em] text-[11px] md:text-xs font-bold text-lightgreen mb-5">
            Turma do Bem · Raiz do Bem
          </p>
          <h1 className="font-fredoka font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] text-balance max-w-4xl">
            Inclusão social através do <span className="text-amber">sorriso</span>
          </h1>
          <p className="mt-6 font-fredoka text-amber text-xl md:text-2xl font-bold">
            Milhares de mãos, uma só missão
          </p>
          <p className="mt-4 text-base md:text-xl max-w-xl text-pretty">
            Uma rede de dentistas voluntários que doa tempo e talento para
            devolver sorrisos e dignidade a quem mais precisa, em todo o
            Brasil e em outros 11 países.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a href="#" className={`${btnPrimaryOnDark} px-10 py-4 text-lg`}>
              Doar Agora
            </a>
            <Link to="/sobre" className={`${btnPrimaryOnDark} px-10 py-4 text-lg`}>
              Saiba Mais
            </Link>
          </div>
        </div>
      </section>

      {/* ── WRAPPER BRANCO ────────────────────────────────────────────── */}
      <div className="bg-white rounded-t-[40px] md:rounded-t-[64px] relative z-10 pt-16 md:pt-20">

        {/* PROGRAMAS (BENTO) */}
        <section className="bg-cream py-20 md:py-28 px-6">
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

          <div className="flex justify-center mt-16">
            <Link to="/contato" className={`${btnPrimaryOnLight} px-12 py-4 text-lg`}>
              Seja um Dentista Voluntário
            </Link>
          </div>
        </section>

        {/* DOCUMENTÁRIO */}
        <section className="py-20 md:py-28 px-6">
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

        {/* CTA FINAL */}
        <section id="cta" className="pb-24 px-6">
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
    </div>
  );
};

export default Home;
