import VoluntaryForm from "./form/VoluntaryForm";
import DentistaImg from "../../assets/img/dentistaConfiante.png"


const Voluntary = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <section className="mx-auto mt-8 max-w-[1800px] min-h-[500px] lg:h-[650px] flex flex-col lg:flex-row items-center justify-around gap-10 px-6 lg:px-20 rounded-xl bg-gradient-to-b from-[#006a4e] via-[#059871] to-[#038f6a] overflow-hidden">
        
        <div className="max-w-[655px] text-center lg:text-left pt-10 lg:pt-0 z-10">
          <h1 className="font-fredoka text-white text-3xl md:text-5xl lg:text-[4rem] font-bold leading-tight mb-6">
            Seja um Dentista Voluntário
          </h1>
          <p className="text-white text-lg md:text-xl max-w-[600px] mx-auto lg:mx-0">
            Ser voluntário na Turma do Bem é muito mais do que doar seu tempo — é plantar cuidado, empatia e esperança em cada sorriso que nasce de um gesto simples, mas transformador.
          </p>
          
          <a 
            href="#form-voluntario" 
            className="inline-block mt-12 lg:mt-20 w-[290px] h-[50px] bg-orange text-white text-lg font-bold rounded-lg text-center leading-[50px] transition-transform hover:scale-105 active:scale-95"
          >
            Cadastre-se
          </a>
        </div>

        <img 
          src={DentistaImg} 
          alt="Dentista confiante sorrindo" 
          className="max-h-[400px] md:max-h-[600px] lg:max-h-[710px] self-end object-contain z-10"
        />
      </section>

      <section id="form-voluntario" className="flex flex-col items-center px-4 py-20 lg:py-32">
        <h2 className="text-darkgreen text-3xl md:text-4xl lg:text-[3rem] font-fredoka font-bold text-center">
          Preencha seus dados profissionais
        </h2>
        
        <VoluntaryForm />
      </section>
    </div>
  )
}

export default Voluntary