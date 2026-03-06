import ContactForm from "./Form/ContactForm";
import Dentinho from "../../assets/img/dentinhoContato.png";

const Contact = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative min-h-[500px] lg:h-[605px] bg-orange flex flex-col lg:flex-row gap-8 lg:gap-20 justify-center items-center px-6 pt-10 lg:pt-0">
        <h1 className="text-white text-3xl md:text-5xl lg:text-[4rem] font-fredoka font-bold text-center max-w-[680px] z-10 lg:mb-20">
          Inclusão Social Através do Sorriso
        </h1>

        <img
          src={Dentinho}
          alt="Mascote dentinho"
          className="
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
        <h2 className="text-darkgreen text-3xl md:text-4xl lg:text-[3rem] font-fredoka font-bold text-center max-w-[800px] mb-14 lg:mb-32">
          Precisa de Ajuda? Estamos Aqui para Você!
        </h2>

        <ContactForm />

      </section>
      
      <article
        className="mx-auto max-w-[900px] px-6 py-20 lg:py-32"
        aria-label="informações-de-contato"
      >
        <h3 className="text-3xl md:text-4xl lg:text-[3rem] font-fredoka font-bold mb-12 text-center md:text-left">
          Turma do Bem
        </h3>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[60px] items-center">
          <div className="w-full lg:w-[500px] h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.402206778434!2d-46.6341499!3d-23.5905244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5a37456d68b9%3A0x6a6d6d8d6d6d6d6d!2sRua%20Maur%C3%ADcio%20Francisco%20Klabin%2C%20449!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="flex flex-col gap-6 text-black font-sans">
            <div>
              <span className="font-bold block text-sm uppercase text-gray">
                Endereço
              </span>
              <p className="max-w-[350px]">
                Rua Maurício Francisco Klabin, 449 Vila Mariana, São Paulo - SP,
                04120-020
              </p>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray">
                Telefone
              </span>
              <p>55 11 5084-7276</p>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray">
                Presidente
              </span>
              <a
                href="mailto:turmadobem@tdb.org.br"
                className="text-orange hover:underline"
              >
                turmadobem@tdb.org.br
              </a>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray">
                Comunicação
              </span>
              <a
                href="mailto:comunicacao@tdb.org.br"
                className="text-orange hover:underline"
              >
                comunicacao@tdb.org.br
              </a>
            </div>

            <div>
              <span className="font-bold block text-sm uppercase text-gray">
                Dúvidas, Críticas ou Sugestões
              </span>
              <a
                href="mailto:faleconosco@tdb.org.br"
                className="text-orange hover:underline"
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
