import {
  stats,
  culture_values,
  proposal,
  type StatItem,
  type CultureItem,
  type ProposalItem,
} from "./aboutData";

// Imports de Imagens
import DentinhoRegando from "../../assets/img/dentinhoRegando.png";
import ImgAboutTdb from "../../assets/img/img-about-tdb.png";
import DentistaDoBem2 from "../../assets/img/dentistaDoBem2.png";
import Apolonia2 from "../../assets/img/Apolonia2.png";
import Abstract2 from "../../assets/svgs/abstract2.svg";
import Abstract3 from "../../assets/svgs/abstract3.svg";
import UnionLeft from "../../assets/svgs/Union2.svg";
import UnionRight from "../../assets/svgs/Union.svg";

const About = () => {

  const sectionTitle = "text-center font-title text-3xl md:text-5xl lg:text-[4rem] font-bold";
  const containerMax = "max-w-[1240px] mx-auto";
  const cardProgram = "bg-orange rounded-t-[8px] w-full max-w-[573px] lg:h-[615px] flex flex-col relative p-6 pb-20 z-10 shadow-lg";
  const textWhiteBase = "text-white text-base md:text-[1.2rem] leading-relaxed";

  return (
    <div className="bg-darkgreen min-h-screen overflow-x-hidden">
      
      {/* TOP-HERO */}
      <section className="flex flex-col lg:flex-row items-center justify-center py-20 lg:py-[136px] px-6 lg:px-[100px] gap-10">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-title font-bold text-white leading-tight">
            Raiz do Bem:
          </h1>
          <p className="text-amber font-title text-xl md:text-2xl lg:text-[1.5rem] font-bold mb-6 lg:mb-[30px]">
            tecnologia que floresce em cuidados e sorrisos.
          </p>
          <p className={`${textWhiteBase} max-w-[610px] mx-auto lg:mx-0`}>
            A Raiz do Bem nasceu para integrar em um só espaço os programas da
            Turma do Bem, facilitando o acesso a triagens, atendimentos e
            acompanhamento digital. Nosso propósito é simples: usar a tecnologia
            como raiz para espalhar cuidado, esperança e dignidade.
          </p>
        </div>
        <div className="w-full max-w-[600px] lg:max-w-[850px]">
          <img src={DentinhoRegando} alt="Mascote" className="w-full h-auto object-contain" />
        </div>
      </section>

      <div id="wrapper" className="bg-white rounded-t-[40px] md:rounded-t-[100px]">
        
        {/* SOBRE A TDB */}
        <article className="py-16 md:py-[162px] px-6">
          <h2 className={`${sectionTitle} mb-10 md:mb-[76px]`}>Sobre a Turma do Bem</h2>
          
          <div className={`flex flex-col lg:flex-row bg-cream rounded-2xl items-stretch gap-8 lg:gap-[57px] overflow-hidden ${containerMax}`}>
            <div className="w-full lg:w-1/2">
              <img src={ImgAboutTdb} alt="Sobre TdB" className="w-full h-full object-cover min-h-[300px]" />
            </div>
            <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-0 flex flex-col justify-center lg:pr-10">
              <div className="text-base md:text-[1.25rem] leading-relaxed">
                <p className="mb-5">
                  A Raiz do Bem é uma plataforma digital criada para fortalecer a missão da Turma do Bem. Nosso objetivo é integrar em um só lugar triagens, cadastros e atendimentos, garantindo que cada sorriso seja cuidado com transparência, carinho e eficiência.
                </p>
                <p>
                  Assim como a TdB revolucionou o acesso à odontologia por meio do voluntariado, a Raiz do Bem inova ao levar essa experiência para o mundo digital, conectando pacientes, dentistas voluntários e gestão.
                </p>
              </div>
            </div>
          </div>

          {/* ESTATÍSTICAS */}
          <section className="mt-20 md:mt-[70px] relative">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row justify-center gap-10 lg:gap-[70px] text-center">
              {stats.map((item: StatItem, i: number) => (
                <li key={i} className="flex flex-col items-center">
                  <span className="text-5xl md:text-7xl lg:text-[6rem] font-bold block text-darkgreen">{item.value}</span>
                  <p className="text-base md:text-[1.25rem] font-semibold max-w-[200px]">{item.label}</p>
                </li>
              ))}
            </ul>
            <div className={`hidden lg:block mt-[75px] h-[5px] bg-darkgreen rounded-[10px] ${containerMax}`} />
          </section>
        </article>

        {/* PROGRAMAS */}
        <article className="pb-20 px-6 overflow-hidden lg:overflow-visible">
          <h3 className={`${sectionTitle} py-16 lg:py-[136px] max-w-[590px] mx-auto leading-tight`}>
            Programas da Turma do Bem
          </h3>

          <section className="relative flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-10 lg:gap-[90px] max-w-[1400px] mx-auto">
            {/* Decorações em SVGs */}
            <img src={UnionLeft} alt="" className="hidden lg:block absolute z-0 pointer-events-none w-[698px] h-[482px] top-[80px] left-[calc(50%-550px)]" />
            <img src={UnionRight} alt="" className="hidden lg:block absolute z-0 pointer-events-none w-[356px] h-[356px] top-[-80px] right-[calc(50%-650px)]" />

            {/* Card 1 */}
            <div className={cardProgram}>
              <img src={DentistaDoBem2} alt="Dentista" className="w-full h-auto rounded-lg object-cover mx-auto mt-[1px]" />
              <h4 className="text-white text-2xl md:text-[2rem] font-bold my-6 text-left">Dentistas do Bem</h4>
              <p className="text-white text-sm md:text-base text-left max-w-[522px]">
                O Dentista do Bem é o principal programa da TdB, e conta com o trabalho voluntário de cirurgiões-dentistas que atendem em seu próprio consultório crianças e jovens em situação de vulnerabilidade social entre 11 e 17 anos, proporcionando tratamento odontológico gratuito até que completem 18 anos.
              </p>
              <img src={Abstract2} className="absolute bottom-0 left-0 w-full" alt="" />
            </div>

            {/* Card 2 */}
            <div className={cardProgram}>
              <img src={Apolonia2} alt="Apolonia" className="w-full h-auto rounded-lg object-cover mx-auto mt-[1px]" />
              <h4 className="text-white text-2xl md:text-[2rem] font-bold my-6 text-left">Apolônias do Bem</h4>
              <p className="text-white text-sm md:text-base text-left max-w-[522px]">
                O Apolônias do Bem oferece tratamento odontológico integral e gratuito às mulheres cis e trans que vivenciaram situações de violência e tiveram a dentição afetada durante as agressões.
              </p>
              <img src={Abstract3} className="absolute bottom-0 left-0 w-full" alt="" />
            </div>
          </section>
        </article>

        {/* CULTURA */}
        <section className="bg-cream py-20 lg:py-[130px] mt-20">
          <h5 className={`${sectionTitle} mb-16 lg:mb-[93px]`}>Cultura Organizacional</h5>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-[100px] px-6 max-w-[1400px] mx-auto">
            {culture_values.map((item: CultureItem, i: number) => (
              <div key={i} className="bg-darkgreen w-full sm:w-[300px] sm:h-[300px] p-8 sm:p-0 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-amber text-2xl md:text-[2rem] font-bold">{item.title}</span>
                {item.list ? (
                  <ul className="text-white mt-5 space-y-2">
                    {item.list.map((v, j) => <li key={j} className="text-sm md:text-base">{v}</li>)}
                  </ul>
                ) : (
                  <p className="text-white px-4 mt-5 text-sm md:text-base leading-relaxed">{item.text}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* NASCIMENTO DA RAIZ */}
        <article className="max-w-[1256px] mx-auto mt-[163px] pb-[163px] px-6 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden bg-cream shadow-sm">
            <div className="bg-darkgreen p-10 md:p-12 lg:p-[60px] flex flex-col justify-center">
              <h6 className="font-title text-[2rem] font-bold text-white mb-6">Como Nasceu a Raiz do Bem</h6>
              <p className="text-white text-base md:text-lg leading-relaxed">
                Durante a jornada da Turma do Bem, percebemos que muitas etapas poderiam ser facilitadas digitalmente, tornando o acesso mais rápido e a gestão mais clara. A ideia da plataforma surgiu da vontade de transformar tecnologia em cuidado, garantindo que os programas da TdB cheguem ainda mais longe.
              </p>
            </div>
            <div className="p-10 md:p-12 lg:p-[80px] flex flex-col justify-center">
              <h6 className="font-title font-bold text-[2rem] text-black mb-10">Nossa Proposta</h6>
              <ul className="space-y-6">
                {proposal.map((prop: ProposalItem, i: number) => (
                  <li key={i} className="flex items-start gap-5">
                    <img src={prop.icon} alt="" className="w-8 h-8 flex-shrink-0" />
                    <p className="text-black"><span className="font-bold">{prop.span}</span> {prop.text}</p>
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