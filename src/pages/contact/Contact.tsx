import ContactForm from "./Form/ContactForm";
import { GoogleMapEmbed } from "../../components/legal/GoogleMapEmbed";
import Dentinho from "../../assets/img/dentinhoContato.webp";

const Contact = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative min-h-[500px] lg:h-[605px] bg-orange-strong flex flex-col lg:flex-row gap-8 lg:gap-20 justify-center items-center px-6 pt-10 lg:pt-0">
        <h1 className="animate-rise-in text-white text-shadow-contrast text-3xl md:text-5xl lg:text-[4rem] font-fredoka font-bold text-center max-w-[680px] z-10 lg:mb-20">
          Inclusão Social Através do Sorriso
        </h1>

        <img
          src={Dentinho}
          alt="Mascote dentinho"
          className="
      animate-scale-in
      z-10
      block
      self-center
      mt-auto
      max-w-[480px]
      md:max-w-[600px]

      lg:self-end
      lg:max-w-[635px]
      lg:mt-0
    "
        />
      </section>
      <section className="flex flex-col items-center px-4 py-14 lg:py-32">
        <h2 className="animate-rise-in text-darkgreen text-3xl md:text-4xl lg:text-[3rem] font-fredoka font-bold text-center max-w-[800px] mb-14 lg:mb-32">
          Precisa de Ajuda? Estamos Aqui para Você!
        </h2>

        <ContactForm />

      </section>
      
      <article
        className="mx-auto max-w-[900px] px-6 py-20 lg:py-32"
        aria-label="informações-de-contato"
      >
        <h3 className="animate-rise-in text-3xl md:text-4xl lg:text-[3rem] font-fredoka font-bold mb-12 text-center md:text-left">
          Turma do Bem
        </h3>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[60px] items-center">
          <div className="animate-scale-in w-full lg:w-[500px] h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-lg">
            <GoogleMapEmbed />
          </div>

          <div className="flex flex-col gap-6 text-black font-sans">
            <div>
              <span className="font-bold block text-sm uppercase text-gray-700">
                Endereço
              </span>
              <p className="max-w-[350px]">
                Rua Maurício Francisco Klabin, 449 Vila Mariana, São Paulo - SP,
                04120-020
              </p>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray-700">
                Telefone
              </span>
              <p>55 11 5084-7276</p>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray-700">
                Presidente
              </span>
              <a
                href="mailto:turmadobem@tdb.org.br"
                className="text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50 focus-visible:ring-offset-2"
              >
                turmadobem@tdb.org.br
              </a>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray-700">
                Comunicação
              </span>
              <a
                href="mailto:comunicacao@tdb.org.br"
                className="text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50 focus-visible:ring-offset-2"
              >
                comunicacao@tdb.org.br
              </a>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray-700">
                Dúvidas, Críticas ou Sugestões
              </span>
              <a
                href="mailto:faleconosco@tdb.org.br"
                className="text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50 focus-visible:ring-offset-2"
              >
                faleconosco@tdb.org.br
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Contact;
