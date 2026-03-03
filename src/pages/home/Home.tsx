import React from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/layout/Header";


import BrasilImg from "../../assets/img/brasil.png";
import DentistaDoBemImg from "../../assets/img/dentistaDoBem2.png";
import ApoloniaImg from "../../assets/img/Apolonia2.png";
import Abstract1 from "../../assets/svgs/abstract1.svg";
import Abstract2 from "../../assets/svgs/abstract2.svg";
import Abstract3 from "../../assets/svgs/abstract3.svg";
import IconPeople from "../../assets/svgs/ic_round-people.svg";
import IconWoman from "../../assets/svgs/picon_woman.svg";
import IconDoctor from "../../assets/svgs/doctor.png";
import HeroBg from "../../assets/img/Component.png";
import TdbLogo from "../../assets/svgs/TDB_logo.svg";


const BtnBase = "transition-all duration-300 active:scale-95 shadow-lg flex items-center justify-center font-bold text-white rounded-lg";
const BtnOrange = `${BtnBase} bg-orange hover:bg-[#e07c1c] hover:-translate-y-1`;

const CardProgram = "bg-black/40 rounded-lg p-4 max-w-[500px] flex flex-col shadow-md transition-transform hover:scale-[1.02]";
const CardStats = "bg-darkgreen rounded-lg p-8 flex flex-col items-center justify-center text-center gap-4 shadow-md transition-colors hover:bg-darkgreen/90";


const stats_content = [
  { icon: IconPeople, text: "+85 mil jovens atendidos" },
  { icon: IconWoman, text: "1.2 mil mulheres atendidas" },
  { icon: IconDoctor, text: "18 mil dentistas voluntários" },
];

const programs_content = [
  { img: DentistaDoBemImg, title: "Dentistas do Bem", abstract: Abstract2 },
  { img: ApoloniaImg, title: "Apolônia do Bem", abstract: Abstract3 },
];

const Home = () => {
  return (
    <>
      <Header />
      <main className="w-full">
        
        {/* TOP-HERO */}
        <section
          className="relative w-full h-[30vh] md:h-[50vh] lg:h-[70vh] xl:h-[80vh] bg-no-repeat bg-top"
          style={{ backgroundImage: `url(${HeroBg})`, backgroundSize: "100% auto" }}
        />

        {/* DOAÇÃO */}
        <section className="relative w-full pt-12 md:pt-24 pb-24 px-4">
          <div className="container mx-auto flex flex-col items-center">
            <h1 className="text-center text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
              Inclusão Social Através do <span className="text-darkgreen">Sorriso</span>
            </h1>

            <div className="mt-24 w-full grid grid-cols-1 md:grid-cols-2 bg-gray-300/70 rounded-lg overflow-hidden shadow-xl">
              <div className="bg-darkgreen p-12 flex flex-col items-center justify-center text-center">
                <p className="text-white text-lg font-bold mb-4">Milhões de jovens sem acesso a cuidados básicos.</p>
                <p className="text-white mb-8 font-medium">Doe hoje para que eles possam sorrir.</p>
                <Link to="/sobre" className={`${BtnOrange} px-12 py-3`}>Saiba Mais</Link>
              </div>

              <div className="p-8 flex flex-col items-center gap-8 text-center">
                <h2 className="text-3xl font-bold text-darkgreen">Sua Ajuda Faz A Diferença</h2>
                <span className="max-w-[80%] text-[1.1rem]">Formulário de doação seguro abaixo.</span>
                <a href="#" className={`${BtnOrange} px-12 py-5 text-2xl rounded-xl`}>Doar Agora!</a>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAMAS E STATS */}
        <section className="bg-cream py-24 px-4">
          <div className="container mx-auto flex flex-col items-center">
            <h2 className="text-center text-4xl md:text-5xl font-bold max-w-4xl mb-20 leading-tight">
              Acesso a um Sorriso Saudável pelo Mundo!
            </h2>

            <div className="bg-orange w-full rounded-lg p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="flex flex-col items-center">
                <article className="bg-black/40 rounded-lg p-4 w-full max-w-md">
                  <img src={BrasilImg} alt="Brasil" className="w-full rounded" />
                  <p className="text-white font-bold mt-4 uppercase">Brasil</p>
                  <img src={Abstract1} className="w-full mt-4" alt="" />
                </article>
                <p className="mt-6 bg-darkgreen text-white font-bold px-6 py-3 rounded-lg">PRESENTE EM 12 PAÍSES</p>
              </div>

              <div className="flex flex-col gap-6 w-full items-center">
                {programs_content.map((prog, idx) => (
                  <article key={idx} className={CardProgram}>
                    <img src={prog.img} alt={prog.title} className="rounded" />
                    <p className="text-white font-semibold mt-2 px-2">{prog.title}</p>
                    <img src={prog.abstract} className="w-full mt-2" alt="" />
                  </article>
                ))}
              </div>
            </div>

            {/* MAP DE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24 mb-12 w-full">
              {stats_content.map((stat, idx) => (
                <div key={idx} className={CardStats}>
                  <img src={stat.icon} alt="" className="w-12" />
                  <p className="text-white font-semibold text-lg">{stat.text}</p>
                </div>
              ))}
            </div>

            <Link to="/contato" className={`${BtnOrange} px-12 py-4 text-lg`}>
              Seja um Dentista Voluntário
            </Link>
          </div>
        </section>

        {/* DOCUMENTÁRIO */}
        <article id="documentary" className="flex justify-center bg-white py-10 px-4">
          <div className="w-full max-w-[1030px]">
            <iframe 
              width="100%" height="600" 
              src="https://www.youtube.com/embed/YtdglTuuOyI" 
              className="rounded-lg shadow-md"
              allowFullScreen
            />
          </div>
        </article>

        {/* CTA FINAL */}
        <section id="cta" className="w-full bg-white pt-10 pb-[137px] px-4">
          <div className="mx-auto w-full max-w-[1030px] min-h-[300px] md:h-[322px] bg-orange flex flex-col md:flex-row justify-center md:justify-between items-center rounded-lg p-10 shadow-xl">
            <div className="bg-white mb-8 md:mb-0 md:mr-10 h-[180px] w-[180px] md:h-[90%] md:w-[30%] rounded-full flex justify-center items-center order-first md:order-last">
              <img src={TdbLogo} alt="Logo" className="w-[130px] md:w-[250px] object-contain" />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="md:ml-10 text-[1.8rem] md:text-[2rem] font-bold text-white leading-tight">
                Seu sorriso importa. <br /> Peça ajuda agora.
              </h4>
              <Link to="/contato" className="md:ml-10 mt-8 py-[10px] px-10 lg:px-[118px] bg-darkgreen rounded-lg text-white font-bold w-full md:w-auto">
                Pedir Ajuda
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default Home;