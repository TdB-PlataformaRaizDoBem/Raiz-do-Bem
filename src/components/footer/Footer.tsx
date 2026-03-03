import React from "react";
import { Link } from "react-router-dom";

import TdbLogo from "../../assets/svgs/TDB_logo.svg";
import IconFB from "../../assets/svgs/ic_baseline-facebook.png";
import IconX from "../../assets/svgs/X.svg";
import IconInsta from "../../assets/svgs/mdi_instagram.svg";
import IconLinkedin from "../../assets/svgs/mdi_linkedin.svg";
import IconYT from "../../assets/svgs/mdi_youtube.png";

const Footer = () => {
  const social_links = [
    { href: "https://facebook.com/...", icon: IconFB, alt: "facebook" },
    { href: "https://x.com/...", icon: IconX, alt: "X" },
    { href: "https://instagram.com/...", icon: IconInsta, alt: "instagram" },
    { href: "https://linkedin.com/...", icon: IconLinkedin, alt: "linkedin" },
    { href: "https://youtube.com/...", icon: IconYT, alt: "youtube" },
  ];

  const footer_links = [
    {
      title: "Tome uma Atitude",
      links: [
        { label: "Doar", to: "/" },
        { label: "Seja Voluntário", to: "/seja-voluntario" },
        { label: "Preciso de Ajuda", to: "/contato" },
      ],
    },
    {
      title: "Sobre Nós",
      links: [
        { label: "Início", to: "/" },
        { label: "Nossa História", to: "/about" },
        { label: "Integrantes", to: "/integrantes" },
        { label: "FAQ", to: "/faq" },
      ],
    },
  ];

  const contact_emails = [
    { label: "Presidente", email: "turmadobem@tdb.org.br" },
    { label: "Comunicação", email: "comunicacao@tdb.org.br" },
    {
      label: "Dúvidas, Críticas ou Sugestões:",
      email: "faleconosco@tdb.org.br",
    },
  ];

  const TitleStyle = "text-[1.2rem] font-bold text-left block mb-[15px] ";
  const ListStyle = "list-none p-0 m-0";

  return (
    <footer
      aria-label="rodapé"
      className="w-full mx-auto bg-cream px-2 py-[50px] md:px-[100px]"
    >
      <div className="container mx-auto">
        <div className="mx-auto flex flex-col md:flex-row justify-between items-start gap-12 flex-wrap">
          <section aria-labelledby="social-midia">
            <span className={TitleStyle} id="social-midia">
              Redes Sociais
            </span>
            <nav>
              <ul className="flex gap-5 list-none p-0">
                {social_links.map((social, idx) => (
                  <li key={idx}>
                    <a href={social.href} target="_blank" rel="noreferrer">
                      <img
                        src={social.icon}
                        alt={social.alt}
                        className="w-12 h-12 object-contain"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className="flex flex-wrap gap-12 lg:gap-[60px]">
            {footer_links.map((section, idx) => (
              <div key={idx}>
                <span className={TitleStyle}>{section.title}</span>
                <nav>
                  <ul className={ListStyle}>
                    {section.links.map((link, lIdx) => (
                      <li key={lIdx} className="py-[5px]">
                        <Link to={link.to} className="hover:underline">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}

            <div className="max-w-full">
              <span className={TitleStyle}>Contato</span>
              <p className="py-[5px]">Fone: 55 11 5084-7276</p>
              <p className="py-[5px] max-w-[400px] leading-relaxed">
                Rua Maurício Francisco Klabin, 449 - Vila Mariana, São Paulo -
                SP, 04120-020
              </p>
              <ul className={`${ListStyle} mt-4`}>
                {contact_emails.map((contact, idx) => (
                  <li key={idx} className="mb-4">
                    <span className="font-semibold text-[1.125rem]">{contact.label}</span>
                    <br />
                    <a
                      href={`mailto:${contact.email}`}
                      className="underline text-black break-all"
                    >
                      {contact.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <img
          src={TdbLogo}
          alt="Turma do Bem Logo"
          className="pt-[50px] block w-full max-w-[1030px] mx-auto opacity-90"
        />

        {/* COPY */}
        <div className="mt-20 pt-8">
          <p className="text-center text-gray-600 italic">
            © 2025 Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
