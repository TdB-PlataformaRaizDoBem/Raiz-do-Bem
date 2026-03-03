import React from "react";
import { teamMembers } from "./TeamMembers"; 
import DentinhoIntegrantes from "../../assets/img/dentinhoIntegrantes.png";
import LinkedinIcon from "../../assets/svgs/mdi_linkedin_2.svg";
import GithubIcon from "../../assets/svgs/mdi_github.svg";

const Team = () => {
  const sectionTitle = "text-center font-title text-white font-bold";
  const socialIcon = "h-[60px] w-[60px] md:h-[80px] md:w-[80px] transition-transform duration-200 hover:scale-105 mx-[10px]";

  return (
    <section aria-labelledby="integrantes" className="overflow-x-hidden bg-white">
      
      {/* HERO SECTION */}
      <div className="relative w-full overflow-hidden h-[510px] sm:h-[700px] md:h-[820px] lg:h-[850px]">
        <div 
          className="bg-amber w-full h-[770px] max-[599px]:h-[510px] md:h-[820px] lg:h-[870px]"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 60%, 0 100%)" }} 
        >
          <h1 id="integrantes" className={`${sectionTitle} pt-[100px] text-[4rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[6rem]`}>
            Integrantes
          </h1>
        </div>
        
        <img 
          src={DentinhoIntegrantes} 
          alt="Mascote receptivo" 
          className="absolute z-1 left-1/2 -translate-x-1/2 top-[60%] -translate-y-[40%] 
                     w-[310px] sm:w-[500px] md:w-[650px] lg:w-[850px]"
        />
      </div>

      {/* INTEGRANTES */}
      <section className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-[40px] md:gap-[105px] my-[100px] md:my-[300px] px-6">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <img 
              src={member.image} 
              alt={member.alt} 
              className="w-[210px] sm:w-[160px] md:w-[200px] lg:w-[300px] h-auto rounded-lg" 
            />
            
            <div className="mt-4">
              <div className="flex justify-center mb-4">
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <img src={LinkedinIcon} alt="LinkedIn" className={socialIcon} />
                </a>
                <a href={member.github} target="_blank" rel="noopener noreferrer">
                  <img src={GithubIcon} alt="Github" className={socialIcon} />
                </a>
              </div>
              
              <span className="block font-bold text-[1.125rem] md:text-[2rem] py-[15px] leading-tight">
                {member.name}
              </span>
              <p className="text-[1rem] md:text-[1.5rem] text-gray-800">
                {member.rm}
              </p>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
};

export default Team;