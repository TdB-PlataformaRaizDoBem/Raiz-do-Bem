import { teamMembers } from "./TeamMembers";
import DentinhoIntegrantes from "../../assets/img/dentinhoIntegrantes.png";
import LinkedinIcon from "../../assets/svgs/mdi_linkedin_2.svg";
import GithubIcon from "../../assets/svgs/mdi_github.svg";

const Team = () => {
  return (
    <section aria-labelledby="integrantes" className="overflow-x-hidden bg-white">

      <div className="relative w-full overflow-hidden h-[460px] sm:h-[640px] md:h-[780px] lg:h-[820px]">
        <div
          className="bg-amber w-full h-full"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 60%, 0 100%)" }}
        >
          <div className="pt-[80px] md:pt-[100px] text-center px-6">
            <h1
              id="integrantes"
              className="font-fredoka font-bold text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-none"
            >
              Quem Faz Acontecer
            </h1>
            <p className="text-white/80 font-medium mt-4 text-base md:text-lg">
              Conheça o time por trás da plataforma
            </p>
          </div>
        </div>

        <img
          src={DentinhoIntegrantes}
          alt=""
          aria-hidden="true"
          className="absolute z-10 left-1/2 -translate-x-1/2 top-[60%] -translate-y-[40%]
                     w-[280px] sm:w-[460px] md:w-[600px] lg:w-[800px]"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <article
              key={index}
              className="
                bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden
                flex flex-col
                motion-safe:hover:-translate-y-1 motion-safe:transition-transform duration-200
              "
            >
              {/* Foto */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.alt}
                  className="w-full h-full object-cover object-top"
                />
                {/* Badge de papel sobreposto na foto */}
                <span className="absolute bottom-3 left-3 bg-white/90 text-darkgreen text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  {member.role}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                  <h2 className="font-fredoka font-bold text-xl text-black leading-tight">
                    {member.name}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {member.turma} · {member.rm}
                  </p>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                  {member.bio}
                </p>

                {/* Skills chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {member.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-lightgreen/10 text-darkgreen text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Links sociais */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-darkgreen motion-safe:transition-colors duration-150 font-medium"
                  >
                    <img src={LinkedinIcon} alt="" aria-hidden="true" className="w-5 h-5" />
                    LinkedIn
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub de ${member.name}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-darkgreen motion-safe:transition-colors duration-150 font-medium"
                  >
                    <img src={GithubIcon} alt="" aria-hidden="true" className="w-5 h-5" />
                    GitHub
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
