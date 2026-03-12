import React from "react";
import { Button } from "../../components/ui/Button";
import { FilterBar } from "../../components/ui/FilterBar";
import {
  coordenadoresData,
  type Coordenador,
} from "../../data/coordenadoresData";
import UserCard from "../../components/userCard/UserCard";
import UserInformation from "../../components/userInformation/UserInformation";
import UserActions from "../../components/userActions/UserActions";

const Coordenador = () => {
  const [selectedCoord, setSelectedCoord] = React.useState<Coordenador | null>(
    null,
  );

  React.useEffect(() => {
    const handleScrollLock = () => {
      const isModalMode = window.innerWidth < 1280;
      if (selectedCoord && isModalMode) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    };
    handleScrollLock();
    window.addEventListener("resize", handleScrollLock);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("resize", handleScrollLock);
    };
  }, [selectedCoord]);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 lg:px-8">
      <FilterBar
        searchLabel="Opções e Filtros:"
        searchPlaceholder="Pesquisar coordenador..."
      >
        <Button>Todos</Button>
        <Button>Criar Conta</Button>
      </FilterBar>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-8 items-start">
        <div className="flex flex-col gap-4 w-full max-w-[650px] mx-auto xl:mx-0">
          {coordenadoresData.map((u) => (
            <UserCard
              key={u.id}
              className={`
                transition-all duration-300 ease-in-out
                ${
                  selectedCoord?.id === u.id
                    ? "shadow-[0_0_15px_-3px_rgba(152,251,152,0.4)] transform scale-[1.03]"
                    : "hover:shadow-sm"
                }`}
            >
              <div className="flex flex-col gap-4 justify-center">
                <p className="text-lg lg:text-xl font-bold text-darkgray leading-tight break-words">
                  {u.nome}
                </p>
                <p className="text-sm text-gray-500 font-medium">{u.email}</p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end justify-between lg:h-full py-1">
                <p className="text-[10px] lg:text-xs uppercase tracking-wider text-gray-400 font-bold">
                  {u.cidade} - {u.estado}
                </p>
                <Button
                  onClick={() => setSelectedCoord(u)}
                  className="bg-darkgreen hover:bg-green-800 w-full lg:w-auto text-xs py-2 px-4"
                >
                  Visualizar Conta
                </Button>
              </div>
            </UserCard>
          ))}
        </div>

        <div className="flex flex-col gap-4 xl:sticky xl:top-24 h-fit">
          {selectedCoord && (
            <>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                onClick={() => setSelectedCoord(null)}
              />

              <div
                className={`
                  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                  w-[92%] lg:w-[40%] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2x
                  xl:static xl:translate-x-0 xl:translate-y-0 xl:w-full xl:max-h-none 
                  xl:shadow-none xl:border xl:border-gray-100 xl:bg-transparent xl:overflow-visible
                  animate-in fade-in zoom-in-95 duration-200
                `}
              >
                <UserInformation>
                  <div className="flex flex-col mb-6 relative">
                    <span className="font-bold text-2xl text-darkgray">
                      {selectedCoord.nome}
                    </span>
                    <div className="h-1 w-20 bg-darkgreen mt-2 rounded-full" />
                  </div>

                  <section className="flex flex-col gap-3">
                    <h4 className="text-sm uppercase tracking-widest text-gray-400 font-bold mt-4">
                      Informações Pessoais
                    </h4>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-sm">
                        <b>Email:</b> {selectedCoord.email}
                      </p>
                      <p className="text-sm">
                        <b>Data de Contratação:</b>{" "}
                        {selectedCoord.data_contratacao}
                      </p>
                    </div>
                  </section>

                  <section className="flex flex-col gap-3 mb-6">
                    <h4 className="text-sm uppercase tracking-widest text-gray-400 font-bold mt-6">
                      Endereço
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-sm">
                        <b>Logradouro:</b> {selectedCoord.logradouro},{" "}
                        {selectedCoord.numero}
                      </p>
                      <p className="text-sm">
                        <b>Cidade:</b> {selectedCoord.cidade}
                      </p>
                      <p className="text-sm">
                        <b>Estado:</b> {selectedCoord.estado}
                      </p>
                      <p className="text-sm">
                        <b>CEP:</b> {selectedCoord.cep}
                      </p>
                    </div>
                  </section>

                  <UserActions>
                    <div className="flex gap-4 items-center">
                      <Button
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => console.log("Deletar", selectedCoord.id)}
                      >
                        Deletar Coordenador
                      </Button>
                      <Button onClick={() => setSelectedCoord(null)}>
                        Fechar
                      </Button>
                    </div>
                  </UserActions>
                </UserInformation>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coordenador;