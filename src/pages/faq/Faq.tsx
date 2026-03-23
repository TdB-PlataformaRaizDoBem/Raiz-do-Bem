import { faqCategories, type FaqCategory, type FaqItem } from "./faqData";
import MascoteFaq from "../../assets/img/mascote.png";
import { Link } from "react-router-dom";

const Faq = () => {
  const lineDecorator =
    "before:content-[''] before:flex-1 before:h-[5px] before:bg-darkgreen before:rounded-[10px] before:mt-[30px] after:content-[''] after:flex-1 after:h-[5px] after:bg-darkgreen after:rounded-[10px] after:mt-[30px]";

  const summaryBase =
    "list-none cursor-pointer relative pr-[25px] font-bold text-black after:content-['+'] after:absolute after:right-0 after:font-bold after:text-[1.2rem] after:transition-transform after:duration-300";

  return (
    <div className="bg-white">
      <section
        className="mx-5 my-[100px] md:mx-[100px] md:my-[110px]"
        aria-labelledby="perguntas-frequentes"
      >
        <h1
          id="perguntas-frequentes"
          className="text-center text-3xl md:text-[3rem] font-title font-bold mb-[100px] md:mb-[110px] max-w-[320px] md:max-w-full mx-auto"
        >
          Perguntas Frequentes
        </h1>

        {faqCategories.map((category: FaqCategory, i: number) => (
          <section key={i} className="mb-[120px]">
            <h2
              className={`text-center text-2xl md:text-[2.5rem] font-bold flex gap-4 md:gap-[60px] mb-[60px] items-start 
              ${lineDecorator} before:hidden md:before:block after:hidden md:after:block`}
            >
              {category.title}
            </h2>

            <div className="container-faq">
              {category.questions.map((item: FaqItem, i: number) => (
                <details
                  key={i}
                  className="group border-t border-black/70 py-[30px] last:border-bottom last:border-b last:border-black/70"
                >
                  <summary
                    className={`${summaryBase} group-open:after:content-['–']`}
                  >
                    {item.q}
                  </summary>
                  <p className="pt-[15px] text-base md:text-lg">{item.r}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </section>

      {/* SEÇÃO CONTATO */}
      <section
        className="flex flex-col lg:flex-row gap-10 lg:gap-[40px] xl:gap-[80px] justify-center items-center lg:items-end px-5 md:px-[100px] pb-0"
        aria-labelledby="entre-em-contato"
      >
        <img
          src={MascoteFaq}
          alt="Mascote Dentinho"
          className="order-1 lg:order-none w-full max-w-[350px] md:max-w-[500px] lg:max-w-[450px] xl:max-w-[700px] object-contain block"
        />

        <div className="flex-1 max-w-[560px] text-center lg:text-left flex flex-col justify-center mb-10 lg:mb-[100px]">
          <span className="text-lg md:text-[1.25rem] text-gray-600">
            Você Tem Mais Perguntas?
          </span>
          <h3
            id="entre-em-contato"
            className="text-2xl md:text-[2rem] font-bold my-[15px] leading-tight"
          >
            Entre em Contato
          </h3>
          <p className="text-base md:text-[1.125rem] leading-relaxed mb-6">
            Nossa equipe de atendimento ao cliente está aqui para ajudar ou e
            apoiá-lo durante toda a sua jornada com a TdB. Você pode nos ligar,
            enviar um WhatsApp ou e-mail.
          </p>

          <Link
            to="/contato"
            className="bg-orange text-white w-full max-w-[260px] md:max-w-[300px] lg:max-w-[220px] h-[40px] rounded-lg flex items-center justify-center font-medium transition-colors hover:bg-[#e57e0f] mx-auto lg:mx-0"
          >
            Contate-Nos
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Faq;
