import { Link } from "react-router-dom";

import { CONTROLADOR } from "../../domain/legal/organizacao";
import { useCookieConsent } from "../../context/cookieConsent";

import TdbLogo    from "../../assets/svgs/TDB_logo.svg";
import IconFB     from "../../assets/svgs/ic_baseline-facebook.png";
import IconX      from "../../assets/svgs/X.svg";
import IconInsta  from "../../assets/svgs/mdi_instagram.svg";
import IconLinked from "../../assets/svgs/mdi_linkedin.svg";
import IconYT     from "../../assets/svgs/mdi_youtube.png";

const Footer = () => {
  const year = new Date().getFullYear();
  const { reabrir } = useCookieConsent();

  const social_links = [
    { href: "https://www.facebook.com/turmadobem/?locale=pt_BR", icon: IconFB,     alt: "Facebook da Turma do Bem" },
    { href: "https://x.com/turmadobem",                          icon: IconX,      alt: "X (Twitter) da Turma do Bem" },
    { href: "https://www.instagram.com/ongturmadobem/?hl=pt",    icon: IconInsta,  alt: "Instagram da Turma do Bem" },
    { href: "https://www.linkedin.com/company/turma-do-bem/",    icon: IconLinked, alt: "LinkedIn da Turma do Bem" },
    { href: "https://www.youtube.com/user/turmadobem",           icon: IconYT,     alt: "YouTube da Turma do Bem" },
  ];

  const footer_links = [
    {
      title: "Tome uma Atitude",
      links: [
        { label: "Seja Voluntário",   to: "/voluntario" },
        { label: "Preciso de Ajuda",  to: "/contato" },
      ],
    },
    {
      title: "Sobre Nós",
      links: [
        { label: "Início",          to: "/" },
        { label: "Nossa História",  to: "/sobre" },
        { label: "Integrantes",     to: "/integrantes" },
        { label: "FAQ",             to: "/faq" },
      ],
    },
  ];

  const privacy_links = [
    { label: "Política de Privacidade",        to: "/privacidade" },
    { label: "Termo: Pedido de ajuda",         to: "/consentimento/pedido-de-ajuda" },
    { label: "Termo: Dentista voluntário",     to: "/consentimento/voluntario" },
  ];

  const contact_emails = CONTROLADOR.contatos.map((c) => ({ label: c.rotulo, email: c.email }));

  return (
    <footer aria-label="Rodapé" className="w-full bg-cream px-4 py-14 md:px-[80px]">
      <div className="max-w-[1200px] mx-auto">

        {/* Corpo do footer */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 flex-wrap">

          {/* Redes sociais */}
          <section aria-labelledby="footer-social">
            <span id="footer-social" className="text-[1.1rem] font-bold block mb-4">
              Redes Sociais
            </span>
            <nav aria-label="Redes sociais da Turma do Bem">
              <ul className="flex gap-4 list-none p-0">
                {social_links.map((social, idx) => (
                  <li key={idx}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.alt}
                      className="block motion-safe:hover:scale-110 motion-safe:transition-transform duration-150"
                    >
                      <img
                        src={social.icon}
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 object-contain"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Links de navegação */}
          <section className="flex flex-wrap gap-10 lg:gap-14">
            {footer_links.map((section, idx) => (
              <div key={idx}>
                <span className="text-[1.1rem] font-bold block mb-4">{section.title}</span>
                <nav aria-label={section.title}>
                  <ul className="space-y-2 list-none p-0">
                    {section.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link
                          to={link.to}
                          className="text-gray-700 text-sm hover:text-darkgreen motion-safe:transition-colors duration-150 hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}

            {/* Privacidade (LGPD) */}
            <div>
              <span className="text-[1.1rem] font-bold block mb-4">Privacidade</span>
              <nav aria-label="Privacidade e termos">
                <ul className="space-y-2 list-none p-0">
                  {privacy_links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-gray-700 text-sm hover:text-darkgreen motion-safe:transition-colors duration-150 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={reabrir}
                      className="text-gray-700 text-sm hover:text-darkgreen motion-safe:transition-colors duration-150 hover:underline text-left"
                    >
                      Preferências de cookies
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Contato */}
            <div>
              <span className="text-[1.1rem] font-bold block mb-4">Contato</span>
              <p className="text-sm text-gray-700 mb-1">Fone: {CONTROLADOR.telefone}</p>
              <p className="text-sm text-gray-700 max-w-[280px] leading-relaxed mb-4">
                {CONTROLADOR.endereco}
              </p>
              <ul className="space-y-3 list-none p-0">
                {contact_emails.map((contact, idx) => (
                  <li key={idx}>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {contact.label}
                    </span>
                    <br />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-darkgreen hover:underline break-all"
                    >
                      {contact.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Logo central */}
        <div className="mt-14 flex justify-center">
          <img
            src={TdbLogo}
            alt="Turma do Bem"
            width={120}
            height={60}
            loading="lazy"
            decoding="async"
            className="w-full max-w-[400px] h-auto opacity-80"
          />
        </div>

        {/* Divider + copyright */}
        <hr className="border-lightgreen/30 mt-10 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <p className="text-xs text-gray-700 italic">
            © {year} Turma do Bem — Todos os direitos reservados
          </p>
          <p className="text-xs text-gray-700">
            Projeto Acadêmico · FIAP {year}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
