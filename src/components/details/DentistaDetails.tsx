import { excluirDentista } from "../../services/DentistaService";
import type { DentistaViewModel } from "../../domain/mappers/DentistaMapper";
import { formatCPF, formatPhone } from "../../utils/formatUtils";
import { Link } from "react-router-dom";
import { buildGlobalChatUrl } from "../../utils/Chatutils";
import UserInformation from "../userInformation/UserInformation";
import UserActions from "../userActions/UserActions";
import { Button } from "../ui/Button";
import DeleteUserButton from "../ui/buttonFilters/DeleteUserButton";
import EditDentistaButton from "../ui/buttonFilters/EditDentistaButton";
import { Section, ColLabel } from "./Section";

type DentistaDetailsProps = {
  data: DentistaViewModel;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

export const DentistaDetails = ({
  data,
  isAdmin,
  onClose,
  onDeleted,
  onUpdated,
}: DentistaDetailsProps) => (
  <UserInformation>
    <div className="flex flex-col max-h-[90vh] md:max-h-[85vh] w-full">
      <div className="flex-1 overflow-y-auto pb-24 p-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="flex justify-between items-start mb-6 pb-5 border-b border-gray-100">
          <div>
            <h3 className="text-3xl font-bold text-darkgray font-fredoka">
              {data.nomeCompleto}
            </h3>
            <div className="h-1.5 w-20 mt-1 bg-amber" />
          </div>
          <div className="text-right shrink-0 ml-4">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">ID:</span>
            <span className="text-lg font-mono font-bold text-darkgray">#{data.id}</span>
          </div>
        </div>

        <div className="flex gap-6 items-center bg-gray-50 p-4 rounded-xl mb-6">
          <div>
            <p className="text-xs font-black uppercase text-gray-400">Categoria</p>
            <p className="font-bold text-darkgreen">{data.categoria}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs font-black uppercase text-gray-400">Disponibilidade</p>
            <p className="font-bold text-darkgray">{data.disponibilidadeLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <ColLabel>Dados Profissionais</ColLabel>
            <Section
              variant="muted"
              items={[
                { label: "Especialidade", value: data.especialidades },
                { label: "CRO", value: data.croDentista },
                { label: "CPF", value: formatCPF(data.cpf) },
                { label: "Sexo", value: data.sexoLabel },
              ]}
            />
          </div>

          <div className="flex flex-col gap-4">
            <ColLabel>Contato & Consultório</ColLabel>
            <Section
              variant="default"
              items={[
                { label: "E-mail", value: data.email, valueClass: "break-all" },
                {
                  label: "Telefone",
                  value: (
                    <>
                      <p className="text-darkgray font-medium">{formatPhone(data.telefone)}</p>
                      {data.telefone && (
                        <Link
                          to={buildGlobalChatUrl(data.telefone)}
                          onClick={onClose}
                          className="mt-1.5 text-xs text-darkgreen font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <path
                              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Iniciar conversa
                        </Link>
                      )}
                    </>
                  ),
                },
              ]}
            />
            <Section variant="accent" title="Endereço do Consultório">
              <p className="text-darkgray leading-relaxed">
                {data.logradouro ?? "Não informado"}{data.numero ? `, ${data.numero}` : ""}
                <br />
                {data.cidade ?? "Não informado"}{data.estado ? ` - ${data.estado}` : ""}
              </p>
            </Section>
          </div>
        </div>
      </div>

      <UserActions>
        <div className="flex flex-wrap md:flex-nowrap gap-3 justify-end w-full">
          {isAdmin && (
            <DeleteUserButton
              userName={data.nomeCompleto}
              onConfirm={async () => {
                await excluirDentista(data.cpf);
                onClose();
                onDeleted();
              }}
            />
          )}
          <EditDentistaButton user={data} onUpdated={onUpdated} />
          <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none">
            Fechar
          </Button>
        </div>
      </UserActions>
    </div>
  </UserInformation>
);
