import {
  stats,
  culture_values,
  proposal,
  type StatItem,
  type CultureItem,
  type ProposalItem,
} from "./aboutData";

import DentinhoRegando from "../../assets/img/dentinhoRegando.png";
import ImgAboutTdb     from "../../assets/img/img-about-tdb.png";
import DentistaDoBem2  from "../../assets/img/dentistaDoBem2.png";
import Apolonia2       from "../../assets/img/Apolonia2.png";
import Abstract2       from "../../assets/svgs/abstract2.svg";
import Abstract3       from "../../assets/svgs/abstract3.svg";
import UnionLeft       from "../../assets/svgs/Union2.svg";
import UnionRight      from "../../assets/svgs/Union.svg";

const About = () => {
  const sectionLabel = "text-[10px] uppercase tracking-[0.2em] text-darkgreen/60 font-bold mb-2 block text-center";
  const sectionTitle = "text-center font-fredoka text-3xl md:text-5xl lg:text-[4rem] font-bold";
  const containerMax = "max-w-[1240px] mx-auto";

  return (
    <div className="bg-darkgreen min-h-screen overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row items-center justify-center py-20 lg:py-[136px] px-6 lg:px-[100px] gap-10">
        <div className="text-center lg:text-left max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-lightgreen/70 font-bold mb-3">
            Nossa Plataforma
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-fredoka font-bold text-white leading-tight mb-3">
            Raiz do Bem:
          </h1>
          <p className="text-amber font-fredoka text-xl md:text-2xl lg:text-[1.5rem] font-bold mb-6">
            tecnologia que floresce em cuidados e sorrisos.
          </p>
          <p className="text-white/85 text-base md:text-[1.1rem] leading-relaxed">
            A Raiz do Bem nasceu para integrar em um só espaço os programas da Turma
            do Bem, facilitando o acesso a triagens, atendimentos e acompanhamento
            digital. Nosso propósito é simples: usar a tecnologia como raiz para
            espalhar cuidado, esperança e dignidade.
          </p>
        </div>
        <div className="w-full max-w-[500px] lg:max-w-[750px] shrink-0">
          <img
            src={DentinhoRegando}
            alt="Mascote da Raiz do Bem regando uma planta"
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* ── WRAPPER BRANCO ────────────────────────────────────────────── */}
      <div id="wrapper" className="bg-white rounded-t-[40px] md:rounded-t-[80px]">

        {/* ── SOBRE A TDB ────────────────────────────────────────────── */}
        <article className="py-16 md:py-[120px] px-6">
          <span className={sectionLabel}>Nossa Origem</span>
          <h2 className={`${sectionTitle} mb-10 md:mb-16`}>Sobre a Turma do Bem</h2>

          <div className={`flex flex-col lg:flex-row bg-cream rounded-3xl items-stretch gap-0 overflow-hidden ${containerMax}`}>
            <div className="w-full lg:w-1/2 min-h-[260px]">
              <img
                src={ImgAboutTdb}
                alt="Turma do Bem em ação"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <p className="text-base md:text-[1.1rem] leading-relaxed text-gray-700 mb-5">
                A Raiz do Bem é uma plataforma digital criada para fortalecer a missão
                da Turma do Bem. Nosso objetivo é integrar em um só lugar triagens,
                cadastros e atendimentos, garantindo que cada sorriso seja cuidado com
                transparência, carinho e eficiência.
              </p>
              <p className="text-base md:text-[1.1rem] leading-relaxed text-gray-700">
                Assim como a TdB revolucionou o acesso à odontologia por meio do
                voluntariado, a Raiz do Bem inova ao levar essa experiência para o
                mundo digital, conectando pacientes, dentistas voluntários e gestão.
              </p>
            </div>
          </div>

          {/* ESTATÍSTICAS */}
          <section className="mt-20 md:mt-[70px] relative" aria-label="Números de impacto">
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
              {stats.map((item: StatItem, i: number) => (
                <li key={i} className="flex flex-col items-center gap-2 animate-fade-slide-in">
                  <span className="font-fredoka text-5xl md:text-7xl font-bold text-darkgreen block">
                    {item.value}
                  </span>
                  <p className="text-sm md:text-base font-semibold text-gray-600 max-w-[180px] leading-snug">
                    {item.label}
                  </p>
                </li>
              ))}
            </ul>
            <div className={`hidden lg:block mt-16 h-[4px] bg-gradient-to-r from-transparent via-darkgreen to-transparent rounded-full ${containerMax}`} />
          </section>
        </article>

        {/* ── PROGRAMAS ──────────────────────────────────────────────── */}
        <article className="pb-20 px-6 overflow-hidden lg:overflow-visible">
          <span className={sectionLabel}>Iniciativas</span>
          <h3 className={`${sectionTitle} py-8 lg:py-16 max-w-[590px] mx-auto leading-tight`}>
            Programas da Turma do Bem
          </h3>

          <section className="relative flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-10 lg:gap-[90px] max-w-[1400px] mx-auto">
            {/* Decorações */}
            <img src={UnionLeft}  alt="" aria-hidden="true" className="hidden lg:block absolute z-0 pointer-events-none w-[698px] h-[482px] top-[80px] left-[calc(50%-550px)]" />
            <img src={UnionRight} alt="" aria-hidden="true" className="hidden lg:block absolute z-0 pointer-events-none w-[356px] h-[356px] top-[-80px] right-[calc(50%-650px)]" />

            {/* Card Dentistas do Bem */}
            <div className="bg-orange rounded-3xl w-full max-w-[560px] flex flex-col relative p-6 pb-20 z-10 shadow-lg overflow-hidden">
              <img
                src={DentistaDoBem2}
                alt="Dentistas do Bem"
                className="w-full rounded-2xl object-cover"
              />
              <h4 className="text-white font-fredoka text-2xl md:text-[2rem] font-bold my-5">
                Dentistas do Bem
              </h4>
              <p className="text-white text-sm md:text-base leading-relaxed max-w-[522px]">
                O Dentista do Bem é o principal programa da TdB, contando com o trabalho
                voluntário de cirurgiões-dentistas que atendem crianças e jovens em situação
                de vulnerabilidade social entre 11 e 17 anos, proporcionando tratamento
                odontológico gratuito até que completem 18 anos.
              </p>
              <img src={Abstract2} className="absolute bottom-0 left-0 w-full" alt="" aria-hidden="true" />
            </div>

            {/* Card Apolônias do Bem */}
            <div className="bg-orange rounded-3xl w-full max-w-[560px] flex flex-col relative p-6 pb-20 z-10 shadow-lg overflow-hidden">
              <img
                src={Apolonia2}
                alt="Apolônias do Bem"
                className="w-full rounded-2xl object-cover"
              />
              <h4 className="text-white font-fredoka text-2xl md:text-[2rem] font-bold my-5">
                Apolônias do Bem
              </h4>
              <p className="text-white text-sm md:text-base leading-relaxed max-w-[522px]">
                O Apolônias do Bem oferece tratamento odontológico integral e gratuito às
                mulheres cis e trans que vivenciaram situações de violência e tiveram a
                dentição afetada durante as agressões.
              </p>
              <img src={Abstract3} className="absolute bottom-0 left-0 w-full" alt="" aria-hidden="true" />
            </div>
          </section>
        </article>

        {/* ── CULTURA ────────────────────────────────────────────────── */}
        <section className="bg-cream py-20 lg:py-[120px] mt-10" aria-labelledby="cultura-heading">
          <span className={sectionLabel}>Nossos Princípios</span>
          <h2 id="cultura-heading" className={`${sectionTitle} mb-14 lg:mb-20`}>
            Cultura Organizacional
          </h2>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10 px-6 max-w-[1400px] mx-auto">
            {culture_values.map((item: CultureItem, i: number) => (
              <div
                key={i}
                className="
                  bg-white border border-gray-100 border-t-4 border-t-darkgreen
                  w-full sm:w-[300px] min-h-[220px] p-8 rounded-3xl
                  flex flex-col items-center justify-center text-center
                  shadow-sm motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-200
                "
              >
                <span className="text-darkgreen text-2xl md:text-[2rem] font-fredoka font-bold mb-4">
                  {item.title}
                </span>
                {item.list ? (
                  <ul className="space-y-1.5">
                    {item.list.map((v, j) => (
                      <li key={j} className="text-sm md:text-base text-gray-600">{v}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── COMO NASCEU ────────────────────────────────────────────── */}
        <article className={`${containerMax} mt-20 md:mt-[120px] pb-[120px] px-6 lg:px-0`}>
          <span className={`${sectionLabel} mb-6`}>Nossa Jornada</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="bg-darkgreen p-10 md:p-14 flex flex-col justify-center">
              <h2 className="font-fredoka text-2xl md:text-[2rem] font-bold text-white mb-5">
                Como Nasceu a Raiz do Bem
              </h2>
              <p className="text-white/85 text-base md:text-lg leading-relaxed">
                Durante a jornada da Turma do Bem, percebemos que muitas etapas poderiam
                ser facilitadas digitalmente, tornando o acesso mais rápido e a gestão
                mais clara. A ideia da plataforma surgiu da vontade de transformar
                tecnologia em cuidado, garantindo que os programas da TdB cheguem ainda
                mais longe.
              </p>
            </div>
            <div className="bg-cream p-10 md:p-14 flex flex-col justify-center">
              <h2 className="font-fredoka font-bold text-2xl md:text-[2rem] text-black mb-8">
                Nossa Proposta
              </h2>
              <ul className="space-y-5">
                {proposal.map((prop: ProposalItem, i: number) => (
                  <li key={i} className="flex items-start gap-4">
                    <img src={prop.icon} alt="" aria-hidden="true" className="w-7 h-7 shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      <span className="font-bold text-black">{prop.span}</span>{" "}{prop.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

      </div>
    </div>
  );
};

export default About;
